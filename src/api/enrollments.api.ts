import axiosClient from './axiosClient';
import type { GhiDanh } from '@/types/ghi-danh.type';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';

export interface QueryEnrollmentParams {
  maMonHocHocKy?: number;
  maHocSinh?: number;
}

// Môn-học-kỳ học sinh đăng ký được, kèm cờ đã đăng ký.
export interface MonKhaDung extends MonHocHocKy {
  daDangKy: boolean;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const enrollmentsApi = {
  // Admin: danh sách học sinh đã đăng ký theo môn (dùng cho picker gán phòng).
  getEnrollments: (params: QueryEnrollmentParams) =>
    axiosClient.get('/enrollments', { params }) as unknown as Promise<GhiDanh[]>,

  // Học sinh: danh sách môn đăng ký được.
  getAvailable: () =>
    axiosClient.get('/enrollments/available') as unknown as Promise<
      MonKhaDung[]
    >,

  // Học sinh: tự đăng ký 1 môn-học-kỳ.
  register: (maMonHocHocKy: number) =>
    axiosClient.post('/enrollments/register', {
      maMonHocHocKy,
    }) as unknown as Promise<GhiDanh>,

  // Học sinh: tự hủy đăng ký 1 môn-học-kỳ.
  unregister: (maMonHocHocKy: number) =>
    axiosClient.delete(
      `/enrollments/register/${maMonHocHocKy}`,
    ) as unknown as Promise<null>,
};
