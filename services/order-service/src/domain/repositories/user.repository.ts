import { User, UserRole } from '../entities';

export interface UserFilters {
  email?: string;
  role?: UserRole;
  retailerId?: string;
  isActive?: boolean;
}

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with optional filters
   */
  findAll(filters?: UserFilters): Promise<User[]>;

  /**
   * Find users by retailer ID
   */
  findByRetailerId(retailerId: string): Promise<User[]>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): Promise<void>;
}
