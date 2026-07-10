import axiosClient from './axiosClient';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import type { GoogleLoginResponse, TokenPair } from '@/types/auth.type';
import type { VaiTro } from '@/enums/vaiTro';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface RegisterPayload {
  tenNguoiDung: string;
  email: string;
  matKhau: string;
  vaiTro: VaiTro;
}

export interface LoginPayload {
  email: string;
  matKhau: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export interface ChangePasswordPayload {
  matKhauHienTai: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

// Lưu ý: axiosClient đã unwrap { status, message, data } → trả thẳng `data`.
export const authApi = {
  register: (payload: RegisterPayload) =>
    axiosClient.post('/auth/register', payload) as unknown as Promise<TokenPair>,

  login: (payload: LoginPayload) =>
    axiosClient.post('/auth/login', payload) as unknown as Promise<TokenPair>,

  // Điều hướng trình duyệt sang luồng OAuth của Backend.
  loginWithGoogleUrl: () => `${API_URL}/auth/google`,

  confirmRoleGoogle: (tempToken: string, vaiTro: VaiTro) =>
    axiosClient.post('/auth/google/confirm-role', {
      tempToken,
      vaiTro,
    }) as unknown as Promise<GoogleLoginResponse>,

  refreshToken: (refreshToken: string) =>
    axiosClient.post('/auth/refresh', {
      refreshToken,
    }) as unknown as Promise<TokenPair>,

  logout: () => axiosClient.post('/auth/logout') as unknown as Promise<null>,

  forgotPassword: (email: string) =>
    axiosClient.post('/auth/forgot-password', { email }) as unknown as Promise<null>,

  resetPassword: (payload: ResetPasswordPayload) =>
    axiosClient.post('/auth/reset-password', payload) as unknown as Promise<null>,

  changePassword: (payload: ChangePasswordPayload) =>
    axiosClient.patch('/auth/change-password', payload) as unknown as Promise<null>,

  getMe: () => axiosClient.get('/auth/me') as unknown as Promise<NguoiDung>,
};
