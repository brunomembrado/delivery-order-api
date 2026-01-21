import { validateOrThrow } from '@delivery/shared/validation';
import { Request, Response, NextFunction } from 'express';

import {
  CreateRetailerDTO,
  UpdateRetailerDTO,
  createRetailerSchema,
  updateRetailerSchema,
} from '../../application/dtos';
import { Retailer, Address } from '../../domain';
import { NotFoundError, ConflictError, ForbiddenError } from '../../domain/errors';
import { container } from '../../infrastructure/config';

export class RetailerController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateRetailerDTO = validateOrThrow(createRetailerSchema, req.body);

      // Check if email already exists
      const existingRetailer = await container.retailerRepository.existsByEmail(dto.email);
      if (existingRetailer) {
        throw new ConflictError('A retailer with this email already exists');
      }

      let address: Address | undefined;
      if (dto.address) {
        address = Address.create(dto.address);
      }

      const retailer = Retailer.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address,
      });

      const created = await container.retailerRepository.create(retailer);

      res.status(201).json({
        success: true,
        data: created.toJSON(),
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Retailers can only view their own profile
      if (req.user?.role === 'RETAILER' && req.user.retailerId !== id) {
        throw new ForbiddenError('Access denied to this retailer');
      }

      const retailer = await container.retailerRepository.findById(id);

      if (!retailer) {
        throw new NotFoundError('Retailer', id);
      }

      res.status(200).json({
        success: true,
        data: retailer.toJSON(),
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        name: req.query.name as string | undefined,
        email: req.query.email as string | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await container.retailerRepository.findAll(filters, pagination);

      res.status(200).json({
        success: true,
        data: result.retailers.map(r => r.toJSON()),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateRetailerDTO = validateOrThrow(updateRetailerSchema, req.body);

      // Retailers can only update their own profile
      if (req.user?.role === 'RETAILER' && req.user.retailerId !== id) {
        throw new ForbiddenError('Access denied to this retailer');
      }

      const retailer = await container.retailerRepository.findById(id);

      if (!retailer) {
        throw new NotFoundError('Retailer', id);
      }

      // Check email uniqueness if changing
      if (dto.email && dto.email !== retailer.email) {
        const existingRetailer = await container.retailerRepository.existsByEmail(dto.email);
        if (existingRetailer) {
          throw new ConflictError('A retailer with this email already exists');
        }
        retailer.updateEmail(dto.email);
      }

      if (dto.name) {
        retailer.updateName(dto.name);
      }

      if (dto.phone !== undefined) {
        retailer.updatePhone(dto.phone || undefined);
      }

      if (dto.address !== undefined) {
        if (dto.address) {
          retailer.updateAddress(dto.address);
        }
      }

      if (dto.isActive !== undefined) {
        if (dto.isActive) {
          retailer.activate();
        } else {
          retailer.deactivate();
        }
      }

      const updated = await container.retailerRepository.update(retailer);

      res.status(200).json({
        success: true,
        data: updated.toJSON(),
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const retailer = await container.retailerRepository.findById(id);

      if (!retailer) {
        throw new NotFoundError('Retailer', id);
      }

      await container.retailerRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const retailerController = new RetailerController();
