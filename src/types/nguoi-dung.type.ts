import type { VaiTro } from '@/enums/vaiTro';

// Khớp entity NGUOI_DUNG (modules/auth/entities/nguoi-dung.entity.ts)
export interface NguoiDung {
  maNguoiDung: number;
  tenNguoiDung: string;
  email: string;
  vaiTro: VaiTro;
  laHoatDong: boolean;
}
