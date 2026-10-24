/**
 * chatRoutes.js - Wellness Chat API Endpoint (POST /api/chat)
 * 
 * Responsibilities:
 * - Request validation (message roles, array length, string length).
 * - Safety screening for acute crisis signals.
 * - Calling aiService with the verified Gemma model.
 * - Privacy protection: Chat messages are processed in memory and NEVER logged to disk or DB.
 */

import express from 'express';
import { generateWellnessReply } from '../services/aiService.js';
import { checkCrisisSafety } from '../utils/safetyFilter.js';
import { config } from '../config.js';

const router = express.Router();

const MAX_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 1000;
const ALLOWED_ROLES = new Set(['user', 'assistant']);

/**
 * Validates the incoming messages payload.
 * Returns an error message string if invalid, or null if valid.
 */
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return 'Invalid request: "messages" must be an array.';
  }

  if (messages.length === 0) {
    return 'Invalid request: "messages" array cannot be empty.';
  }

  if (messages.length > MAX_MESSAGES) {
    return `Invalid request: Exceeded maximum conversation history limit of ${MAX_MESSAGES} messages.`;
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (!msg || typeof msg !== 'object') {
      return `Invalid request: Message at index ${i} is not a valid object.`;
    }

    if (!ALLOWED_ROLES.has(msg.role)) {
      return `Invalid request: Message at index ${i} has unsupported role "${msg.role}". Allowed roles: "user", "assistant".`;
    }

    if (typeof msg.content !== 'string') {
      return `Invalid request: Message content at index ${i} must be a string.`;
    }

    const trimmed = msg.content.trim();
    if (trimmed.length === 0) {
      return `Invalid request: Message content at index ${i} cannot be empty.`;
    }

    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return `Invalid request: Message at index ${i} exceeds maximum length of ${MAX_CONTENT_LENGTH} characters.`;
    }
  }

  // The last message in the conversation must be from the user
  if (messages[messages.length - 1].role !== 'user') {
    return 'Invalid request: The most recent message must have role "user".';
  }

  return null;
}

router.post('/', async (req, res) => {
  const { messages } = req.body || {};

  // 1. Strict Input Validation
  const validationError = validateMessages(messages);
  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  // 2. Deterministic Safety Screening on the latest user message
  const latestMessage = messages[messages.length - 1].content;
  const crisisCheck = checkCrisisSafety(latestMessage);

  if (crisisCheck.isCrisis) {
    // Immediate crisis intervention response: do not wait for or risk AI hallucinations
    return res.status(200).json({
      reply: crisisCheck.response,
      model: config.GEMMA_MODEL_ID,
      safetyAlert: true,
      resources: crisisCheck.resources
    });
  }

  // 3. Inference Execution via aiService
  try {
    const aiResult = await generateWellnessReply({ messages });

    return res.status(200).json({
      reply: aiResult.reply,
      model: aiResult.model,
      safetyAlert: false
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      error: error.message || 'An error occurred while generating a response. Please try again.'
    });
  }
});

export default router;
