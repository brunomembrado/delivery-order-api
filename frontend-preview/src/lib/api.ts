/**
 * @fileoverview API Client for the Delivery Order Portal.
 * Provides methods for authentication, order management, and retailer operations.
 * @module lib/api
 */

import { ApiResponse, LoginResponse, Order, OrderStats, Retailer } from '@/types';

/** Base URL for API requests, configurable via environment variable */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * API Client class for interacting with the Delivery Order API.
 * Handles authentication tokens and provides typed methods for all API endpoints.
 *
 * @example
 * ```typescript
 * import { api } from '@/lib/api';
 *
 * // Set the access token after login
 * api.setAccessToken(session.accessToken);
 *
 * // Fetch orders
 * const orders = await api.getOrders({ status: 'CREATED' });
 * ```
 */
class ApiClient {
  /** JWT access token for authenticated requests */
  private accessToken: string | null = null;

  /**
   * Sets the access token for authenticated API requests.
   * @param token - JWT access token or null to clear authentication
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Makes an HTTP request to the API.
   * Automatically includes authentication headers and handles errors.
   *
   * @template T - The expected response data type
   * @param endpoint - API endpoint path (e.g., '/orders')
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Promise resolving to the typed API response
   * @throws Error if the request fails or returns a non-OK status
   * @private
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  // ============================================================================
  // Authentication Endpoints
  // ============================================================================

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to user data and authentication tokens
   * @throws Error if credentials are invalid
   *
   * @example
   * ```typescript
   * const response = await api.login('user@example.com', 'password123');
   * if (response.data) {
   *   api.setAccessToken(response.data.tokens.accessToken);
   * }
   * ```
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Registers a new user account.
   *
   * @param data - Registration data
   * @param data.email - User's email address
   * @param data.password - User's password
   * @param data.name - User's display name
   * @param data.role - User role ('ADMIN' or 'RETAILER')
   * @param data.retailerId - Associated retailer ID (required for RETAILER role)
   * @returns Promise resolving to user data and authentication tokens
   * @throws Error if registration fails (e.g., email already exists)
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    retailerId?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Refreshes an expired access token using a refresh token.
   *
   * @param refreshToken - Valid refresh token
   * @returns Promise resolving to new access and refresh tokens
   * @throws Error if refresh token is invalid or expired
   */
  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // ============================================================================
  // Order Endpoints
  // ============================================================================

  /**
   * Retrieves a paginated list of orders with optional filters.
   *
   * @param params - Query parameters for filtering and pagination
   * @param params.page - Page number (1-indexed)
   * @param params.limit - Number of items per page
   * @param params.status - Filter by order status (CREATED, CONFIRMED, DISPATCHED, DELIVERED, CANCELLED)
   * @param params.retailerId - Filter by retailer ID
   * @returns Promise resolving to an array of orders
   *
   * @example
   * ```typescript
   * // Get all pending orders
   * const orders = await api.getOrders({ status: 'CREATED', limit: 20 });
   * ```
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    retailerId?: string;
  }): Promise<ApiResponse<Order[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.retailerId) searchParams.set('retailerId', params.retailerId);

    const query = searchParams.toString();
    return this.request<Order[]>(`/orders${query ? `?${query}` : ''}`);
  }

  /**
   * Retrieves a single order by its ID.
   *
   * @param id - Unique order identifier
   * @returns Promise resolving to the order details
   * @throws Error if order is not found
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  /**
   * Creates a new order.
   *
   * @param data - Order creation data
   * @param data.retailerId - Retailer ID (optional, defaults to authenticated user's retailer)
   * @param data.customerId - Customer identifier
   * @param data.customerName - Customer's full name
   * @param data.customerEmail - Customer's email address
   * @param data.deliveryAddress - Delivery address details
   * @param data.items - Array of order items (optional, can be added later)
   * @param data.notes - Additional order notes
   * @returns Promise resolving to the created order
   *
   * @example
   * ```typescript
   * const order = await api.createOrder({
   *   customerId: 'cust-123',
   *   customerName: 'John Doe',
   *   customerEmail: 'john@example.com',
   *   deliveryAddress: {
   *     street: '123 Main St',
   *     city: 'New York',
   *     state: 'NY',
   *     postalCode: '10001',
   *     country: 'USA'
   *   }
   * });
   * ```
   */
  async createOrder(data: {
    retailerId?: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    items?: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Updates the status of an order.
   * Valid transitions: CREATED → CONFIRMED → DISPATCHED → DELIVERED
   * Orders can be CANCELLED from CREATED or CONFIRMED status.
   *
   * @param id - Order ID to update
   * @param status - New status (CONFIRMED, DISPATCHED, DELIVERED, CANCELLED)
   * @returns Promise resolving to the updated order
   * @throws Error if the status transition is invalid
   */
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Adds an item to an existing order.
   * Only allowed for orders in CREATED status.
   *
   * @param orderId - Order ID to add item to
   * @param item - Item details
   * @param item.productId - Product identifier
   * @param item.productName - Product display name
   * @param item.quantity - Quantity to add
   * @param item.unitPrice - Price per unit
   * @returns Promise resolving to the updated order
   * @throws Error if order is not in CREATED status
   */
  async addOrderItem(
    orderId: string,
    item: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }
  ): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  /**
   * Removes an item from an order.
   * Only allowed for orders in CREATED status.
   *
   * @param orderId - Order ID to remove item from
   * @param productId - Product ID to remove
   * @returns Promise resolving to the updated order
   * @throws Error if order is not in CREATED status or item not found
   */
  async removeOrderItem(orderId: string, productId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/items/${productId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Retrieves order statistics grouped by status.
   * Returns count of orders in each status for the authenticated user's scope.
   *
   * @returns Promise resolving to order counts by status
   *
   * @example
   * ```typescript
   * const stats = await api.getOrderStats();
   * console.log(`Pending orders: ${stats.data?.CREATED}`);
   * ```
   */
  async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    return this.request<OrderStats>('/orders/stats');
  }

  // ============================================================================
  // Retailer Endpoints
  // ============================================================================

  /**
   * Retrieves a paginated list of retailers.
   * Only available to ADMIN users.
   *
   * @param params - Query parameters for pagination
   * @param params.page - Page number (1-indexed)
   * @param params.limit - Number of items per page
   * @returns Promise resolving to an array of retailers
   */
  async getRetailers(params?: { page?: number; limit?: number }): Promise<ApiResponse<Retailer[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request<Retailer[]>(`/retailers${query ? `?${query}` : ''}`);
  }

  /**
   * Retrieves a single retailer by ID.
   *
   * @param id - Unique retailer identifier
   * @returns Promise resolving to the retailer details
   * @throws Error if retailer is not found
   */
  async getRetailer(id: string): Promise<ApiResponse<Retailer>> {
    return this.request<Retailer>(`/retailers/${id}`);
  }

  /**
   * Creates a new retailer.
   * Only available to ADMIN users.
   *
   * @param data - Retailer creation data
   * @param data.name - Retailer business name
   * @param data.email - Retailer contact email
   * @param data.phone - Retailer phone number (optional)
   * @param data.address - Retailer business address (optional)
   * @returns Promise resolving to the created retailer
   */
  async createRetailer(data: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }): Promise<ApiResponse<Retailer>> {
    return this.request<Retailer>('/retailers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

/** Singleton API client instance for use throughout the application */
export const api = new ApiClient();
