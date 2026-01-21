import { Retailer } from '../entities';

export interface RetailerFilters {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface PaginatedRetailers {
  retailers: Retailer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRetailerRepository {
  /**
   * Create a new retailer
   */
  create(retailer: Retailer): Promise<Retailer>;

  /**
   * Find a retailer by ID
   */
  findById(id: string): Promise<Retailer | null>;

  /**
   * Find a retailer by email
   */
  findByEmail(email: string): Promise<Retailer | null>;

  /**
   * Find all retailers with optional filters
   */
  findAll(
    filters?: RetailerFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedRetailers>;

  /**
   * Update an existing retailer
   */
  update(retailer: Retailer): Promise<Retailer>;

  /**
   * Delete a retailer (soft delete recommended)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a retailer exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if a retailer exists by email
   */
  existsByEmail(email: string): Promise<boolean>;
}
