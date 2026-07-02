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
  maMonHoc: number;
  tenMonHoc: string | null;
  maPhongThi: number;
  thoiGianBatDau: string;
  thoiGianNop: string;
  trangThaiBaiLam: TrangThaiBaiLam;
  // Giờ đóng phòng — chi tiết kết quả chỉ mở sau thời điểm này.
  dongLuc: string;
}

// Một dòng kết quả cho GV/Admin (raw từ getResults).
export interface KetQuaItem {
  maKetQua: number;
  maBaiLam: number;
  maBaiThi: number;
  maNguoiDung: number;
  tenNguoiDung: string | null;
  email: string | null;
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

// Thống kê gom nhóm theo phòng thi (một dòng = một phòng).
export interface ThongKePhong {
  maPhongThi: number;
  maThamGiaPhong: string;
  tieuDe: string; // tên đề thi
  soLuotNop: number; // tử số: số lượt đã nộp
  tongThanhVien: number; // mẫu số: số em đã vào phòng
  diemTrungBinh: number;
  diemCaoNhat: number;
  diemThapNhat: number;
}
