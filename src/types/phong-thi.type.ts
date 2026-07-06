import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';
import type { TrangThaiThanhVien } from '@/enums/trangThaiThanhVien';
import type { NguoiDung } from './nguoi-dung.type';
import type { BaiThi } from './bai-thi.type';
import type { MonHocHocKy } from './mon-hoc-hoc-ky.type';

// Khớp entity THANH_VIEN_PHONG.
export interface ThanhVienPhong {
  maThanhVien: number;
  maPhongThi: number;
  maNguoiDung: number;
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

// Khớp entity PHONG_THI — Admin quản lý, chứa nhiều đề, vào theo ghi danh.
export interface PhongThi {
  maPhongThi: number;
  maMonHocHocKy: number;
  taoBoi: number;
  tenPhongThi: string;
  cheDoCauHoi: CheDoCauHoi;
  thoiGianLamBai: number;
  moLuc: string;
  dongLuc: string;
  soNguoiThamGia?: number | null;
  laHoatDong: boolean;
  trangThai: TrangThaiPhongThi;
  monHocHocKy?: MonHocHocKy;
  phongThiBaiThis?: PhongThiBaiThi[];
  thanhViens?: ThanhVienPhong[];
}
