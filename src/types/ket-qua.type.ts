import type { LoaiCauHoi } from '@/enums/loaiCauHoi';
import type { TrangThaiBaiLam } from '@/enums/trangThaiBaiLam';

// Một dòng lịch sử thi của học sinh (raw từ getMyResults). Mỗi dòng = 1 phòng
// đã đóng em được gán; phòng em KHÔNG tham gia có daThi=false, các trường
// điểm/đề = null.
export interface KetQuaCuaToi {
  maPhongThi: number;
  tenPhongThi: string;
  maMonHoc: number;
  tenMonHoc: string | null;
  daThi: boolean;
  maKetQua: number | null;
  maBaiLam: number | null;
  maBaiThi: number | null;
  diemSo: number | string | null;
  tongSoCau: number | null;
  soCauDung: number | null;
  tieuDe: string | null;
  thoiGianBatDau: string | null;
  thoiGianNop: string | null;
  trangThaiBaiLam: TrangThaiBaiLam | null;
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

// Một dòng bảng điểm phòng: mọi HS được gán vào phòng, kèm điểm nếu đã thi.
export interface BangDiemPhongItem {
  maNguoiDung: number;
  tenNguoiDung: string | null;
  email: string | null;
  daThi: boolean;
  maKetQua: number | null;
  tieuDe: string | null; // tên đề đã bốc
  diemSo: number | string | null;
  soCauDung: number | null;
  tongSoCau: number | null;
  thoiGianNop: string | null;
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
  tenPhongThi: string;
  tenMonHoc: string | null;
  tenHocKy: string | null;
  namHoc: string | null;
  soLuotNop: number; // tử số: số lượt đã nộp
  tongThanhVien: number; // mẫu số: số em đã vào phòng
  diemTrungBinh: number;
  diemCaoNhat: number;
  diemThapNhat: number;
}
