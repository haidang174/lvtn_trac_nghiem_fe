import axiosClient from './axiosClient';
import type { PhienThi, CauHoiPhien, KetQuaTomTat } from '@/types/bai-lam.type';

// Lưu ý: axiosClient đã unwrap → trả thẳng `data`. Các API này chỉ dành cho học sinh.
export const examSessionsApi = {
  // Vào phòng theo mã phòng (quyền vào dựa trên ghi danh, không còn nhập mã).
  joinExamRoom: (maPhongThi: number) =>
    axiosClient.post('/exam-sessions/join', { maPhongThi }) as unknown as Promise<PhienThi>,

  getExamSession: (id: number) =>
    axiosClient.get(`/exam-sessions/${id}`) as unknown as Promise<PhienThi>,

  getSessionQuestion: (id: number, order: number) =>
    axiosClient.get(`/exam-sessions/${id}/questions/${order}`) as unknown as Promise<CauHoiPhien>,

  // maLuaChons rỗng = bỏ chọn câu hỏi.
  submitAnswer: (id: number, maCauHoi: number, maLuaChons: number[]) =>
    axiosClient.post(`/exam-sessions/${id}/answers`, {
      maCauHoi,
      maLuaChons,
    }) as unknown as Promise<{ maCauHoi: number; maLuaChons: number[] }>,

  submitExam: (id: number) =>
    axiosClient.post(`/exam-sessions/${id}/submit`) as unknown as Promise<KetQuaTomTat>,
};
