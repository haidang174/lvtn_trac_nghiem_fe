import type { NguoiDung } from './nguoi-dung.type';
import type { MonHocHocKy } from './mon-hoc-hoc-ky.type';

// Khớp entity PHAN_CONG_GIANG_DAY.
export interface PhanCongGiangDay {
  maPhanCong: number;
  maMonHocHocKy: number;
  maGiaoVien: number;
  giaoVien?: NguoiDung;
  monHocHocKy?: MonHocHocKy;
}
