// Đồng bộ với common/enums/loai-cau-hoi.enum.ts
export const LoaiCauHoi = {
  MOT_DAP_AN: 'mot_dap_an',
  NHIEU_DAP_AN: 'nhieu_dap_an',
} as const;

export type LoaiCauHoi = (typeof LoaiCauHoi)[keyof typeof LoaiCauHoi];

export const NHAN_LOAI_CAU_HOI: Record<LoaiCauHoi, string> = {
  mot_dap_an: 'Một đáp án',
  nhieu_dap_an: 'Nhiều đáp án',
};
