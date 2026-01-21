import { validateOrThrow } from '@delivery/shared/validation';

import { User, UserRole } from '../../../domain/entities';
import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors';
import { IUserRepository, IRetailerRepository } from '../../../domain/repositories';
import { RegisterDTO, registerSchema, AuthResponseDTO } from '../../dtos';

import { IPasswordService, ITokenService, TokenPayload } from './login.use-case';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly retailerRepository: IRetailerRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    // Validate input
    const validatedDto = validateOrThrow(registerSchema, dto);

    // Check if email already exists
    const existingUser = await this.userRepository.existsByEmail(validatedDto.email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Validate retailer if role is RETAILER
    if (validatedDto.role === 'RETAILER') {
      if (!validatedDto.retailerId) {
        throw new ValidationError('Retailer ID is required for retailer users');
      }
      const retailerExists = await this.retailerRepository.exists(validatedDto.retailerId);
      if (!retailerExists) {
        throw new NotFoundError('Retailer', validatedDto.retailerId);
      }
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(validatedDto.password);

    // Create user entity
    const user = User.create({
      email: validatedDto.email,
      password: hashedPassword,
      name: validatedDto.name,
      role: validatedDto.role as UserRole,
      retailerId: validatedDto.retailerId,
    });

    // Persist user
    const createdUser = await this.userRepository.create(user);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: createdUser.id!,
      email: createdUser.email,
      role: createdUser.role,
      retailerId: createdUser.retailerId,
    };

    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: createdUser.id!,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        retailerId: createdUser.retailerId,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt.toISOString(),
        lastLoginAt: createdUser.lastLoginAt?.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.tokenService.getAccessTokenExpiry(),
      },
    };
  }
}

// Extend password service interface
declare module './login.use-case' {
  interface IPasswordService {
    hash(password: string): Promise<string>;
  }
}
