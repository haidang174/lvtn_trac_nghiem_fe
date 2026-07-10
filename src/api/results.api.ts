import axiosClient from './axiosClient';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type {
  KetQuaCuaToi,
  KetQuaItem,
  KetQuaChiTiet,
  ThongKeKetQua,
  ThongKePhong,
  BangDiemPhongItem,
} from '@/types/ket-qua.type';

export interface QueryResultParams extends PaginationParams {
  maBaiThi?: number;
  maPhongThi?: number;
  maNguoiDung?: number;
}

export interface QueryMyResultParams extends PaginationParams {
  // Tìm theo tên đề thi.
  search?: string;
  maMonHoc?: number;
}

// Môn học mà HS đã thi (cho bộ lọc lịch sử).
export interface MonDaThi {
  maMonHoc: number;
  tenMonHoc: string;
}

export interface QueryStatsParams {
  maBaiThi?: number;
  maPhongThi?: number;
  maMonHoc?: number;
}

export interface QueryRoomStatsParams extends PaginationParams {
  maBaiThi?: number;
  maMonHoc?: number;
  // Tìm theo mã phòng / tên đề thi.
  search?: string;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const resultsApi = {
  // Học sinh: lịch sử thi của mình (tìm tên đề + lọc môn).
  getMyResults: (params: QueryMyResultParams) =>
    axiosClient.get('/results/me', { params }) as unknown as Promise<PaginatedData<KetQuaCuaToi>>,

  // Học sinh: danh sách môn đã thi (cho bộ lọc).
  getMySubjects: () =>
    axiosClient.get('/results/me/subjects') as unknown as Promise<MonDaThi[]>,

  // Admin: bảng điểm tất cả môn của 1 học sinh (mảng phẳng, gom nhóm ở FE).
  getStudentResults: (maHocSinh: number) =>
    axiosClient.get(`/results/students/${maHocSinh}`) as unknown as Promise<KetQuaCuaToi[]>,

  // GV/Admin: danh sách kết quả theo đề/phòng/người dùng.
  getResults: (params: QueryResultParams) =>
    axiosClient.get('/results', { params }) as unknown as Promise<PaginatedData<KetQuaItem>>,

  // GV/Admin: thống kê điểm.
  getResultStats: (params: QueryStatsParams) =>
    axiosClient.get('/results/stats', { params }) as unknown as Promise<ThongKeKetQua>,

  // GV/Admin: thống kê gom nhóm theo phòng thi (tổng quan).
  getRoomStats: (params: QueryRoomStatsParams) =>
    axiosClient.get('/results/rooms', { params }) as unknown as Promise<
      PaginatedData<ThongKePhong>
    >,

  // GV/Admin: bảng điểm 1 phòng — mọi HS được gán (kể cả chưa thi).
  getRoomScores: (maPhongThi: number, params: PaginationParams) =>
    axiosClient.get(`/results/rooms/${maPhongThi}/scores`, {
      params,
    }) as unknown as Promise<PaginatedData<BangDiemPhongItem>>,

  // Chi tiết 1 kết quả (HS xem của mình, GV xem đề của mình, Admin xem tất cả).
  getResultById: (id: number) =>
    axiosClient.get(`/results/${id}`) as unknown as Promise<KetQuaChiTiet>,
};
