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
  // Chỉ lấy môn của học kỳ chưa kết thúc (dùng cho form tạo đề thi/phòng thi).
  chuaKetThuc?: boolean;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const subjectOfferingsApi = {
  getOfferings: (params: QuerySubjectOfferingParams) =>
    axiosClient.get('/subject-offerings', { params }) as unknown as Promise<
      PaginatedData<MonHocHocKy>
    >,

  // Giáo viên: các môn-học-kỳ mình được phân dạy.
  getMyTeaching: () =>
    axiosClient.get('/subject-offerings/me/teaching') as unknown as Promise<
      MonHocHocKy[]
    >,

  createOffering: (payload: CreateSubjectOfferingPayload) =>
    axiosClient.post('/subject-offerings', payload) as unknown as Promise<MonHocHocKy>,

  deleteOffering: (id: number) =>
    axiosClient.delete(`/subject-offerings/${id}`) as unknown as Promise<null>,
};
