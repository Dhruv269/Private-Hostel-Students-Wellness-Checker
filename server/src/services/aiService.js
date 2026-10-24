/**
 * aiService.js - Provider Integration Service for Hosted Gemma Models
 * 
 * Encapsulates all provider-specific API logic using the official Google Gen AI SDK (@google/genai).
 * Ensures that API keys, raw client instances, and internal stack traces are isolated
 * within this service and never leaked to external route callers or frontend clients.
 */

import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { HOSTEL_WELLNESS_SYSTEM_PROMPT } from '../utils/systemPrompt.js';

let aiClientInstance = null;
let cachedKey = null;

/**
 * Returns a cached GoogleGenAI client instance or initializes a new one.
 * Validates that an API key is present before attempting requests.
 */
function getClient() {
  if (!config.isKeyConfigured) {
    const error = new Error('GEMINI_API_KEY is not configured or contains placeholder text. Please add a valid key to server/.env.');
    error.status = 503;
    error.isConfigError = true;
    throw error;
  }

  if (!aiClientInstance || cachedKey !== config.GEMINI_API_KEY) {
    aiClientInstance = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    cachedKey = config.GEMINI_API_KEY;
  }

  return aiClientInstance;
}

/**
 * Transforms standard application messages ({ role: 'user'|'assistant', content: string })
 * into the structured format required by the Google Gen AI API ({ role: 'user'|'model', parts: [{ text }] }).
 * 
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Array<{role: string, parts: Array<{text: string}>}>}
 */
function formatContentsForGemma(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content.trim() }]
  }));
}

/**
 * Generates a non-clinical, empathetic reflection reply using the configured Gemma model.
 * 
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} params.messages - Validated conversation history
 * @returns {Promise<{reply: string, model: string}>}
 */
export async function generateWellnessReply({ messages }) {
  // Enforce a 20-second timeout to prevent hanging connections
  const timeoutMs = 20000;
  let timerId;
  let timedOut = false;
  const abortController = new AbortController();

  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      timedOut = true;
      abortController.abort();
      const err = new Error('AI inference request timed out after 20 seconds. Please try again.');
      err.status = 504;
      err.isTimeout = true;
      reject(err);
    }, timeoutMs);
  });

  try {
    const client = getClient();
    const formattedContents = formatContentsForGemma(messages);

    const apiCallPromise = client.models.generateContent({
      model: config.GEMMA_MODEL_ID,
      contents: formattedContents,
      config: {
        systemInstruction: HOSTEL_WELLNESS_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 800,
        abortSignal: abortController.signal
      }
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    const replyText = response?.text?.trim();

    if (!replyText) {
      const candidate = response?.candidates?.[0];
      const finishReason = candidate?.finishReason;

      if (
        finishReason === 'SAFETY' ||
        finishReason === 'BLOCKLIST' ||
        finishReason === 'PROHIBITED_CONTENT' ||
        finishReason === 'SPII'
      ) {
        const safetyBlockError = new Error('The Gemma model could not generate a response due to content safety policies. Please rephrase your check-in.');
        safetyBlockError.status = 502;
        throw safetyBlockError;
      }

      const emptyError = new Error('Received an empty response from the Gemma model. Please try again.');
      emptyError.status = 502;
      throw emptyError;
    }

    return {
      reply: replyText,
      model: config.GEMMA_MODEL_ID
    };
  } catch (error) {
    // 1. Client configuration error (e.g. missing or placeholder GEMINI_API_KEY)
    if (error.isConfigError) {
      error.status = error.status || 503;
      throw error;
    }

    // 2. Timeout error (either our timer expired or client AbortError from timeout)
    if (timedOut || error.isTimeout || error.status === 504 || error.name === 'AbortError') {
      const timeoutError = new Error('AI inference request timed out after 20 seconds. Please try again.');
      timeoutError.status = 504;
      throw timeoutError;
    }

    // 3. Model safety policy block or empty response (our own generated 502 error)
    if (error.status === 502) {
      throw error;
    }

    // 4. Provider quota or rate limit exceeded (HTTP 429)
    const errorStr = `${error.message || ''} ${error.status || ''}`;
    if (error.status === 429 || errorStr.includes('RESOURCE_EXHAUSTED')) {
      const rateLimitError = new Error('AI provider rate limit or quota exceeded. Please wait a few moments and try again.');
      rateLimitError.status = 429;
      throw rateLimitError;
    }

    // 5. Upstream authentication / invalid API key (Google returned 400 with API_KEY_INVALID, or 401/403)
    if (
      error.status === 401 ||
      error.status === 403 ||
      (error.status === 400 && errorStr.includes('API_KEY')) ||
      errorStr.includes('PERMISSION_DENIED')
    ) {
      const authError = new Error('AI service authentication failed. Please check provider credentials in server/.env.');
      authError.status = 503;
      throw authError;
    }

    // 6. Upstream model not found (Google returned 404)
    if (error.status === 404 || errorStr.includes('NOT_FOUND')) {
      const notFoundError = new Error(`The configured Gemma model "${config.GEMMA_MODEL_ID}" was not found or is unavailable.`);
      notFoundError.status = 502;
      throw notFoundError;
    }

    // 7. Generic sanitized provider communication error (Never leaks API keys or internal stack traces)
    const sanitizedError = new Error('Failed to communicate with the hosted Gemma model. Please check provider access or try again shortly.');
    sanitizedError.status = 503;
    throw sanitizedError;
  } finally {
    clearTimeout(timerId);
  }
}
