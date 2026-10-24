/**
 * index.js - HostelWell Backend Server Entrypoint
 * 
 * Configures:
 * - Express server with JSON payload limits (50kb).
 * - Restricted CORS matching the local frontend origin (CLIENT_URL).
 * - Rate limiting to prevent key quota abuse and spam.
 * - Health and Chat routes with non-clinical safety boundaries.
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import healthRoutes from './routes/healthRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// 1. Trust proxy headers (useful for rate-limiting behind local dev proxies)
app.set('trust proxy', 1);

// 2. Strict CORS policy: Allow only the configured frontend origin
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server tests)
    if (!origin || origin === config.CLIENT_URL) {
      callback(null, true);
    } else {
      const corsError = new Error(`CORS blocked: Origin "${origin}" is not authorized.`);
      corsError.status = 403;
      corsError.isCors = true;
      callback(corsError);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};
app.use(cors(corsOptions));

// 3. Payload size limiting (50kb is plenty for 10 short student messages)
app.use(express.json({ limit: '50kb' }));

// 4. Rate Limiter: 30 chat requests per 15-minute window per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please pause for a few minutes before checking in again.'
  }
});

// 5. Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);

// 6. 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// 7. Centralized Error Handler (Never returns stack traces or environment secrets)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'An internal server error occurred.'
  });
});

// 8. Start Listening
const server = app.listen(config.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌱 HostelWell Backend Server running`);
  console.log(`📡 URL: http://localhost:${config.PORT}`);
  console.log(`🔒 Allowed Client Origin: ${config.CLIENT_URL}`);
  console.log(`🤖 Configured Model: ${config.GEMMA_MODEL_ID}`);
  console.log(`🔑 Key Configured: ${config.isKeyConfigured ? 'Yes (Active)' : 'No (Requires GEMINI_API_KEY in server/.env)'}`);
  console.log(`======================================================\n`);
});

export { app, server };
