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

  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
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
  const client = getClient();
  const formattedContents = formatContentsForGemma(messages);

  // Enforce a 20-second timeout to prevent hanging connections
  const timeoutMs = 20000;
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error('AI inference request timed out after 20 seconds. Please try again.');
      err.status = 504;
      reject(err);
    }, timeoutMs);
  });

  try {
    const apiCallPromise = client.models.generateContent({
      model: config.GEMMA_MODEL_ID,
      contents: formattedContents,
      config: {
        systemInstruction: HOSTEL_WELLNESS_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    const replyText = response?.text?.trim();

    if (!replyText) {
      throw new Error('Received an empty response from the Gemma model.');
    }

    return {
      reply: replyText,
      model: config.GEMMA_MODEL_ID
    };
  } catch (error) {
    // Sanitize error messages: Never expose API keys or raw HTTP headers
    const sanitizedError = new Error(
      error.isConfigError || error.status === 504 
        ? error.message 
        : 'Failed to communicate with the hosted Gemma model. Please check provider access or try again shortly.'
    );
    sanitizedError.status = error.status || 500;
    throw sanitizedError;
  } finally {
    clearTimeout(timerId);
  }
}
