import { Router } from 'express';

import { authenticate, authorize } from '../../infrastructure/middleware';
import { retailerController } from '../controllers';

const router = Router();

// All retailer routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /retailers:
 *   get:
 *     summary: List all retailers
 *     description: Get paginated list of all retailers. Admin only.
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name (partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email (partial match)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Retailers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Retailer'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', authorize('ADMIN'), retailerController.list.bind(retailerController));

/**
 * @swagger
 * /retailers:
 *   post:
 *     summary: Create a new retailer
 *     description: Create a new retailer account. Admin only.
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRetailerRequest'
 *     responses:
 *       201:
 *         description: Retailer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Retailer'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Email already exists
 */
router.post('/', authorize('ADMIN'), retailerController.create.bind(retailerController));

/**
 * @swagger
 * /retailers/{id}:
 *   get:
 *     summary: Get retailer by ID
 *     description: |
 *       Retrieve a specific retailer by UUID.
 *       - **Admin**: Can view any retailer
 *       - **Retailer**: Can only view their own profile
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The retailer UUID
 *     responses:
 *       200:
 *         description: Retailer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Retailer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', retailerController.getById.bind(retailerController));

/**
 * @swagger
 * /retailers/{id}:
 *   put:
 *     summary: Update retailer
 *     description: |
 *       Update retailer information.
 *       - **Admin**: Can update any retailer
 *       - **Retailer**: Can only update their own profile
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The retailer UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRetailerRequest'
 *     responses:
 *       200:
 *         description: Retailer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Retailer'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Email already exists
 */
router.put('/:id', retailerController.update.bind(retailerController));

/**
 * @swagger
 * /retailers/{id}:
 *   delete:
 *     summary: Delete retailer
 *     description: Delete a retailer. Admin only. This will also affect associated orders and users.
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The retailer UUID
 *     responses:
 *       204:
 *         description: Retailer deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authorize('ADMIN'), retailerController.delete.bind(retailerController));

export const retailerRoutes = router;
