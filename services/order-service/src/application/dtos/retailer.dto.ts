import { z } from 'zod';

import { addressSchema, AddressDTO } from './order.dto';

// ==========================================
// Retailer DTOs
// ==========================================
export const createRetailerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').toLowerCase(),
  phone: z.string().max(20).optional(),
  address: addressSchema.optional(),
});

export const updateRetailerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().max(20).optional().nullable(),
  address: addressSchema.optional().nullable(),
  isActive: z.boolean().optional(),
});

export const retailerFilterSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateRetailerDTO = z.infer<typeof createRetailerSchema>;
export type UpdateRetailerDTO = z.infer<typeof updateRetailerSchema>;
export type RetailerFilterDTO = z.infer<typeof retailerFilterSchema>;

// ==========================================
// Response DTOs
// ==========================================
export interface RetailerResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: AddressDTO;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRetailersResponseDTO {
  retailers: RetailerResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
