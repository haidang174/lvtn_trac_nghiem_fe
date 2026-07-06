import type { NguoiDung } from './nguoi-dung.type';
import type { MonHocHocKy } from './mon-hoc-hoc-ky.type';

// Khớp entity GHI_DANH.
export interface GhiDanh {
  maGhiDanh: number;
  maMonHocHocKy: number;
  maHocSinh: number;
  hocSinh?: NguoiDung;
  monHocHocKy?: MonHocHocKy;
}
