// Đồng bộ với common/enums/do-kho.enum.ts
export const DoKho = {
  DE: 'de',
  TRUNG_BINH: 'trung_binh',
  KHO: 'kho',
} as const;

export type DoKho = (typeof DoKho)[keyof typeof DoKho];

export const NHAN_DO_KHO: Record<DoKho, string> = {
  de: 'Dễ',
  trung_binh: 'Trung bình',
  kho: 'Khó',
};
