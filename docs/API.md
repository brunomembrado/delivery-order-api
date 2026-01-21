# API Documentation

This document provides detailed information about the Delivery Order API endpoints.

**Base URL:** `http://localhost:3001/api/v1`

**Interactive Documentation:** http://localhost:3001/api/docs (Swagger UI)

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Lifecycle

- **Access Token**: Valid for 24 hours (configurable)
- **Refresh Token**: Valid for 7 days (configurable)

---

## Auth Endpoints

### POST /auth/login

Authenticate a user and receive JWT tokens.

**Request:**
```json
{
  "email": "admin@delivery.local",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@delivery.local",
    "name": "System Admin",
    "role": "ADMIN",
    "retailerId": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "RETAILER",
  "retailerId": "uuid-of-retailer"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "RETAILER",
    "retailerId": "uuid-of-retailer"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST /auth/refresh

Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /auth/me

Get current authenticated user profile.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@delivery.local",
  "name": "System Admin",
  "role": "ADMIN",
  "retailerId": null
}
```

---

## Orders Endpoints

### GET /orders

List orders with pagination and filtering.

**Query Parameters:**
| Parameter  | Type   | Default | Description                           |
|------------|--------|---------|---------------------------------------|
| page       | number | 1       | Page number                           |
| limit      | number | 10      | Items per page (max 100)              |
| status     | string | -       | Filter by status (CREATED, CONFIRMED, etc.) |
| retailerId | string | -       | Filter by retailer (Admin only)       |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-ABC123",
      "retailerId": "uuid",
      "customer": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "deliveryAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
      },
      "status": "CREATED",
      "items": [
        {
          "id": "uuid",
          "productId": "prod-123",
          "productName": "Widget",
          "quantity": 2,
          "unitPrice": 29.99,
          "currency": "USD"
        }
      ],
      "notes": "Handle with care",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### POST /orders

Create a new order.

**Request:**
```json
{
  "retailerId": "uuid",
  "customer": {
    "id": "cust-123",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "deliveryAddress": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90001",
    "country": "USA"
  },
  "items": [
    {
      "productId": "prod-456",
      "productName": "Gadget Pro",
      "quantity": 1,
      "unitPrice": 149.99,
      "currency": "USD"
    }
  ],
  "notes": "Leave at front door"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-XYZ789",
  "status": "CREATED",
  ...
}
```

### GET /orders/:id

Get order by ID.

**Response (200):**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-ABC123",
  ...
}
```

**Error (404):**
```json
{
  "error": "Order not found"
}
```

### GET /orders/number/:orderNumber

Get order by order number.

**Response (200):**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-ABC123",
  ...
}
```

### PATCH /orders/:id/status

Update order status.

**Request:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Transitions:**
- CREATED → CONFIRMED (requires at least 1 item)
- CREATED → CANCELLED
- CONFIRMED → DISPATCHED
- CONFIRMED → CANCELLED
- DISPATCHED → DELIVERED

**Response (200):**
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "confirmedAt": "2024-01-15T11:00:00Z",
  ...
}
```

**Error (400):**
```json
{
  "error": "Invalid status transition from CREATED to DELIVERED"
}
```

### POST /orders/:id/items

Add an item to an order.

**Request:**
```json
{
  "productId": "prod-789",
  "productName": "Accessory",
  "quantity": 3,
  "unitPrice": 19.99,
  "currency": "USD"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "items": [
    ...existing items,
    {
      "id": "item-uuid",
      "productId": "prod-789",
      "productName": "Accessory",
      "quantity": 3,
      "unitPrice": 19.99,
      "currency": "USD"
    }
  ]
}
```

### DELETE /orders/:id/items/:productId

Remove an item from an order.

**Response (200):**
```json
{
  "id": "uuid",
  "items": [
    ...remaining items
  ]
}
```

### GET /orders/stats

Get order statistics.

**Query Parameters:**
| Parameter  | Type   | Description                     |
|------------|--------|---------------------------------|
| retailerId | string | Filter by retailer (Admin only) |

**Response (200):**
```json
{
  "byStatus": {
    "CREATED": 5,
    "CONFIRMED": 12,
    "DISPATCHED": 8,
    "DELIVERED": 45,
    "CANCELLED": 3
  },
  "total": 73
}
```

---

## Retailers Endpoints

*Admin only*

### GET /retailers

List all retailers.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "TechMart Electronics",
      "code": "TECHMART",
      "contactEmail": "contact@techmart.com",
      "contactPhone": "+1-555-0100",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /retailers

Create a new retailer.

**Request:**
```json
{
  "name": "New Store",
  "code": "NEWSTORE",
  "contactEmail": "info@newstore.com",
  "contactPhone": "+1-555-0200"
}
```

### GET /retailers/:id

Get retailer by ID.

### PUT /retailers/:id

Update retailer.

### DELETE /retailers/:id

Delete retailer (soft delete).

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description                              |
|------|------------------------------------------|
| 200  | Success                                  |
| 201  | Created                                  |
| 400  | Bad Request (validation error)           |
| 401  | Unauthorized (missing/invalid token)     |
| 403  | Forbidden (insufficient permissions)     |
| 404  | Not Found                                |
| 409  | Conflict (duplicate resource)            |
| 422  | Unprocessable Entity (business rule)     |
| 500  | Internal Server Error                    |

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

---

## Versioning

The API uses URL path versioning:
- Current: `/api/v1/`
- Future: `/api/v2/` (when available)

Deprecated endpoints will include a `Deprecation` header with the sunset date.
