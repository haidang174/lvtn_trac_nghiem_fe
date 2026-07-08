import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';
import type { TrangThaiThanhVien } from '@/enums/trangThaiThanhVien';
import type { NguoiDung } from './nguoi-dung.type';
import type { BaiThi } from './bai-thi.type';
import type { MonHocHocKy } from './mon-hoc-hoc-ky.type';

// Thành viên phòng (view): mỗi HS được gán vào phòng kèm trạng thái tham gia.
// maThanhVien = null khi HS chưa vào thi (VANG_MAT - chưa có bản ghi THANH_VIEN_PHONG).
export interface ThanhVienPhong {
  maHocSinh: number;
  maThanhVien: number | null;
  trangThai: TrangThaiThanhVien;
  nguoiDung?: NguoiDung;
}

// Khớp entity PHONG_THI_BAI_THI (bảng nối phòng ↔ đề).
export interface PhongThiBaiThi {
  maPhongThiBaiThi: number;
  maPhongThi: number;
  maBaiThi: number;
  baiThi?: BaiThi;
}

// Khớp entity PHONG_THI_HOC_SINH (bảng nối phòng - học sinh được gán).
export interface PhongThiHocSinh {
  maPhongThiHocSinh: number;
  maPhongThi: number;
  maHocSinh: number;
  hocSinh?: NguoiDung;
}

// Khớp entity PHONG_THI — Admin quản lý, chứa nhiều đề, HS vào theo phân công.
export interface PhongThi {
  maPhongThi: number;
  maMonHocHocKy: number;
  taoBoi: number;
  tenPhongThi: string;
  cheDoCauHoi: CheDoCauHoi;
  thoiGianLamBai: number;
  moLuc: string;
  dongLuc: string;
  laHoatDong: boolean;
  trangThai: TrangThaiPhongThi;
  monHocHocKy?: MonHocHocKy;
  phongThiBaiThis?: PhongThiBaiThi[];
  phongThiHocSinhs?: PhongThiHocSinh[];
  thanhViens?: ThanhVienPhong[];
}
