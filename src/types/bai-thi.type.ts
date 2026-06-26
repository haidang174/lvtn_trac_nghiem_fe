import type { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';
import type { CauHoi } from './cau-hoi.type';

// Khớp entity CAU_HOI_BAI_THI (bảng trung gian đề thi ↔ câu hỏi).
export interface CauHoiBaiThi {
  maCauHoiBaiThi: number;
  maBaiThi: number;
  maCauHoi: number;
  thuTu: number;
  // Có khi đọc chi tiết đề (relations: cauHoiBaiThis.cauHoi.luaChons).
  cauHoi?: CauHoi;
}

// Khớp entity BAI_THI.
export interface BaiThi {
  maBaiThi: number;
  taoBoi: number;
  maMonHoc: number;
  tieuDe: string;
  thoiGianLamBai: number; // phút
  trangThai: TrangThaiBaiThi;
  cauHoiBaiThis?: CauHoiBaiThi[];
}
