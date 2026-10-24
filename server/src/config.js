/**
 * config.js - Centralized Server Configuration
 * 
 * Safely loads environment variables from `server/.env`.
 * Enforces security rules:
 * - API keys are NEVER printed or logged.
 * - Confirms that only verified Gemma models are configured.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT, 10) || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Default candidate model verified for Google AI Developers / Gemini API hosted Gemma models
const DEFAULT_GEMMA_MODEL = 'gemma-4-26b-a4b-it';
const GEMMA_MODEL_ID = process.env.GEMMA_MODEL_ID || DEFAULT_GEMMA_MODEL;

// Strict rule: Gemma is mandatory. Verify model ID includes 'gemma'
if (!GEMMA_MODEL_ID.toLowerCase().includes('gemma')) {
  console.error(`\x1b[31m[CONFIG ERROR] Non-Gemma model requested: "${GEMMA_MODEL_ID}". Only Gemma family models are permitted by project rules.\x1b[0m`);
  process.exit(1);
}

// Safely determine if a non-placeholder API key is configured
const isKeyConfigured = Boolean(
  GEMINI_API_KEY && 
  GEMINI_API_KEY.trim() !== '' && 
  !GEMINI_API_KEY.includes('replace_with_your_own_key')
);

export const config = {
  PORT,
  CLIENT_URL,
  GEMINI_API_KEY,
  GEMMA_MODEL_ID,
  isKeyConfigured
};
