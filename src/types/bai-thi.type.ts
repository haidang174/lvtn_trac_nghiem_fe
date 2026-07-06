import type { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';
import type { CauHoi } from './cau-hoi.type';
import type { MonHocHocKy } from './mon-hoc-hoc-ky.type';
import type { NguoiDung } from './nguoi-dung.type';

// Khớp entity CAU_HOI_BAI_THI (bảng trung gian đề thi ↔ câu hỏi).
export interface CauHoiBaiThi {
  maCauHoiBaiThi: number;
  maBaiThi: number;
  maCauHoi: number;
  thuTu: number;
  cauHoi?: CauHoi;
}

// Khớp entity BAI_THI — đề thi gắn 1 môn-học-kỳ.
export interface BaiThi {
  maBaiThi: number;
  taoBoi: number;
  maMonHocHocKy: number;
  tieuDe: string;
  thoiGianLamBai: number; // phút
  trangThai: TrangThaiBaiThi;
  cauHoiBaiThis?: CauHoiBaiThi[];
  // BE join để hiển thị môn học / học kỳ / người tạo.
  monHocHocKy?: MonHocHocKy;
  nguoiTao?: NguoiDung;
  // Cờ runtime từ BE (findOne): đề đã có phòng thi hoặc bài làm => khóa sửa câu hỏi.
  daSuDung?: boolean;
}
