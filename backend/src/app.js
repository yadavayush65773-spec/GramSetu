import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

export function createApp() {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // 2. CORS configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/demo mode
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Demo-Role',
        'X-Demo-User-Id',
        'X-Request-Id',
        'X-Offline-Source',
      ],
      exposedHeaders: ['X-Request-Id'],
    })
  );

  // 3. Request identifier & logging
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // 4. Rate Limiting for API routes
  app.use(env.API_PREFIX, apiRateLimiter);

  // 5. Body Parsing with safe payload limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 6. Mount Centralized API Router under /api
  app.use(env.API_PREFIX, apiRouter);

  // Fallback for root /
  app.get('/', (req, res) => {
    res.json({
      name: 'GramSetu (ग्रामसेतु) Backend Server',
      version: '1.0.0',
      status: 'ONLINE',
      health: `${env.API_PREFIX}/health`,
      documentation: 'See README.md for endpoint specifications',
    });
  });

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
