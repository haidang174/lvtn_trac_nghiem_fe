import type { DoKho } from '@/enums/doKho';
import type { LoaiCauHoi } from '@/enums/loaiCauHoi';

// Khớp entity LUA_CHON. Lưu ý: GET /questions/:id KHÔNG trả cờ đáp án đúng
// (bảng DAP_AN không được join), nên `laDapAnDung` có thể không có khi đọc về.
export interface LuaChon {
  maLuaChon: number;
  maCauHoi: number;
  noiDung: string;
  laDapAnDung?: boolean;
}

// Khớp entity CAU_HOI (relations: luaChons khi đọc danh sách/chi tiết).
export interface CauHoi {
  maCauHoi: number;
  taoBoi: number;
  maMonHoc: number;
  noiDung: string;
  hinhAnh?: string | null;
  doKho: DoKho;
  loaiCauHoi: LoaiCauHoi;
  luaChons: LuaChon[];
}
