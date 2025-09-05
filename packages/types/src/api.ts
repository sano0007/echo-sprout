export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError extends ApiError {
  code: "VALIDATION_ERROR";
  fields: Record<string, string[]>;
}
