import axiosClient from './axiosClient';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';

export interface CreateSubjectOfferingPayload {
  maMonHoc: number;
  maHocKy: number;
}

export interface QuerySubjectOfferingParams extends PaginationParams {
  maHocKy?: number;
  maMonHoc?: number;
  search?: string;
  laHoatDong?: boolean;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const subjectOfferingsApi = {
  getOfferings: (params: QuerySubjectOfferingParams) =>
    axiosClient.get('/subject-offerings', { params }) as unknown as Promise<
      PaginatedData<MonHocHocKy>
    >,

  getOfferingById: (id: number) =>
    axiosClient.get(`/subject-offerings/${id}`) as unknown as Promise<MonHocHocKy>,

  // Giáo viên: các môn-học-kỳ mình được phân dạy.
  getMyTeaching: () =>
    axiosClient.get('/subject-offerings/me/teaching') as unknown as Promise<
      MonHocHocKy[]
    >,

  // Học sinh: các môn-học-kỳ mình đã ghi danh.
  getMyEnrolled: () =>
    axiosClient.get('/subject-offerings/me/enrolled') as unknown as Promise<
      MonHocHocKy[]
    >,

  createOffering: (payload: CreateSubjectOfferingPayload) =>
    axiosClient.post('/subject-offerings', payload) as unknown as Promise<MonHocHocKy>,

  updateOfferingStatus: (id: number, laHoatDong: boolean) =>
    axiosClient.patch(`/subject-offerings/${id}/status`, {
      laHoatDong,
    }) as unknown as Promise<MonHocHocKy>,

  deleteOffering: (id: number) =>
    axiosClient.delete(`/subject-offerings/${id}`) as unknown as Promise<null>,
};
