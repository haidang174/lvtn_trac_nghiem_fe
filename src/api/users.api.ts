import axiosClient from './axiosClient';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { VaiTro } from '@/enums/vaiTro';

export interface QueryUserParams extends PaginationParams {
  vaiTro?: VaiTro;
  laHoatDong?: boolean;
  search?: string;
}

// Lưu ý: axiosClient đã unwrap { status, message, data } → trả thẳng `data`.
// Backend users chỉ có: danh sách, chi tiết, đổi trạng thái (không có xóa).
export const usersApi = {
  getUsers: (params: QueryUserParams) =>
    axiosClient.get('/users', { params }) as unknown as Promise<PaginatedData<NguoiDung>>,

  getUserById: (id: number) =>
    axiosClient.get(`/users/${id}`) as unknown as Promise<NguoiDung>,

  updateUserStatus: (id: number, laHoatDong: boolean) =>
    axiosClient.patch(`/users/${id}/status`, { laHoatDong }) as unknown as Promise<NguoiDung>,
};
