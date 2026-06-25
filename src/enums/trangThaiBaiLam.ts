// Đồng bộ với common/enums/trang-thai-bai-lam.enum.ts
export const TrangThaiBaiLam = {
  DANG_LAM: 'dang_lam',
  DA_NOP: 'da_nop',
  HET_THOI_GIAN: 'het_thoi_gian',
} as const;

export type TrangThaiBaiLam = (typeof TrangThaiBaiLam)[keyof typeof TrangThaiBaiLam];

export const NHAN_TRANG_THAI_BAI_LAM: Record<TrangThaiBaiLam, string> = {
  dang_lam: 'Đang làm',
  da_nop: 'Đã nộp',
  het_thoi_gian: 'Hết thời gian',
};
