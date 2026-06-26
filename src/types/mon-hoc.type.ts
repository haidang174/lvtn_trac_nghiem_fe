// Khớp entity MON_HOC (modules/subjects/entities/mon-hoc.entity.ts)
export interface MonHoc {
  maMonHoc: number;
  maNguoiDung: number;
  tenMonHoc: string;
  maDinhDanhMon?: string | null;
  moTa?: string | null;
  laHoatDong: boolean;
}
