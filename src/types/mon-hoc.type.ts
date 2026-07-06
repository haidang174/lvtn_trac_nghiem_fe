// Khớp entity MON_HOC — danh mục chung do Admin quản lý (không còn owner).
export interface MonHoc {
  maMonHoc: number;
  maMon?: string | null;
  tenMonHoc: string;
  moTa?: string | null;
  laHoatDong: boolean;
}
