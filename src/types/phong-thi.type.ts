import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';
import type { TrangThaiThanhVien } from '@/enums/trangThaiThanhVien';
import type { NguoiDung } from './nguoi-dung.type';
import type { BaiThi } from './bai-thi.type';

// Khớp entity THANH_VIEN_PHONG.
export interface ThanhVienPhong {
  maThanhVien: number;
  maPhongThi: number;
  maNguoiDung: number;
  trangThai: TrangThaiThanhVien;
  nguoiDung?: NguoiDung;
}

// Khớp entity PHONG_THI.
export interface PhongThi {
  maPhongThi: number;
  maBaiThi: number;
  taoBoi: number;
  maThamGiaPhong: string;
  cheDoCauHoi: CheDoCauHoi;
  moLuc: string;
  dongLuc: string;
  soNguoiThamGia?: number | null;
  trangThai: TrangThaiPhongThi;
  baiThi?: BaiThi;
  thanhViens?: ThanhVienPhong[];
}
