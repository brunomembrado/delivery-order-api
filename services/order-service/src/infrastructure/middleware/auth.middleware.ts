import { Request, Response, NextFunction } from 'express';

import { TokenPayload } from '../../application/use-cases/auth/login.use-case';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors';
import { JwtTokenService } from '../services';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const tokenService = new JwtTokenService();

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const payload = tokenService.verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeRetailerAccess = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admins can access all retailers
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Retailers can only access their own data
    const retailerId = req.params.retailerId || req.body.retailerId || req.query.retailerId;

    if (retailerId && req.user.retailerId !== retailerId) {
      throw new ForbiddenError('Access denied to this retailer');
    }

    next();
  } catch (error) {
    next(error);
  }
};
