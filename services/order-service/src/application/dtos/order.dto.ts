import { z } from 'zod';

// ==========================================
// Order Item DTOs
// ==========================================
export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currency: z.string().default('USD'),
});

export const updateOrderItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export type CreateOrderItemDTO = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemDTO = z.infer<typeof updateOrderItemSchema>;

// ==========================================
// Address DTO
// ==========================================
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
});

export type AddressDTO = z.infer<typeof addressSchema>;

// ==========================================
// Order DTOs
// ==========================================
export const createOrderSchema = z.object({
  retailerId: z.string().uuid('Invalid retailer ID'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required').max(255),
  customerEmail: z.string().email('Invalid customer email'),
  deliveryAddress: addressSchema,
  items: z.array(createOrderItemSchema).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
});

export const addOrderItemSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  item: createOrderItemSchema,
});

export const orderFilterSchema = z.object({
  retailerId: z.string().uuid().optional(),
  customerId: z.string().optional(),
  status: z.enum(['CREATED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).optional(),
  orderNumber: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
export type AddOrderItemDTO = z.infer<typeof addOrderItemSchema>;
export type OrderFilterDTO = z.infer<typeof orderFilterSchema>;
export type PaginationDTO = z.infer<typeof paginationSchema>;

// ==========================================
// Response DTOs
// ==========================================
export interface OrderItemResponseDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalPrice: number;
}

export interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  retailerId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: AddressDTO;
  items: OrderItemResponseDTO[];
  itemCount: number;
  status: string;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface PaginatedOrdersResponseDTO {
  orders: OrderResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
