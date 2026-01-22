/**
 * @fileoverview Type definitions for the Delivery Order Portal.
 * Contains interfaces and types for users, orders, retailers, and API responses.
 * @module types
 */

// =============================================================================
// User Types
// =============================================================================

/**
 * Represents a user in the system.
 *
 * @interface User
 * @example
 * ```typescript
 * const user: User = {
 *   id: 'usr_123',
 *   email: 'admin@delivery.local',
 *   name: 'Admin User',
 *   role: 'ADMIN'
 * };
 * ```
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address (used for login) */
  email: string;
  /** User's display name */
  name: string;
  /** User role determining permissions */
  role: 'ADMIN' | 'RETAILER';
  /** Associated retailer ID (required for RETAILER role) */
  retailerId?: string;
}

// =============================================================================
// Address Types
// =============================================================================

/**
 * Represents a physical address.
 * Used for delivery addresses and retailer locations.
 *
 * @interface Address
 */
export interface Address {
  /** Street address including number */
  street: string;
  /** City name */
  city: string;
  /** State or province */
  state: string;
  /** Postal or ZIP code */
  postalCode: string;
  /** Country name or code */
  country: string;
}

// =============================================================================
// Order Types
// =============================================================================

/**
 * Represents an individual item within an order.
 *
 * @interface OrderItem
 */
export interface OrderItem {
  /** Unique item identifier within the order */
  id: string;
  /** Reference to the product catalog */
  productId: string;
  /** Display name of the product */
  productName: string;
  /** Number of units ordered */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Calculated total (quantity * unitPrice) */
  totalPrice: number;
}

/**
 * Valid order status values.
 * Orders progress through: CREATED → CONFIRMED → DISPATCHED → DELIVERED
 * Orders can be CANCELLED from CREATED or CONFIRMED status.
 *
 * @type OrderStatus
 *
 * @example
 * ```typescript
 * const status: OrderStatus = 'CONFIRMED';
 * ```
 */
export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

/**
 * Represents a delivery order in the system.
 *
 * @interface Order
 * @example
 * ```typescript
 * const order: Order = {
 *   id: 'ord_123',
 *   orderNumber: 'ORD-2024-001',
 *   retailerId: 'ret_456',
 *   customerId: 'cust_789',
 *   customerName: 'John Doe',
 *   customerEmail: 'john@example.com',
 *   deliveryAddress: {
 *     street: '123 Main St',
 *     city: 'New York',
 *     state: 'NY',
 *     postalCode: '10001',
 *     country: 'USA'
 *   },
 *   items: [],
 *   itemCount: 0,
 *   status: 'CREATED',
 *   totalAmount: 0,
 *   currency: 'USD',
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z'
 * };
 * ```
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  /** Human-readable order number (e.g., 'ORD-2024-001') */
  orderNumber: string;
  /** ID of the retailer fulfilling the order */
  retailerId: string;
  /** Customer identifier */
  customerId: string;
  /** Customer's full name */
  customerName: string;
  /** Customer's email address */
  customerEmail: string;
  /** Delivery destination address */
  deliveryAddress: Address;
  /** Array of items in the order */
  items: OrderItem[];
  /** Total number of items (sum of quantities) */
  itemCount: number;
  /** Current order status */
  status: OrderStatus;
  /** Total order amount */
  totalAmount: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Optional notes or special instructions */
  notes?: string;
  /** ISO 8601 timestamp of order creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
  /** ISO 8601 timestamp when order was confirmed */
  confirmedAt?: string;
  /** ISO 8601 timestamp when order was dispatched */
  dispatchedAt?: string;
  /** ISO 8601 timestamp when order was delivered */
  deliveredAt?: string;
  /** ISO 8601 timestamp when order was cancelled */
  cancelledAt?: string;
}

// =============================================================================
// Retailer Types
// =============================================================================

/**
 * Represents a retailer (merchant) in the system.
 *
 * @interface Retailer
 */
export interface Retailer {
  /** Unique retailer identifier */
  id: string;
  /** Retailer business name */
  name: string;
  /** Retailer contact email */
  email: string;
  /** Retailer phone number */
  phone?: string;
  /** Retailer business address */
  address?: Address;
  /** Whether the retailer is currently active */
  isActive: boolean;
  /** ISO 8601 timestamp of retailer creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Generic API response wrapper.
 * All API endpoints return data in this format.
 *
 * @interface ApiResponse
 * @template T - The type of data returned on success
 *
 * @example
 * ```typescript
 * const response: ApiResponse<Order[]> = {
 *   success: true,
 *   data: [order1, order2],
 *   pagination: {
 *     page: 1,
 *     limit: 20,
 *     total: 100,
 *     totalPages: 5,
 *     hasNext: true,
 *     hasPrevious: false
 *   }
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error details (present on failure) */
  error?: {
    /** Human-readable error message */
    message: string;
    /** Machine-readable error code */
    code?: string;
    /** Additional error context */
    details?: Record<string, unknown>;
  };
  /** Pagination metadata (present for list endpoints) */
  pagination?: {
    /** Current page number (1-indexed) */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there are more pages after this one */
    hasNext: boolean;
    /** Whether there are pages before this one */
    hasPrevious: boolean;
  };
}

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * JWT authentication tokens returned after login.
 *
 * @interface AuthTokens
 */
export interface AuthTokens {
  /** JWT access token for API authentication */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Access token expiration time in seconds */
  expiresIn: number;
}

/**
 * Response returned after successful authentication.
 *
 * @interface LoginResponse
 */
export interface LoginResponse {
  /** Authenticated user data */
  user: User;
  /** Authentication tokens */
  tokens: AuthTokens;
}

// =============================================================================
// Statistics Types
// =============================================================================

/**
 * Order statistics grouped by status.
 * Returns count of orders in each status.
 *
 * @interface OrderStats
 *
 * @example
 * ```typescript
 * const stats: OrderStats = {
 *   CREATED: 5,
 *   CONFIRMED: 10,
 *   DISPATCHED: 8,
 *   DELIVERED: 100,
 *   CANCELLED: 2
 * };
 * ```
 */
export interface OrderStats {
  /** Number of orders in CREATED status */
  CREATED: number;
  /** Number of orders in CONFIRMED status */
  CONFIRMED: number;
  /** Number of orders in DISPATCHED status */
  DISPATCHED: number;
  /** Number of orders in DELIVERED status */
  DELIVERED: number;
  /** Number of orders in CANCELLED status */
  CANCELLED: number;
}
