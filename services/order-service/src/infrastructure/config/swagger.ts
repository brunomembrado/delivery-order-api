import swaggerJsdoc from 'swagger-jsdoc';

import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Delivery Order API',
    version: '1.0.0',
    description: `
A production-grade delivery order management system built with Clean Architecture.

## Features
- Order lifecycle management (CREATED → CONFIRMED → DISPATCHED → DELIVERED)
- JWT-based authentication with role-based access control
- Multi-retailer support

## Business Rules
- Orders start in CREATED status
- Orders with zero items cannot be confirmed
- Cancellation only allowed from CREATED or CONFIRMED states
- DELIVERED and CANCELLED are terminal states

## Authentication
All protected endpoints require a Bearer token in the Authorization header.
    `,
    contact: {
      name: 'API Support',
      email: 'support@delivery.local',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'API Version 1 - Current',
    },
    {
      url: `http://localhost:${env.PORT}/api/v2`,
      description: 'API Version 2 - Latest',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Orders',
      description: 'Order management operations',
    },
    {
      name: 'Retailers',
      description: 'Retailer management operations (Admin only)',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      // Error Response
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error message',
              },
              code: {
                type: 'string',
                example: 'ValidationError',
              },
              details: {
                type: 'object',
              },
            },
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              path: {
                type: 'string',
              },
              method: {
                type: 'string',
              },
            },
          },
        },
      },
      // Pagination
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          hasNext: {
            type: 'boolean',
            example: true,
          },
          hasPrevious: {
            type: 'boolean',
            example: false,
          },
        },
      },
      // Address
      Address: {
        type: 'object',
        required: ['street', 'city', 'state', 'postalCode', 'country'],
        properties: {
          street: {
            type: 'string',
            example: '123 Main St',
          },
          city: {
            type: 'string',
            example: 'New York',
          },
          state: {
            type: 'string',
            example: 'NY',
          },
          postalCode: {
            type: 'string',
            example: '10001',
          },
          country: {
            type: 'string',
            example: 'USA',
          },
        },
      },
      // User
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'RETAILER'],
          },
          retailerId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      // Auth Tokens
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
          },
          refreshToken: {
            type: 'string',
          },
          expiresIn: {
            type: 'integer',
            description: 'Token expiry in seconds',
          },
        },
      },
      // Login Request
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@delivery.local',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Admin123!',
          },
        },
      },
      // Register Request
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            description: 'Must contain uppercase, lowercase, and number',
          },
          name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'RETAILER'],
            default: 'RETAILER',
          },
          retailerId: {
            type: 'string',
            format: 'uuid',
            description: 'Required for RETAILER role',
          },
        },
      },
      // Order Item
      OrderItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          productId: {
            type: 'string',
          },
          productName: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
          },
          unitPrice: {
            type: 'number',
            format: 'float',
          },
          currency: {
            type: 'string',
            default: 'USD',
          },
          totalPrice: {
            type: 'number',
            format: 'float',
          },
        },
      },
      // Create Order Item Request
      CreateOrderItemRequest: {
        type: 'object',
        required: ['productId', 'productName', 'quantity', 'unitPrice'],
        properties: {
          productId: {
            type: 'string',
            example: 'PROD-001',
          },
          productName: {
            type: 'string',
            example: 'Wireless Headphones',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            example: 2,
          },
          unitPrice: {
            type: 'number',
            format: 'float',
            example: 99.99,
          },
          currency: {
            type: 'string',
            default: 'USD',
          },
        },
      },
      // Order
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          orderNumber: {
            type: 'string',
            example: 'ORD-ABC123-XYZ',
          },
          retailerId: {
            type: 'string',
            format: 'uuid',
          },
          customerId: {
            type: 'string',
          },
          customerName: {
            type: 'string',
          },
          customerEmail: {
            type: 'string',
            format: 'email',
          },
          deliveryAddress: {
            $ref: '#/components/schemas/Address',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItem',
            },
          },
          itemCount: {
            type: 'integer',
          },
          status: {
            type: 'string',
            enum: ['CREATED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
          },
          totalAmount: {
            type: 'number',
            format: 'float',
          },
          currency: {
            type: 'string',
          },
          notes: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          confirmedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          dispatchedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          deliveredAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          cancelledAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      // Create Order Request
      CreateOrderRequest: {
        type: 'object',
        required: ['customerId', 'customerName', 'customerEmail', 'deliveryAddress'],
        properties: {
          retailerId: {
            type: 'string',
            format: 'uuid',
            description: 'Required for ADMIN, auto-set for RETAILER',
          },
          customerId: {
            type: 'string',
            example: 'CUST-001',
          },
          customerName: {
            type: 'string',
            example: 'John Doe',
          },
          customerEmail: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          deliveryAddress: {
            $ref: '#/components/schemas/Address',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CreateOrderItemRequest',
            },
          },
          notes: {
            type: 'string',
            example: 'Please handle with care',
          },
        },
      },
      // Update Order Status Request
      UpdateOrderStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
            description: 'Target status for the order',
          },
        },
      },
      // Order Statistics
      OrderStats: {
        type: 'object',
        properties: {
          CREATED: {
            type: 'integer',
          },
          CONFIRMED: {
            type: 'integer',
          },
          DISPATCHED: {
            type: 'integer',
          },
          DELIVERED: {
            type: 'integer',
          },
          CANCELLED: {
            type: 'integer',
          },
        },
      },
      // Retailer
      Retailer: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          phone: {
            type: 'string',
            nullable: true,
          },
          address: {
            $ref: '#/components/schemas/Address',
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      // Create Retailer Request
      CreateRetailerRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            example: 'TechMart Electronics',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'contact@techmart.com',
          },
          phone: {
            type: 'string',
            example: '+1-555-0100',
          },
          address: {
            $ref: '#/components/schemas/Address',
          },
        },
      },
      // Update Retailer Request
      UpdateRetailerRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          phone: {
            type: 'string',
            nullable: true,
          },
          address: {
            $ref: '#/components/schemas/Address',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Access denied - insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/presentation/routes/*.ts', './src/presentation/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
