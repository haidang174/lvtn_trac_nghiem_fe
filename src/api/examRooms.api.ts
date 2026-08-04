import axiosClient from './axiosClient';
import type { PhongThi, ThanhVienPhong } from '@/types/phong-thi.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { HinhThucThamGia } from '@/enums/hinhThucThamGia';
import type { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';

export interface CreateExamRoomPayload {
  maMonHocHocKy: number;
  tenPhongThi: string;
  maBaiThis: number[];
  hinhThucThamGia: HinhThucThamGia;
  // Chỉ gửi khi hinhThucThamGia = GAN_HOC_SINH (chế độ mã: HS tự nhập mã).
  maHocSinhs?: number[];
  cheDoCauHoi: CheDoCauHoi;
  thoiGianLamBai: number;
  moLuc: string; // ISO datetime; giờ đóng phòng = moLuc + thoiGianLamBai.
}

// Kết quả HS nhập mã tham gia — payload gọn, không kèm danh sách bạn cùng phòng.
export interface KetQuaThamGiaBangMa {
  maPhongThi: number;
  tenPhongThi: string;
  trangThai: TrangThaiPhongThi;
  moLuc: string;
  dongLuc: string;
  daThamGiaTruocDo: boolean;
}

export type UpdateExamRoomPayload = Partial<CreateExamRoomPayload>;

export interface QueryExamRoomParams extends PaginationParams {
  search?: string;
  maMonHocHocKy?: number;
  trangThai?: TrangThaiPhongThi;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
// Phòng thi do Admin quản lý (CRUD); học sinh xem danh sách theo ghi danh.
export const examRoomsApi = {
  getExamRooms: (params: QueryExamRoomParams) =>
    axiosClient.get('/exam-rooms', { params }) as unknown as Promise<
      PaginatedData<PhongThi>
    >,

  // Học sinh: phòng mình có mặt (Admin gán hoặc đã nhập mã tham gia).
  getAvailableRooms: () =>
    axiosClient.get('/exam-rooms/available') as unknown as Promise<{
      items: PhongThi[];
      total: number;
    }>,

  // Admin: maHocSinh đã gán vào phòng khác của môn-học-kỳ (ẩn khỏi picker).
  getAssignedStudents: (maMonHocHocKy: number, excludePhongThi?: number) =>
    axiosClient.get('/exam-rooms/assigned-students', {
      params: { maMonHocHocKy, excludePhongThi },
    }) as unknown as Promise<number[]>,

  getExamRoomById: (id: number) =>
    axiosClient.get(`/exam-rooms/${id}`) as unknown as Promise<PhongThi>,

  getExamRoomMembers: (id: number) =>
    axiosClient.get(`/exam-rooms/${id}/members`) as unknown as Promise<
      ThanhVienPhong[]
    >,

  createExamRoom: (payload: CreateExamRoomPayload) =>
    axiosClient.post('/exam-rooms', payload) as unknown as Promise<PhongThi>,

  updateExamRoom: (id: number, payload: UpdateExamRoomPayload) =>
    axiosClient.patch(`/exam-rooms/${id}`, payload) as unknown as Promise<PhongThi>,

  updateExamRoomStatus: (id: number, trangThai: TrangThaiPhongThi) =>
    axiosClient.patch(`/exam-rooms/${id}/status`, {
      trangThai,
    }) as unknown as Promise<PhongThi>,

  // Học sinh: nhập mã tham gia để tự vào phòng.
  joinByCode: (maThamGia: string) =>
    axiosClient.post('/exam-rooms/join-by-code', {
      maThamGia,
    }) as unknown as Promise<KetQuaThamGiaBangMa>,

  deleteExamRoom: (id: number) =>
    axiosClient.delete(`/exam-rooms/${id}`) as unknown as Promise<null>,
};
