import { Router } from 'express';

import { authRoutes } from '../auth.routes';
import { orderRoutes } from '../order.routes';
import { retailerRoutes } from '../retailer.routes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
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
 *                   example: v1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// API v1 routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/retailers', retailerRoutes);

export const v1Routes = router;
