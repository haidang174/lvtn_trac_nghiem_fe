// Khớp với common/dto/api-response.dto.ts ở Backend

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Body lỗi do GlobalExceptionFilter trả về: { status, message, errors? }
export interface ApiError {
  status: number;
  message: string;
  errors?: string[];
}

// Tham số phân trang chung (khớp PaginationDto)
export interface PaginationParams {
  page?: number;
  limit?: number;
}
