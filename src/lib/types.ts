export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}
