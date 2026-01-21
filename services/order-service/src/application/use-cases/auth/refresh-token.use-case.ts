import { UnauthorizedError } from '../../../domain/errors';
import { IUserRepository } from '../../../domain/repositories';
import { AuthTokensDTO } from '../../dtos';

import { ITokenService, TokenPayload } from './login.use-case';

export interface ITokenVerificationService {
  verifyRefreshToken(token: string): TokenPayload | null;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService & ITokenVerificationService
  ) {}

  async execute(refreshToken: string): Promise<AuthTokensDTO> {
    // Verify refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Generate new tokens
    const newTokenPayload: TokenPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
      retailerId: user.retailerId,
    };

    const newAccessToken = this.tokenService.generateAccessToken(newTokenPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(newTokenPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.tokenService.getAccessTokenExpiry(),
    };
  }
}
