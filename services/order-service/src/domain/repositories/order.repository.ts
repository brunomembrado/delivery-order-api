import { Order } from '../entities';
import { OrderStatusEnum } from '../value-objects';

export interface OrderFilters {
  retailerId?: string;
  customerId?: string;
  status?: OrderStatusEnum;
  orderNumber?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderRepository {
  /**
   * Create a new order
   */
  create(order: Order): Promise<Order>;

  /**
   * Find an order by its ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find an order by its order number
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  /**
   * Find all orders with optional filters and pagination
   */
  findAll(filters?: OrderFilters, pagination?: PaginationOptions): Promise<PaginatedOrders>;

  /**
   * Find orders by retailer ID
   */
  findByRetailerId(retailerId: string, pagination?: PaginationOptions): Promise<PaginatedOrders>;

  /**
   * Find orders by customer ID
   */
  findByCustomerId(customerId: string): Promise<Order[]>;

  /**
   * Update an existing order
   */
  update(order: Order): Promise<Order>;

  /**
   * Delete an order (soft delete recommended)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if an order exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count orders by status for a retailer
   */
  countByStatus(retailerId?: string): Promise<Record<OrderStatusEnum, number>>;
}
