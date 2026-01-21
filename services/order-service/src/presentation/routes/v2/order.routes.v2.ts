import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import {
  createOrderSchema,
  updateOrderStatusSchema,
  createOrderItemSchema,
} from '../../../application/dtos';
import { container } from '../../../infrastructure/config';
import { authenticate, validateBody } from '../../../infrastructure/middleware';
import { orderController } from '../../controllers';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// ============================================
// V2 Enhanced Endpoints
// ============================================

/**
 * @swagger
 * /orders/bulk/status:
 *   patch:
 *     summary: Bulk update order status (V2)
 *     description: |
 *       Update status for multiple orders at once.
 *       All orders must be valid for the transition.
 *       This is a V2-only feature.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *               - status
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 50
 *                 description: List of order IDs to update
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, DISPATCHED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Bulk update completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         type: string
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderId:
 *                             type: string
 *                           error:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const bulkUpdateStatusSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum(['CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
});

router.patch(
  '/bulk/status',
  validateBody(bulkUpdateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderIds, status } = req.body;
      const results = {
        successful: [] as string[],
        failed: [] as { orderId: string; error: string }[],
      };

      for (const orderId of orderIds) {
        try {
          await container.updateOrderStatusUseCase.execute(orderId, { status });
          results.successful.push(orderId);
        } catch (error) {
          results.failed.push({
            orderId,
            error: (error as Error).message,
          });
        }
      }

      res.status(200).json({
        success: true,
        data: results,
        meta: {
          timestamp: new Date().toISOString(),
          totalProcessed: orderIds.length,
          successCount: results.successful.length,
          failureCount: results.failed.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /orders/summary:
 *   get:
 *     summary: Get orders summary (V2)
 *     description: |
 *       Get a comprehensive summary of orders including statistics and recent activity.
 *       This is a V2-only feature.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/OrderStats'
 *                     totalOrders:
 *                       type: integer
 *                     activeOrders:
 *                       type: integer
 *                       description: Orders not in terminal state
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let retailerId: string | undefined;

    if (req.user?.role === 'RETAILER') {
      retailerId = req.user.retailerId;
    }

    const stats = await container.orderRepository.countByStatus(retailerId);

    const totalOrders = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const activeOrders = stats.CREATED + stats.CONFIRMED + stats.DISPATCHED;

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalOrders,
        activeOrders,
        completedOrders: stats.DELIVERED,
        cancelledOrders: stats.CANCELLED,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v2',
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Standard Endpoints (same as v1)
// ============================================

router.get('/stats', orderController.getStats.bind(orderController));
router.get('/', orderController.list.bind(orderController));
router.post('/', validateBody(createOrderSchema), orderController.create.bind(orderController));
router.get('/number/:orderNumber', orderController.getByOrderNumber.bind(orderController));
router.get('/:id', orderController.getById.bind(orderController));
router.patch(
  '/:id/status',
  validateBody(updateOrderStatusSchema),
  orderController.updateStatus.bind(orderController)
);
router.post(
  '/:id/items',
  validateBody(createOrderItemSchema),
  orderController.addItem.bind(orderController)
);
router.delete('/:id/items/:productId', orderController.removeItem.bind(orderController));

export const orderRoutesV2 = router;
