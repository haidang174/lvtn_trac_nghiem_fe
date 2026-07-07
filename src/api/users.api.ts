import axiosClient from './axiosClient';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { VaiTro } from '@/enums/vaiTro';

export interface QueryUserParams extends PaginationParams {
  vaiTro?: VaiTro;
  laHoatDong?: boolean;
  search?: string;
}

export interface CreateUserPayload {
  tenNguoiDung: string;
  email: string;
  vaiTro: VaiTro;
  matKhau?: string;
}

export interface UpdateUserPayload {
  tenNguoiDung?: string;
  vaiTro?: VaiTro;
  laHoatDong?: boolean;
}

// Một dòng trong file import kèm kết quả kiểm tra từ BE.
export interface DongImport {
  tenNguoiDung: string;
  email: string;
  hopLe: boolean;
  lyDo?: string;
}

export interface KetQuaImport {
  soLuongTao: number;
  soLuongBoQua: number;
  danhSachBoQua: { tenNguoiDung: string; email: string; lyDo: string }[];
}

// Lưu ý: axiosClient đã unwrap { status, message, data } → trả thẳng `data`.
export const usersApi = {
  getUsers: (params: QueryUserParams) =>
    axiosClient.get('/users', { params }) as unknown as Promise<PaginatedData<NguoiDung>>,

  getUserById: (id: number) =>
    axiosClient.get(`/users/${id}`) as unknown as Promise<NguoiDung>,

  createUser: (payload: CreateUserPayload) =>
    axiosClient.post('/users', payload) as unknown as Promise<NguoiDung>,

  updateUser: (id: number, payload: UpdateUserPayload) =>
    axiosClient.patch(`/users/${id}`, payload) as unknown as Promise<NguoiDung>,

  updateUserStatus: (id: number, laHoatDong: boolean) =>
    axiosClient.patch(`/users/${id}/status`, { laHoatDong }) as unknown as Promise<NguoiDung>,

  deleteUser: (id: number) =>
    axiosClient.delete(`/users/${id}`) as unknown as Promise<{ daXoaCung: boolean }>,

  // Tải file .xlsx lên để BE đọc & kiểm tra (chưa lưu DB).
  previewImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/users/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as unknown as Promise<{ danhSach: DongImport[] }>;
  },

  // Tạo hàng loạt; BE bỏ qua dòng lỗi và báo cáo kết quả.
  importUsers: (vaiTro: VaiTro, danhSach: { tenNguoiDung: string; email: string }[]) =>
    axiosClient.post('/users/import', { vaiTro, danhSach }) as unknown as Promise<KetQuaImport>,
};
