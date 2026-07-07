import axiosClient from './axiosClient';
import type { PhanCongGiangDay } from '@/types/phan-cong.type';

export interface CreateTeachingAssignmentPayload {
  maMonHocHocKy: number;
  maGiaoVien: number;
}

export interface BulkTeachingAssignmentPayload {
  maMonHocHocKy: number;
  maGiaoViens: number[];
}

export interface QueryTeachingAssignmentParams {
  maMonHocHocKy?: number;
  maGiaoVien?: number;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const teachingAssignmentsApi = {
  getAssignments: (params: QueryTeachingAssignmentParams) =>
    axiosClient.get('/teaching-assignments', { params }) as unknown as Promise<
      PhanCongGiangDay[]
    >,

  createAssignment: (payload: CreateTeachingAssignmentPayload) =>
    axiosClient.post('/teaching-assignments', payload) as unknown as Promise<
      PhanCongGiangDay
    >,

  createBulk: (payload: BulkTeachingAssignmentPayload) =>
    axiosClient.post('/teaching-assignments/bulk', payload) as unknown as Promise<{
      soLuongPhanCong: number;
    }>,

  deleteAssignment: (id: number) =>
    axiosClient.delete(`/teaching-assignments/${id}`) as unknown as Promise<null>,
};
