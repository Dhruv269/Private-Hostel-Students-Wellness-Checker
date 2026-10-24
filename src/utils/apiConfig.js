/**
 * apiConfig.js - Centralized API URL Resolution for HostelWell
 * 
 * Safely resolves the backend URL from the environment:
 * - In production (e.g. Vercel), reads `import.meta.env.VITE_API_BASE_URL`.
 * - In local development, falls back to `http://localhost:5002`.
 * - Normalizes trailing slashes and ensures the `/api` prefix is consistent.
 */

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const fallbackBaseUrl = 'http://localhost:5002';

// Clean trailing slashes
const cleanedBase = (rawBaseUrl || fallbackBaseUrl).replace(/\/+$/, '');

// Ensure /api prefix is present without duplication
export const API_BASE_URL = cleanedBase.endsWith('/api')
  ? cleanedBase
  : `${cleanedBase}/api`;

export const CHAT_API_URL = `${API_BASE_URL}/chat`;
export const HEALTH_API_URL = `${API_BASE_URL}/health`;

export const isLocalBackend = 
  cleanedBase.includes('localhost') || cleanedBase.includes('127.0.0.1');

export const BACKEND_DISPLAY_LABEL = isLocalBackend
  ? 'Local Port 5002'
  : 'Cloud Service';
