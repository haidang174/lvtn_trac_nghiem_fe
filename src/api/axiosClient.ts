import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ApiResponse } from '@/types/api-response.type';
import type { TokenPair } from '@/types/auth.type';
import { tokenStorage } from '@/utils/token';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Instance gốc dùng cho toàn bộ request nghiệp vụ.
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Instance riêng để gọi /auth/refresh, tránh vòng lặp interceptor.
const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request: gắn access token vào header ----
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Cơ chế refresh token chống gọi trùng (queue khi đang refresh) ----
let dangRefresh = false;
let hangCho: Array<(token: string | null) => void> = [];

function xuLyHangCho(token: string | null) {
  hangCho.forEach((cb) => cb(token));
  hangCho = [];
}

// Hành động khi refresh thất bại: xóa token, đẩy về trang đăng nhập.
function buocDangXuat() {
  tokenStorage.clear();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// ---- Response: unwrap data, tự refresh khi 401 ----
axiosClient.interceptors.response.use(
  // Backend luôn bọc { status, message, data } → trả thẳng phần data cho caller.
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    return response.data?.data as never;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Chỉ xử lý refresh cho 401 và chưa retry; không áp dụng cho chính route auth.
    const laLoi401 = error.response?.status === 401;
    const laRouteAuth = originalRequest?.url?.includes('/auth/');

    if (laLoi401 && !originalRequest._retry && !laRouteAuth) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        buocDangXuat();
        return Promise.reject(chuanHoaLoi(error));
      }

      // Nếu đang có request refresh chạy → xếp hàng chờ token mới.
      if (dangRefresh) {
        return new Promise((resolve, reject) => {
          hangCho.push((token) => {
            if (!token) return reject(chuanHoaLoi(error));
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      dangRefresh = true;

      try {
        const res = await refreshClient.post<ApiResponse<TokenPair>>(
          '/auth/refresh',
          { refreshToken },
        );
        const tokens = res.data.data;
        if (!tokens) throw new Error('Không nhận được token mới');

        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        xuLyHangCho(tokens.accessToken);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        xuLyHangCho(null);
        buocDangXuat();
        return Promise.reject(refreshError);
      } finally {
        dangRefresh = false;
      }
    }

    return Promise.reject(chuanHoaLoi(error));
  },
);

// Chuẩn hóa lỗi về dạng ApiError để UI hiển thị message thống nhất.
export function chuanHoaLoi(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return {
      status: data?.status ?? error.response?.status ?? 0,
      message: data?.message ?? error.message ?? 'Có lỗi xảy ra',
      errors: data?.errors,
    };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as Partial<ApiError>;
    return {
      status: e.status ?? 0,
      message: e.message ?? 'Có lỗi xảy ra',
      errors: e.errors,
    };
  }
  return { status: 0, message: 'Có lỗi xảy ra' };
}

export default axiosClient;
