export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface QueryFilters {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface TimeStamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDelete extends TimeStamps {
  deletedAt: Date | null;
}
