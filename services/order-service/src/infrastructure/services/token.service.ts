import jwt, { SignOptions } from 'jsonwebtoken';

import { ITokenService, TokenPayload } from '../../application/use-cases/auth/login.use-case';
import { ITokenVerificationService } from '../../application/use-cases/auth/refresh-token.use-case';

export class JwtTokenService implements ITokenService, ITokenVerificationService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly accessTokenExpirySeconds: number;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.accessTokenExpirySeconds = this.parseExpiryToSeconds(this.accessTokenExpiry);
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    } as SignOptions);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    } as SignOptions);
  }

  getAccessTokenExpiry(): number {
    return this.accessTokenExpirySeconds;
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 86400; // Default to 24 hours
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 86400;
    }
  }
}
