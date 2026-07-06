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
    axiosClient.delete(`/users/${id}`) as unknown as Promise<null>,
};
