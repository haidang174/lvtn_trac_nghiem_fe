import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { usersApi, type DongImport, type KetQuaImport } from '@/api/users.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { VaiTro, NHAN_VAI_TRO } from '@/enums/vaiTro';

// Chỉ cho import 2 vai trò này (không tạo Quản trị viên qua import).
const VAI_TRO_IMPORT = [VaiTro.HOC_SINH, VaiTro.GIAO_VIEN];

// Dòng preview kèm id cục bộ để làm React key ổn định (email có thể trùng/rỗng).
type DongPreview = DongImport & { id: number };

export default function UserImportPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [vaiTro, setVaiTro] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dangDoc, setDangDoc] = useState(false);

  // null = chưa đọc file; mảng = đã có bản xem trước.
  const [danhSach, setDanhSach] = useState<DongPreview[] | null>(null);
  const [dangTao, setDangTao] = useState(false);
  const [ketQua, setKetQua] = useState<KetQuaImport | null>(null);

  const soHopLe = danhSach?.filter((d) => d.hopLe).length ?? 0;
  const soLoi = (danhSach?.length ?? 0) - soHopLe;

  const docFile = async () => {
    if (!vaiTro) return toast.error('Vui lòng chọn vai trò trước');
    if (!file) return toast.error('Vui lòng chọn file Excel');
    setDangDoc(true);
    try {
      const data = await usersApi.previewImport(file);
      setDanhSach(data.danhSach.map((d, i) => ({ ...d, id: i })));
      if (data.danhSach.every((d) => !d.hopLe)) {
        toast.warning('Không có dòng nào hợp lệ trong file');
      }
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangDoc(false);
    }
  };

  const taoTaiKhoan = async () => {
    if (!danhSach) return;
    if (soHopLe === 0) return toast.error('Không có dòng hợp lệ để tạo');
    setDangTao(true);
    try {
      // Gửi toàn bộ danh sách - BE tự bỏ qua dòng lỗi và báo cáo.
      const payload = danhSach.map(({ tenNguoiDung, email }) => ({
        tenNguoiDung,
        email,
      }));
      const kq = await usersApi.importUsers(vaiTro as VaiTro, payload);
      setKetQua(kq);
      toast.success(`Đã tạo ${kq.soLuongTao} tài khoản, bỏ qua ${kq.soLuongBoQua}`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTao(false);
    }
  };

  const chonLai = () => {
    setDanhSach(null);
    setFile(null);
    setKetQua(null);
  };

  // ===== Bước 3: kết quả =====
  if (ketQua) {
    return (
      <div>
        <PageHeader
          tieuDe="Kết quả import"
          hanhDong={
            <Button variant="secondary" type="button" onClick={() => navigate('/users')}>
              ← Về danh sách người dùng
            </Button>
          }
        />
        <div className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{ketQua.soLuongTao}</div>
              <div className="text-sm text-green-700">Đã tạo</div>
            </div>
            <div className="flex-1 rounded-lg bg-amber-50 p-4 text-center">
              <div className="text-2xl font-bold text-amber-700">{ketQua.soLuongBoQua}</div>
              <div className="text-sm text-amber-700">Bỏ qua</div>
            </div>
          </div>

          {ketQua.danhSachBoQua.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Các dòng bị bỏ qua:</p>
              <ul className="space-y-1 text-sm">
                {ketQua.danhSachBoQua.map((d, i) => (
                  <li key={i} className="flex justify-between gap-2 rounded bg-gray-50 px-3 py-1.5">
                    <span className="text-gray-600">
                      {d.tenNguoiDung || '(trống)'} — {d.email || '(trống)'}
                    </span>
                    <span className="shrink-0 text-red-600">{d.lyDo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={chonLai}>
              Import file khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Bước 1: chọn vai trò + file =====
  if (!danhSach) {
    return (
      <div>
        <PageHeader
          tieuDe="Import tài khoản từ Excel"
          moTa="Chọn vai trò rồi tải lên file .xlsx gồm 2 cột: Tên và Email. Bạn sẽ xem trước trước khi tạo."
          hanhDong={
            <Button variant="secondary" type="button" onClick={() => navigate('/users')}>
              ← Quay lại
            </Button>
          }
        />

        <div className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <Select
            label="Vai trò * (áp dụng cho tất cả tài khoản trong file)"
            placeholder="-- Chọn vai trò --"
            value={vaiTro}
            onChange={(e) => setVaiTro(e.target.value)}
            options={VAI_TRO_IMPORT.map((v) => ({ value: v, label: NHAN_VAI_TRO[v] }))}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">File Excel (.xlsx) *</label>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={!vaiTro}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400">
              {vaiTro
                ? 'Cột A: Tên · Cột B: Email. Dòng tiêu đề (nếu có) sẽ tự bỏ qua. Mật khẩu mặc định: 123456.'
                : 'Vui lòng chọn vai trò trước khi tải file lên.'}
            </p>
          </div>

          {dangDoc ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Spinner />
              <span>Đang đọc file…</span>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button type="button" onClick={docFile} disabled={!vaiTro || !file}>
                Đọc file
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Bước 2: xem trước =====
  const columns: ColumnDef<DongPreview>[] = [
    { tieuDe: 'STT', className: 'w-12 text-gray-500', render: (_r, i) => i + 1 },
    { tieuDe: 'Tên', render: (r) => r.tenNguoiDung || <span className="text-gray-400">(trống)</span> },
    { tieuDe: 'Email', render: (r) => r.email || <span className="text-gray-400">(trống)</span> },
    {
      tieuDe: 'Trạng thái',
      render: (r) =>
        r.hopLe ? (
          <StatusBadge mau="green">Hợp lệ</StatusBadge>
        ) : (
          <StatusBadge mau="red">{r.lyDo}</StatusBadge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe={`Xem trước ${danhSach.length} dòng`}
        moTa={`Vai trò: ${NHAN_VAI_TRO[vaiTro as VaiTro]}. Sẽ tạo ${soHopLe} tài khoản, bỏ qua ${soLoi} dòng lỗi.`}
        hanhDong={
          <Button variant="secondary" type="button" onClick={chonLai} disabled={dangTao}>
            ← Chọn file khác
          </Button>
        }
      />

      <Table
        columns={columns}
        data={danhSach}
        rowKey={(r) => r.id}
        rong="File không có dòng nào"
      />

      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={taoTaiKhoan} dangTai={dangTao} disabled={soHopLe === 0}>
          Tạo {soHopLe} tài khoản
        </Button>
      </div>
    </div>
  );
}
