import type { LoaiCauHoi } from '@/enums/loaiCauHoi';
import type { TrangThaiBaiLam } from '@/enums/trangThaiBaiLam';

// Lựa chọn hiển thị khi làm bài (KHÔNG kèm cờ đáp án đúng).
export interface LuaChonPhien {
  maLuaChon: number;
  noiDung: string;
}

// Một câu hỏi trong phiên thi (đã random/xáo trộn theo chế độ phòng).
export interface CauHoiPhien {
  thuTuHienThi: number;
  maCauHoi: number;
  noiDung: string;
  hinhAnh?: string | null;
  loaiCauHoi: LoaiCauHoi;
  luaChons: LuaChonPhien[];
  daChon: number[]; // các maLuaChon đã chọn
}

// Thông tin phiên thi trả về từ join/getSession.
export interface PhienThi {
  maBaiLam: number;
  maPhongThi: number;
  maBaiThi: number;
  tenDeThi: string;
  tenMonHoc: string | null;
  trangThai: TrangThaiBaiLam;
  thoiGianBatDau: string;
  hanNop: string;
  thoiGianNop: string | null;
  thoiGianConLaiGiay: number;
  cauHois: CauHoiPhien[];
}

// Kết quả tóm tắt sau khi nộp / hết giờ.
export interface KetQuaTomTat {
  diemSo: number;
  tongSoCau: number;
  soCauDung: number;
}
