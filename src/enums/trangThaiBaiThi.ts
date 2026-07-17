// Đồng bộ với common/enums/trang-thai-bai-thi.enum.ts
export const TrangThaiBaiThi = {
  NHAP: 'nhap',
  CONG_KHAI: 'cong_khai',
} as const;

export type TrangThaiBaiThi = (typeof TrangThaiBaiThi)[keyof typeof TrangThaiBaiThi];

export const NHAN_TRANG_THAI_BAI_THI: Record<TrangThaiBaiThi, string> = {
  nhap: 'Nháp',
  cong_khai: 'Công khai',
};
