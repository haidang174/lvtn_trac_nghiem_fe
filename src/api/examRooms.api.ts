import axiosClient from './axiosClient';
import type { PhongThi, ThanhVienPhong } from '@/types/phong-thi.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';

export interface CreateExamRoomPayload {
  maBaiThi: number;
  cheDoCauHoi: CheDoCauHoi;
  soCauChon?: number;
  moLuc: string; // ISO datetime
  dongLuc: string; // ISO datetime
  soNguoiThamGia?: number;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
// Backend exam-rooms: tạo + xem + danh sách thành viên + đổi trạng thái (không có sửa/xóa).
export const examRoomsApi = {
  getExamRooms: (params: PaginationParams) =>
    axiosClient.get('/exam-rooms', { params }) as unknown as Promise<PaginatedData<PhongThi>>,

  getExamRoomById: (id: number) =>
    axiosClient.get(`/exam-rooms/${id}`) as unknown as Promise<PhongThi>,

  getExamRoomMembers: (id: number) =>
    axiosClient.get(`/exam-rooms/${id}/members`) as unknown as Promise<ThanhVienPhong[]>,

  createExamRoom: (payload: CreateExamRoomPayload) =>
    axiosClient.post('/exam-rooms', payload) as unknown as Promise<PhongThi>,

  updateExamRoomStatus: (id: number, trangThai: TrangThaiPhongThi) =>
    axiosClient.patch(`/exam-rooms/${id}/status`, { trangThai }) as unknown as Promise<PhongThi>,
};
