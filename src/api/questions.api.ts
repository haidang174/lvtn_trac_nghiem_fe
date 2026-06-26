import axiosClient from './axiosClient';
import type { CauHoi } from '@/types/cau-hoi.type';
import type { PaginatedData, PaginationParams } from '@/types/api-response.type';
import type { DoKho } from '@/enums/doKho';
import type { LoaiCauHoi } from '@/enums/loaiCauHoi';

// Lựa chọn khi tạo/cập nhật (kèm cờ đáp án đúng).
export interface LuaChonInput {
  noiDung: string;
  laDapAnDung: boolean;
}

export interface CreateQuestionPayload {
  noiDung: string;
  maMonHoc: number;
  doKho: DoKho;
  loaiCauHoi: LoaiCauHoi;
  luaChons: LuaChonInput[];
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

// Tham số tìm kiếm/lọc câu hỏi (lọc ở server).
export interface QueryQuestionParams extends PaginationParams {
  // Tìm theo nội dung câu hỏi.
  search?: string;
  maMonHoc?: number;
  doKho?: DoKho;
  loaiCauHoi?: LoaiCauHoi;
}

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`.
export const questionsApi = {
  getQuestions: (params: QueryQuestionParams) =>
    axiosClient.get('/questions', { params }) as unknown as Promise<PaginatedData<CauHoi>>,

  getQuestionById: (id: number) =>
    axiosClient.get(`/questions/${id}`) as unknown as Promise<CauHoi>,

  createQuestion: (payload: CreateQuestionPayload) =>
    axiosClient.post('/questions', payload) as unknown as Promise<CauHoi>,

  updateQuestion: (id: number, payload: UpdateQuestionPayload) =>
    axiosClient.patch(`/questions/${id}`, payload) as unknown as Promise<CauHoi>,

  deleteQuestion: (id: number) =>
    axiosClient.delete(`/questions/${id}`) as unknown as Promise<null>,

  uploadQuestionImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/questions/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as unknown as Promise<CauHoi>;
  },
};
