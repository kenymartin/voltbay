export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination?: PaginationInfo
} 