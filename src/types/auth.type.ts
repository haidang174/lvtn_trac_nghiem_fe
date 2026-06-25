import type { VaiTro } from '@/enums/vaiTro';

// Cặp token trả về từ /auth/login, /auth/register, /auth/refresh
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Thông tin user rút gọn kèm trong phản hồi đăng nhập Google
export interface GoogleUserInfo {
  maNguoiDung?: number;
  email: string;
  tenNguoiDung: string;
  vaiTro?: VaiTro;
}

// Phản hồi /auth/google/callback và /auth/google/confirm-role
// - needSelectRole = true: user mới, cần chọn vai trò bằng tempToken
// - needSelectRole = false: đăng nhập luôn, kèm token + user
export interface GoogleLoginResponse extends Partial<TokenPair> {
  needSelectRole: boolean;
  tempToken?: string;
  user: GoogleUserInfo;
}
