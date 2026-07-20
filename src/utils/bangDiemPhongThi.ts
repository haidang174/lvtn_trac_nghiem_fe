import ExcelJS from 'exceljs';
import { slugTen } from '@/utils/slugTen';
import type { BangDiemPhongItem } from '@/types/ket-qua.type';
import type { PhongThi } from '@/types/phong-thi.type';

// Tách họ tên thành (họ đệm, tên) theo khoảng trắng CUỐI cùng — đúng mẫu bảng
// điểm của trường (cột "Họ và tên HS-SV" chia làm 2 ô).
// "Nguyễn Trần Tuấn Khoa" -> { hoDem: 'Nguyễn Trần Tuấn', ten: 'Khoa' }
function tachHoTen(hoTen: string): { hoDem: string; ten: string } {
  const s = hoTen.trim().replace(/\s+/g, ' ');
  const i = s.lastIndexOf(' ');
  if (i < 0) return { hoDem: '', ten: s };
  return { hoDem: s.slice(0, i), ten: s.slice(i + 1) };
}

// MSSV không được lưu riêng trong DB — email trường có dạng <mssv>@... nên lấy
// phần trước dấu @ làm MSSV.
function mssvTuEmail(email?: string | null): string {
  if (!email) return '';
  return email.split('@')[0] ?? '';
}

const FONT = 'Times New Roman';
const VIEN_MONG: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

