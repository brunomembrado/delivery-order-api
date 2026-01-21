import { createServiceLogger } from '@delivery/shared/logging';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { env, swaggerSpec } from './infrastructure/config';
import { errorHandler, notFoundHandler } from './infrastructure/middleware';
import { apiRoutes } from './presentation/routes';

const logger = createServiceLogger('order-service');

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RateLimitError',
      },
    },
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Request logging
  app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.path}`, {
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // Swagger Documentation
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Delivery Order API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Swagger JSON endpoint
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API routes with versioning
  app.use('/api', apiRoutes);

  // Root route
  app.get('/', (_req, res) => {
    res.json({
      name: 'Delivery Order API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/docs',
      versions: {
        v1: '/api/v1',
        v2: '/api/v2',
        current: '/api/v1',
      },
      endpoints: {
        health: '/api/v1/health',
        docs: '/api/docs',
        docsJson: '/api/docs.json',
      },
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
