import { Request, Response, NextFunction } from 'express';

import {
  CreateOrderDTO,
  UpdateOrderStatusDTO,
  CreateOrderItemDTO,
  OrderFilterDTO,
  PaginationDTO,
} from '../../application/dtos';
import { ForbiddenError } from '../../domain/errors';
import { container } from '../../infrastructure/config';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateOrderDTO = req.body;

      // If user is a retailer, force use their retailerId
      if (req.user?.role === 'RETAILER') {
        dto.retailerId = req.user.retailerId!;
      }

      const result = await container.createOrderUseCase.execute(dto);

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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await container.getOrderUseCase.execute(id);

      // Check retailer access
      if (req.user?.role === 'RETAILER' && result.retailerId !== req.user.retailerId) {
        throw new ForbiddenError('Access denied to this order');
      }

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

  async getByOrderNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const result = await container.getOrderUseCase.executeByOrderNumber(orderNumber);

      // Check retailer access
      if (req.user?.role === 'RETAILER' && result.retailerId !== req.user.retailerId) {
        throw new ForbiddenError('Access denied to this order');
      }

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

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: OrderFilterDTO = {
        status: req.query.status as string | undefined,
        orderNumber: req.query.orderNumber as string | undefined,
        customerId: req.query.customerId as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      } as OrderFilterDTO;

      const pagination: PaginationDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      let result;

      // If user is a retailer, only show their orders
      if (req.user?.role === 'RETAILER') {
        result = await container.listOrdersUseCase.executeByRetailer(
          req.user.retailerId!,
          pagination
        );
      } else {
        // Admin can see all or filter by retailerId
        if (req.query.retailerId) {
          filters.retailerId = req.query.retailerId as string;
        }
        result = await container.listOrdersUseCase.execute(filters, pagination);
      }

      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateOrderStatusDTO = req.body;

      // First, get the order to check access
      const existingOrder = await container.getOrderUseCase.execute(id);

      // Check retailer access
      if (req.user?.role === 'RETAILER' && existingOrder.retailerId !== req.user.retailerId) {
        throw new ForbiddenError('Access denied to this order');
      }

      const result = await container.updateOrderStatusUseCase.execute(id, dto);

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

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: CreateOrderItemDTO = req.body;

      // First, get the order to check access
      const existingOrder = await container.getOrderUseCase.execute(id);

      // Check retailer access
      if (req.user?.role === 'RETAILER' && existingOrder.retailerId !== req.user.retailerId) {
        throw new ForbiddenError('Access denied to this order');
      }

      const result = await container.addOrderItemUseCase.execute(id, dto);

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

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, productId } = req.params;

      // First, get the order to check access
      const existingOrder = await container.getOrderUseCase.execute(id);

      // Check retailer access
      if (req.user?.role === 'RETAILER' && existingOrder.retailerId !== req.user.retailerId) {
        throw new ForbiddenError('Access denied to this order');
      }

      const result = await container.removeOrderItemUseCase.execute(id, productId);

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

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let retailerId: string | undefined;

      if (req.user?.role === 'RETAILER') {
        retailerId = req.user.retailerId;
      } else if (req.query.retailerId) {
        retailerId = req.query.retailerId as string;
      }

      const stats = await container.orderRepository.countByStatus(retailerId);

      res.status(200).json({
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
