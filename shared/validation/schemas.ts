import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email format').toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  );

// Order-specific schemas
export const orderStatusSchema = z.enum([
  'CREATED',
  'CONFIRMED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
]);

export const userRoleSchema = z.enum(['ADMIN', 'RETAILER']);

// Price and quantity validations
export const priceSchema = z.number().positive('Price must be positive').multipleOf(0.01);

export const quantitySchema = z
  .number()
  .int('Quantity must be an integer')
  .positive('Quantity must be positive');

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Address = z.infer<typeof addressSchema>;
