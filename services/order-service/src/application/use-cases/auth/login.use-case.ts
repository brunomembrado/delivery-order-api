import { validateOrThrow } from '@delivery/shared/validation';

import { UnauthorizedError } from '../../../domain/errors';
import { IUserRepository } from '../../../domain/repositories';
import { LoginDTO, loginSchema, AuthResponseDTO } from '../../dtos';

export interface IPasswordService {
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  getAccessTokenExpiry(): number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  retailerId?: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    // Validate input
    const validatedDto = validateOrThrow(loginSchema, dto);

    // Find user by email
    const user = await this.userRepository.findByEmail(validatedDto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      validatedDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.recordLogin();
    await this.userRepository.update(user);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
      retailerId: user.retailerId,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id!,
        email: user.email,
        name: user.name,
        role: user.role,
        retailerId: user.retailerId,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.tokenService.getAccessTokenExpiry(),
      },
    };
  }
}