// Xuất bảng điểm của 1 phòng thi ra .xlsx theo đúng biểu mẫu của trường:
// tiêu đề trường/quốc hiệu, "BẢNG ĐIỂM THI MÔN", tên môn + tên phòng, rồi bảng
// TT | MSSV | Email | Họ đệm | Tên | Điểm | Ghi chú (có khung viền, in được ngay).
// Danh sách gồm MỌI học sinh được gán vào phòng, em chưa thi để trống ô điểm.
// `khoa` do người dùng nhập lúc xuất, `tenCanBo` là người đang đăng nhập —
// để trống thì phần tương ứng chỉ in nhãn cho ghi tay.
export async function xuatBangDiemPhongExcel(
  phong: PhongThi,
  items: BangDiemPhongItem[],
  phongDaDong: boolean,
  tuyChon: { khoa?: string; tenCanBo?: string } = {},
): Promise<void> {
  const khoa = tuyChon.khoa ?? '';
  const tenCanBo = tuyChon.tenCanBo ?? '';
  // Sắp theo tên rồi họ đệm (giống danh sách lớp của trường).
  const danhSach = [...items]
    .map((r) => ({ ...r, ...tachHoTen(r.tenNguoiDung ?? `#${r.maNguoiDung}`) }))
    .sort(
      (a, b) =>
        a.ten.localeCompare(b.ten, 'vi') || a.hoDem.localeCompare(b.hoDem, 'vi'),
    );

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Bảng điểm');
  ws.columns = [
    { width: 6 },
    { width: 14 },
    { width: 26 },
    { width: 22 },
    { width: 12 },
    { width: 10 },
    { width: 24 },
  ];

  // --- Phần đầu: trường / quốc hiệu ---
  ws.mergeCells('A1:C1');
  ws.getCell('A1').value = 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN';
  ws.mergeCells('D1:G1');
  ws.getCell('D1').value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';

  ws.mergeCells('A2:C2');
  ws.getCell('A2').value = khoa.trim() ? `KHOA: ${khoa.trim()}` : 'KHOA:';
  ws.mergeCells('D2:G2');
  ws.getCell('D2').value = 'Độc lập - Tự do - Hạnh phúc';

  for (const dc of ['A1', 'D1', 'A2', 'D2']) {
    ws.getCell(dc).font = { name: FONT, size: 12, bold: true };
    ws.getCell(dc).alignment = { horizontal: 'center', vertical: 'middle' };
  }

  ws.mergeCells('A4:G4');
  ws.getCell('A4').value = 'BẢNG ĐIỂM THI';
  ws.getCell('A4').font = { name: FONT, size: 14, bold: true };
  ws.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };

  // Môn học: "Toán · HK1 · 2025-2026" (giống mô tả trên màn hình bảng điểm).
  const mhhk = phong.monHocHocKy;
  const tenMon = [mhhk?.monHoc?.tenMonHoc, mhhk?.hocKy?.tenHocKy, mhhk?.hocKy?.namHoc]
    .filter(Boolean)
    .join(' · ');

  ws.getCell('B6').value = 'Tên Môn học:';
  ws.getCell('C6').value = tenMon;
  ws.getCell('B7').value = 'Tên phòng thi:';
  ws.getCell('C7').value = phong.tenPhongThi;
  for (const dc of ['B6', 'C6', 'B7', 'C7']) {
    ws.getCell(dc).font = { name: FONT, size: 12 };
  }

  // --- Header bảng (dòng 9) ---
  const DONG_HEADER = 9;
  const header = ws.getRow(DONG_HEADER);
  header.values = [
    'TT',
    'MSSV',
    'Email',
    'Họ và tên HS-SV',
    '',
    'Điểm',
    'Ghi chú',
  ];
  ws.mergeCells(`D${DONG_HEADER}:E${DONG_HEADER}`);
  header.height = 30;
  for (let c = 1; c <= 7; c++) {
    const cell = header.getCell(c);
    cell.font = { name: FONT, size: 12, bold: true };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = VIEN_MONG;
  }

  // --- Dữ liệu ---
  danhSach.forEach((r, i) => {
    const row = ws.getRow(DONG_HEADER + 1 + i);
    // Ghi chú chỉ dùng cho trường hợp vắng: chưa thi thì ô điểm để trống và ghi
    // rõ bỏ thi / chưa thi. Em đã thi để trống ghi chú (điểm đã ở cột Điểm).
    const ghiChu = r.daThi ? '' : phongDaDong ? 'Bỏ thi' : 'Chưa thi';
    row.values = [
      i + 1,
      mssvTuEmail(r.email),
      r.email ?? '',
      r.hoDem,
      r.ten,
      r.daThi ? Math.round(Number(r.diemSo) * 100) / 100 : '',
      ghiChu,
    ];
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.font = { name: FONT, size: 12 };
      cell.border = VIEN_MONG;
      // TT, MSSV, Điểm căn giữa; Ghi chú căn giữa cho gọn; còn lại căn trái.
      cell.alignment = {
        horizontal:
          c === 1 || c === 2 || c === 6 || c === 7 ? 'center' : 'left',
        vertical: 'middle',
      };
    }
  });

  // --- Chân trang ký tên (góc dưới bên phải, không kẻ khung) ---
  // Chừa 1 dòng trống sau lưới danh sách rồi mới tới địa danh + ngày.
  const dongNgay = DONG_HEADER + danhSach.length + 2;
  const nay = new Date();
  const hai = (n: number) => String(n).padStart(2, '0');

  ws.mergeCells(`E${dongNgay}:G${dongNgay}`);
  ws.getCell(`E${dongNgay}`).value =
    `Tp.Hồ Chí Minh, ngày ${hai(nay.getDate())} tháng ${hai(nay.getMonth() + 1)} năm ${nay.getFullYear()}`;

  const dongCanBo = dongNgay + 1;
  ws.mergeCells(`E${dongCanBo}:G${dongCanBo}`);
  ws.getCell(`E${dongCanBo}`).value = tenCanBo.trim()
    ? `Cán bộ xuất bảng điểm: ${tenCanBo.trim()}`
    : 'Cán bộ xuất bảng điểm:';

  for (const dc of [`E${dongNgay}`, `E${dongCanBo}`]) {
    ws.getCell(dc).font = {
      name: FONT,
      size: 12,
      bold: dc === `E${dongCanBo}`,
    };
    ws.getCell(dc).alignment = { horizontal: 'center', vertical: 'middle' };
  }
  // Chừa 3 dòng trống bên dưới làm chỗ ký tên.
  ws.getRow(dongCanBo + 3).height = 15;

  // --- Tải file ---
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bang-diem-${slugTen(phong.tenPhongThi)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
