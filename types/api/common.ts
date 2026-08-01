// Common API types and interfaces

export interface BaseResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: IErrorDetails;
  meta?: IResponseMetadata;
}

export interface IErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  correlation_id?: string;
  service?: string;
}

export interface IResponseMetadata {
  timestamp?: string;
  correlation_id?: string;
  request_id?: string;
  version?: string;
  service?: string;
  processing_time?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc" | "ASC" | "DESC";
  fields?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Specific response type for admin users list (API uses 'users' instead of 'items')
export interface AdminListResponse<T> {
  users: T[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}


export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp?: string;
}

export type SortOrder = "asc" | "desc" | "ASC" | "DESC";

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

