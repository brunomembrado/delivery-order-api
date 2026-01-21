import { createServiceLogger } from '@delivery/shared/logging';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { BaseError } from '../../domain/errors';

const logger = createServiceLogger('error-handler');

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Internal Server Error',
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  let statusCode = 500;

  // Handle known errors
  if (error instanceof BaseError) {
    statusCode = error.statusCode;
    response.error.message = error.message;
    response.error.code = error.name;
    response.error.details = error.details;

    if (error.isOperational) {
      logger.warn(`Operational error: ${error.message}`, {
        statusCode,
        path: req.path,
        details: error.details,
      });
    } else {
      logger.error('Non-operational error', error, {
        path: req.path,
        method: req.method,
      });
    }
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    statusCode = 400;
    response.error.message = 'Validation failed';
    response.error.code = 'ValidationError';
    response.error.details = {
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };

    logger.warn('Validation error', {
      path: req.path,
      errors: error.errors,
    });
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.error.message = 'Invalid token';
    response.error.code = 'UnauthorizedError';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    response.error.message = 'Token expired';
    response.error.code = 'UnauthorizedError';
  }
  // Handle unknown errors
  else {
    logger.error('Unexpected error', error, {
      path: req.path,
      method: req.method,
    });

    // In production, don't expose error details
    if (process.env.NODE_ENV === 'production') {
      response.error.message = 'An unexpected error occurred';
    } else {
      response.error.message = error.message;
      response.error.details = { stack: error.stack };
    }
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NotFoundError',
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  res.status(404).json(response);
};
