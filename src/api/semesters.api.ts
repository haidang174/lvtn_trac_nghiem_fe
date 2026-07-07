import axiosClient from './axiosClient';
import type { HocKy } from '@/types/hoc-ky.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';

export interface CreateSemesterPayload {
  tenHocKy: string;
  namHoc: string;
  ngayBatDau: string;
  ngayKetThuc: string;
}

export type UpdateSemesterPayload = Partial<CreateSemesterPayload>;

export interface QuerySemesterParams extends PaginationParams {
  search?: string;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
// Học kỳ luôn tồn tại để xem lại lịch sử - không có API xóa.
export const semestersApi = {
  getSemesters: (params: QuerySemesterParams) =>
    axiosClient.get('/semesters', { params }) as unknown as Promise<
      PaginatedData<HocKy>
    >,

  getSemesterById: (id: number) =>
    axiosClient.get(`/semesters/${id}`) as unknown as Promise<HocKy>,

  createSemester: (payload: CreateSemesterPayload) =>
    axiosClient.post('/semesters', payload) as unknown as Promise<HocKy>,

  updateSemester: (id: number, payload: UpdateSemesterPayload) =>
    axiosClient.patch(`/semesters/${id}`, payload) as unknown as Promise<HocKy>,
};
