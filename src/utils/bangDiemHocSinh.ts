import * as XLSX from 'xlsx';
import { formatScore } from '@/utils/formatScore';
import { formatDateTime } from '@/utils/formatDate';
import { slugTen } from '@/utils/slugTen';
import { NHAN_TRANG_THAI_BAI_LAM } from '@/enums/trangThaiBaiLam';
import type { KetQuaCuaToi } from '@/types/ket-qua.type';

// Một môn trong bảng điểm: danh sách dòng + điểm trung bình các dòng đã thi.
export interface NhomMon {
  maMonHoc: number;
  tenMonHoc: string | null;
  danhSach: KetQuaCuaToi[];
  diemTB: number | null;
}

// Gom các dòng kết quả theo môn, tính điểm TB của các dòng đã thi (bỏ vắng thi).
export function gomTheoMon(items: KetQuaCuaToi[]): NhomMon[] {
  const map = new Map<number, KetQuaCuaToi[]>();
  for (const it of items) {
    const ds = map.get(it.maMonHoc) ?? [];
    ds.push(it);
    map.set(it.maMonHoc, ds);
  }
  return Array.from(map.values()).map((danhSach) => {
    const daThi = danhSach.filter((r) => r.daThi);
    const diemTB = daThi.length
      ? daThi.reduce((s, r) => s + Number(r.diemSo), 0) / daThi.length
      : null;
    return {
      maMonHoc: danhSach[0].maMonHoc,
      tenMonHoc: danhSach[0].tenMonHoc,
      danhSach,
      diemTB,
    };
  });
}

const TIEU_DE_COT = [
  'Phòng thi',
  'Đề thi',
  'Điểm',
  'Đúng/Tổng',
  'Nộp lúc',
  'Trạng thái',
];

interface ThongTinHocSinh {
  maNguoiDung: number;
  tenNguoiDung: string;
  email: string;
}

// Xuất bảng điểm cá nhân của 1 học sinh ra file Excel (.xlsx), gom theo môn,
// kèm điểm TB mỗi môn và cả các dòng "Không tham gia" (giống màn hình).
export function xuatBangDiemExcel(user: ThongTinHocSinh, nhomMon: NhomMon[]): void {
  const rows: (string | number)[][] = [];

  rows.push(['BẢNG ĐIỂM CÁ NHÂN']);
  rows.push(['Họ tên', user.tenNguoiDung]);
  rows.push(['Email', user.email]);
  rows.push(['Mã học sinh', user.maNguoiDung]);
  rows.push([]);

  for (const mon of nhomMon) {
    const tenMon = mon.tenMonHoc ?? 'Môn học';
    const tb = mon.diemTB != null ? `${formatScore(mon.diemTB)}/10` : '—';
    rows.push([`Môn: ${tenMon} — Điểm TB: ${tb}`]);
    rows.push([...TIEU_DE_COT]);
    for (const r of mon.danhSach) {
      if (r.daThi) {
        rows.push([
          r.tenPhongThi,
          r.tieuDe ?? '',
          `${formatScore(r.diemSo)}/10`,
          `${r.soCauDung}/${r.tongSoCau}`,
          r.thoiGianNop ? formatDateTime(r.thoiGianNop) : '',
          (r.trangThaiBaiLam && NHAN_TRANG_THAI_BAI_LAM[r.trangThaiBaiLam]) ||
            'Đã nộp',
        ]);
      } else {
        rows.push([r.tenPhongThi, '', '', '', '', 'Không tham gia']);
      }
    }
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 24 },
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');
  XLSX.writeFile(wb, `Bang-diem-${slugTen(user.tenNguoiDung)}-${user.maNguoiDung}.xlsx`);
}
