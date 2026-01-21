import { Request, Response, NextFunction } from 'express';

import { LoginDTO, RegisterDTO } from '../../application/dtos';
import { container } from '../../infrastructure/config';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDTO = req.body;
      const result = await container.loginUseCase.execute(dto);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RegisterDTO = req.body;
      const result = await container.registerUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await container.refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await container.userRepository.findById(req.user.userId);

      if (!user) {
        throw new Error('User not found');
      }

      res.status(200).json({
        success: true,
        data: user.toPublicJSON(),
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
