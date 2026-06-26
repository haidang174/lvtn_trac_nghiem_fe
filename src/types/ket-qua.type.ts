import type { LoaiCauHoi } from '@/enums/loaiCauHoi';
import type { TrangThaiBaiLam } from '@/enums/trangThaiBaiLam';

// Một dòng lịch sử thi của học sinh (raw từ getMyResults).
export interface KetQuaCuaToi {
  maKetQua: number;
  maBaiLam: number;
  maBaiThi: number;
  diemSo: number | string;
  tongSoCau: number;
  soCauDung: number;
  tieuDe: string;
  maPhongThi: number;
  thoiGianBatDau: string;
  thoiGianNop: string;
  trangThaiBaiLam: TrangThaiBaiLam;
}

// Một dòng kết quả cho GV/Admin (raw từ getResults).
export interface KetQuaItem {
  maKetQua: number;
  maBaiLam: number;
  maBaiThi: number;
  maNguoiDung: number;
  diemSo: number | string;
  tongSoCau: number;
  soCauDung: number;
  tieuDe: string;
  maPhongThi: number;
  thoiGianNop: string;
}

// Lựa chọn trong chi tiết kết quả (kèm đáp án đúng + đã chọn).
export interface LuaChonKetQua {
  maLuaChon: number;
  noiDung: string;
  laDapAnDung: boolean;
  daChon: boolean;
}

export interface CauHoiKetQua {
  thuTuHienThi: number;
  maCauHoi: number;
  noiDung: string;
  hinhAnh?: string | null;
  loaiCauHoi: LoaiCauHoi;
  dung: boolean;
  luaChons: LuaChonKetQua[];
}

// Chi tiết 1 kết quả.
export interface KetQuaChiTiet {
  maKetQua: number;
  maBaiLam: number;
  maBaiThi: number;
  diemSo: number | string;
  tongSoCau: number;
  soCauDung: number;
  cauHois: CauHoiKetQua[];
}

// Thống kê điểm.
export interface ThongKeKetQua {
  soLuotThi: number;
  diemTrungBinh: number;
  diemCaoNhat: number;
  diemThapNhat: number;
}
