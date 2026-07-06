import axiosClient from './axiosClient';
import type { HocKy } from '@/types/hoc-ky.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';

export interface CreateSemesterPayload {
  tenHocKy: string;
  namHoc: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
}

export type UpdateSemesterPayload = Partial<CreateSemesterPayload>;

export interface QuerySemesterParams extends PaginationParams {
  search?: string;
  laHoatDong?: boolean;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
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

  updateSemesterStatus: (id: number, laHoatDong: boolean) =>
    axiosClient.patch(`/semesters/${id}/status`, {
      laHoatDong,
    }) as unknown as Promise<HocKy>,

  deleteSemester: (id: number) =>
    axiosClient.delete(`/semesters/${id}`) as unknown as Promise<null>,
};
