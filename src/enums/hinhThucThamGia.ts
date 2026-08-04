// Đồng bộ với common/enums/hinh-thuc-tham-gia.enum.ts
export const HinhThucThamGia = {
  GAN_HOC_SINH: 'gan_hoc_sinh',
  MA_THAM_GIA: 'ma_tham_gia',
} as const;

export type HinhThucThamGia =
  (typeof HinhThucThamGia)[keyof typeof HinhThucThamGia];

export const NHAN_HINH_THUC_THAM_GIA: Record<HinhThucThamGia, string> = {
  gan_hoc_sinh: 'Gán học sinh',
  ma_tham_gia: 'Mã tham gia',
};
