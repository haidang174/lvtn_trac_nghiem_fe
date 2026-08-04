import type { CheDoCauHoi } from '@/enums/cheDoCauHoi';
import type { HinhThucThamGia } from '@/enums/hinhThucThamGia';
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

// Khớp entity PHONG_THI_HOC_SINH (bảng nối phòng - học sinh trong phòng: do
// Admin gán, hoặc do chính HS nhập mã tham gia).
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
  hinhThucThamGia: HinhThucThamGia;
  // Chỉ Admin thấy mã; HS/GV luôn nhận null.
  maThamGia: string | null;
  thoiGianLamBai: number;
  moLuc: string;
  dongLuc: string;
  trangThai: TrangThaiPhongThi;
  monHocHocKy?: MonHocHocKy;
  phongThiBaiThis?: PhongThiBaiThi[];
  phongThiHocSinhs?: PhongThiHocSinh[];
  thanhViens?: ThanhVienPhong[];
}
