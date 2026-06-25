// Đồng bộ với common/enums/trang-thai-phong-thi.enum.ts
export const TrangThaiPhongThi = {
  DANG_CHO: 'dang_cho',
  DANG_DIEN_RA: 'dang_dien_ra',
  DA_DONG: 'da_dong',
} as const;

export type TrangThaiPhongThi = (typeof TrangThaiPhongThi)[keyof typeof TrangThaiPhongThi];

export const NHAN_TRANG_THAI_PHONG_THI: Record<TrangThaiPhongThi, string> = {
  dang_cho: 'Đang chờ',
  dang_dien_ra: 'Đang diễn ra',
  da_dong: 'Đã đóng',
};
