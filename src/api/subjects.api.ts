import axiosClient from './axiosClient';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';

export interface CreateSubjectPayload {
  tenMonHoc: string;
  maDinhDanhMon?: string;
  moTa?: string;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const subjectsApi = {
  getSubjects: (params: PaginationParams) =>
    axiosClient.get('/subjects', { params }) as unknown as Promise<PaginatedData<MonHoc>>,

  getSubjectById: (id: number) =>
    axiosClient.get(`/subjects/${id}`) as unknown as Promise<MonHoc>,

  createSubject: (payload: CreateSubjectPayload) =>
    axiosClient.post('/subjects', payload) as unknown as Promise<MonHoc>,

  updateSubject: (id: number, payload: UpdateSubjectPayload) =>
    axiosClient.patch(`/subjects/${id}`, payload) as unknown as Promise<MonHoc>,

  deleteSubject: (id: number) =>
    axiosClient.delete(`/subjects/${id}`) as unknown as Promise<null>,

  updateSubjectStatus: (id: number, laHoatDong: boolean) =>
    axiosClient.patch(`/subjects/${id}/status`, { laHoatDong }) as unknown as Promise<MonHoc>,
};
