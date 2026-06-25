// Đồng bộ với common/enums/vai-tro.enum.ts ở Backend
export const VaiTro = {
  HOC_SINH: 'hoc_sinh',
  GIAO_VIEN: 'giao_vien',
  QUAN_TRI_VIEN: 'quan_tri_vien',
} as const;

export type VaiTro = (typeof VaiTro)[keyof typeof VaiTro];

export const NHAN_VAI_TRO: Record<VaiTro, string> = {
  hoc_sinh: 'Học sinh',
  giao_vien: 'Giáo viên',
  quan_tri_vien: 'Quản trị viên',
};
