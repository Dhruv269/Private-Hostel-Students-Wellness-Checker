/**
 * healthRoutes.js - Server Health & Configuration Diagnostic Endpoint
 * 
 * Provides a lightweight GET /api/health check for the frontend or monitoring tools.
 * Exposes NO secrets, passwords, or sensitive environment values.
 */

import express from 'express';
import { config } from '../config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    provider: 'google-genai',
    model: config.GEMMA_MODEL_ID,
    isConfigured: config.isKeyConfigured
  });
});

export default router;
