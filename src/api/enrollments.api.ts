import axiosClient from './axiosClient';
import type { GhiDanh } from '@/types/ghi-danh.type';

export interface CreateEnrollmentPayload {
  maMonHocHocKy: number;
  maHocSinh: number;
}

export interface BulkEnrollmentPayload {
  maMonHocHocKy: number;
  maHocSinhs: number[];
}

export interface QueryEnrollmentParams {
  maMonHocHocKy?: number;
  maHocSinh?: number;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const enrollmentsApi = {
  getEnrollments: (params: QueryEnrollmentParams) =>
    axiosClient.get('/enrollments', { params }) as unknown as Promise<GhiDanh[]>,

  createEnrollment: (payload: CreateEnrollmentPayload) =>
    axiosClient.post('/enrollments', payload) as unknown as Promise<GhiDanh>,

  createBulk: (payload: BulkEnrollmentPayload) =>
    axiosClient.post('/enrollments/bulk', payload) as unknown as Promise<{
      soLuongGhiDanh: number;
    }>,

  deleteEnrollment: (id: number) =>
    axiosClient.delete(`/enrollments/${id}`) as unknown as Promise<null>,
};
