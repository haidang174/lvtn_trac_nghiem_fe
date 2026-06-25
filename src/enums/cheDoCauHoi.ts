// Đồng bộ với common/enums/che-do-cau-hoi.enum.ts
export const CheDoCauHoi = {
  THEO_THU_TU: 'theo_thu_tu',
  XAO_TRON: 'xao_tron',
  NGAU_NHIEN: 'ngau_nhien',
} as const;

export type CheDoCauHoi = (typeof CheDoCauHoi)[keyof typeof CheDoCauHoi];

export const NHAN_CHE_DO_CAU_HOI: Record<CheDoCauHoi, string> = {
  theo_thu_tu: 'Theo thứ tự',
  xao_tron: 'Xáo trộn',
  ngau_nhien: 'Ngẫu nhiên',
};
