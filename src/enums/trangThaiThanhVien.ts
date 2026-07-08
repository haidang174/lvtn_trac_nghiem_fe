// Đồng bộ với common/enums/trang-thai-thanh-vien.enum.ts
export const TrangThaiThanhVien = {
  DA_THAM_GIA: 'da_tham_gia',
  DA_NOP_BAI: 'da_nop_bai',
  VANG_MAT: 'vang_mat',
} as const;

export type TrangThaiThanhVien = (typeof TrangThaiThanhVien)[keyof typeof TrangThaiThanhVien];

export const NHAN_TRANG_THAI_THANH_VIEN: Record<TrangThaiThanhVien, string> = {
  da_tham_gia: 'Đã tham gia',
  da_nop_bai: 'Đã nộp bài',
  vang_mat: 'Vắng mặt',
};
