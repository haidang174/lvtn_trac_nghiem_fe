import axiosClient from './axiosClient';
import type { BaiThi } from '@/types/bai-thi.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';

// Một câu hỏi trong đề kèm thứ tự.
export interface ExamQuestionOrder {
  maCauHoi: number;
  thuTu: number;
}

export interface CreateExamPayload {
  tieuDe: string;
  maMonHoc: number;
  thoiGianLamBai: number;
  trangThai?: TrangThaiBaiThi;
  cauHois: ExamQuestionOrder[];
}

export type UpdateExamPayload = Partial<CreateExamPayload>;

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
// Backend exams.findAll chỉ nhận page/limit (chưa lọc theo môn/trạng thái ở server).
export const examsApi = {
  getExams: (params: PaginationParams) =>
    axiosClient.get('/exams', { params }) as unknown as Promise<PaginatedData<BaiThi>>,

  getExamById: (id: number) =>
    axiosClient.get(`/exams/${id}`) as unknown as Promise<BaiThi>,

  createExam: (payload: CreateExamPayload) =>
    axiosClient.post('/exams', payload) as unknown as Promise<BaiThi>,

  updateExam: (id: number, payload: UpdateExamPayload) =>
    axiosClient.patch(`/exams/${id}`, payload) as unknown as Promise<BaiThi>,

  updateExamStatus: (id: number, trangThai: TrangThaiBaiThi) =>
    axiosClient.patch(`/exams/${id}/status`, { trangThai }) as unknown as Promise<BaiThi>,

  deleteExam: (id: number) =>
    axiosClient.delete(`/exams/${id}`) as unknown as Promise<null>,
};
