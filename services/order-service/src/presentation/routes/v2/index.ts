import { Router } from 'express';

import { authRoutes } from '../auth.routes';
import { retailerRoutes } from '../retailer.routes';

import { orderRoutesV2 } from './order.routes.v2';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check (V2)
 *     description: Check if the API v2 is running
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: order-service
 *                 version:
 *                   type: string
 *                   example: v2
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["bulk-operations", "order-summary"]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    version: 'v2',
    features: ['bulk-operations', 'order-summary'],
    timestamp: new Date().toISOString(),
  });
});

// API v2 routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutesV2);
router.use('/retailers', retailerRoutes);

export const v2Routes = router;
