import type { MonHoc } from './mon-hoc.type';
import type { HocKy } from './hoc-ky.type';

// Khớp entity MON_HOC_HOC_KY — "môn học của học kỳ".
export interface MonHocHocKy {
  maMonHocHocKy: number;
  maMonHoc: number;
  maHocKy: number;
  laHoatDong: boolean;
  monHoc?: MonHoc;
  hocKy?: HocKy;
}
