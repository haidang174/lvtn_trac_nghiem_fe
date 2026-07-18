import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { resultsApi } from '@/api/results.api';
import { examRoomsApi } from '@/api/examRooms.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { formatScore } from '@/utils/formatScore';
import { xuatBangDiemPhongExcel } from '@/utils/bangDiemPhongThi';
import { TrangThaiPhongThi } from '@/enums/trangThaiPhongThi';
import { VaiTro } from '@/enums/vaiTro';
import type { BangDiemPhongItem, ThongKeKetQua } from '@/types/ket-qua.type';
import type { PhongThi } from '@/types/phong-thi.type';

// Tên khoa hiếm khi đổi giữa các lần xuất -> nhớ lại cho lần sau.
const KHOA_KEY = 'bangDiemPhong.khoa';

export default function ResultRoomScorePage() {
  const { maPhongThi } = useParams();
  const maPhong = Number(maPhongThi);
  const { page, limit, setPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();
  // Người đang đăng nhập -> "Cán bộ xuất bảng điểm" ở chân biểu mẫu.
  const { user } = useAuth();
  // Bảng điểm in ra là văn bản chính thức -> chỉ Admin được xuất (GV vẫn xem được bảng).
  const laAdmin = user?.vaiTro === VaiTro.QUAN_TRI_VIEN;

  const [phong, setPhong] = useState<PhongThi | null>(null);
  const [items, setItems] = useState<BangDiemPhongItem[]>([]);
  const [total, setTotal] = useState(0);
  const [thongKe, setThongKe] = useState<ThongKeKetQua | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [dangXuat, setDangXuat] = useState(false);
  const [moHopXuat, setMoHopXuat] = useState(false);
  const [khoa, setKhoa] = useState(() => localStorage.getItem(KHOA_KEY) ?? '');

  // Nạp thông tin phòng cho tiêu đề.
  useEffect(() => {
    if (!maPhong) return;
    examRoomsApi
      .getExamRoomById(maPhong)
      .then(setPhong)
      .catch(() => undefined);
  }, [maPhong]);

  const taiDuLieu = useCallback(async () => {
    if (!maPhong) return;
    setDangTai(true);
    try {
      const [ds, tk] = await Promise.all([
        resultsApi.getRoomScores(maPhong, { page, limit }),
        resultsApi.getResultStats({ maPhongThi: maPhong }),
      ]);
      setItems(ds.items);
      setTotal(ds.total);
      setThongKe(tk);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [maPhong, page, limit, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Phòng đã đóng → HS chưa có điểm là "Bỏ thi"; phòng chưa đóng vẫn "Chưa thi".
  const phongDaDong = phong
    ? phong.trangThai === TrangThaiPhongThi.DA_DONG ||
      new Date() >= new Date(phong.dongLuc)
    : false;

  // Xuất Excel theo mẫu của trường: tải lại TOÀN BỘ danh sách (không chỉ trang
  // đang xem) rồi dựng file ngay tại trình duyệt.
  const xuLyXuatExcel = async () => {
    if (!phong) return;
    setDangXuat(true);
    try {
      const ds = await resultsApi.getRoomScores(maPhong, { page: 1, limit: 1000 });
      await xuatBangDiemPhongExcel(phong, ds.items, phongDaDong, {
        khoa,
        tenCanBo: user?.tenNguoiDung,
      });
      localStorage.setItem(KHOA_KEY, khoa.trim());
      setMoHopXuat(false);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuat(false);
    }
  };

  const columns: ColumnDef<BangDiemPhongItem>[] = [
    {
      tieuDe: 'Học sinh',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.tenNguoiDung ?? `#${r.maNguoiDung}`}</p>
          {r.email && <p className="text-xs text-gray-500">{r.email}</p>}
        </div>
      ),
    },
    {
      tieuDe: 'Đề thi',
      render: (r) => <span className="font-medium text-gray-900">{r.tieuDe ?? '—'}</span>,
    },
    {
      tieuDe: 'Điểm',
      className: 'text-center',
      render: (r) =>
        r.daThi ? (
          <span className="font-bold text-primary">{formatScore(r.diemSo)}/10</span>
        ) : phongDaDong ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Bỏ thi
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Chưa thi
          </span>
        ),
    },
    {
      tieuDe: 'Đúng/Tổng',
      className: 'text-center',
      render: (r) => (r.daThi ? `${r.soCauDung}/${r.tongSoCau}` : '—'),
    },
    {
      tieuDe: 'Nộp lúc',
      render: (r) => (r.daThi && r.thoiGianNop ? formatDateTime(r.thoiGianNop) : '—'),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (r) =>
        r.daThi && r.maKetQua != null ? (
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/results/${r.maKetQua}`)}
          >
            Chi tiết
          </Button>
        ) : null,
    },
  ];

  const tieuDe = phong
    ? `Bảng điểm phòng ${phong.tenPhongThi}`
    : 'Bảng điểm phòng thi';

  // Mô tả: Môn học · Học kỳ · Năm học (cho biết môn của học kỳ nào).
  const mhhk = phong?.monHocHocKy;
  const moTa = mhhk?.monHoc?.tenMonHoc
    ? [mhhk.monHoc.tenMonHoc, mhhk.hocKy?.tenHocKy, mhhk.hocKy?.namHoc]
        .filter(Boolean)
        .join(' · ')
    : 'Danh sách lượt nộp bài của học sinh';

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" type="button" className="!px-2 !py-1" onClick={() => navigate('/results')}>
          ← Quay lại danh sách phòng
        </Button>
      </div>

      <PageHeader
        tieuDe={tieuDe}
        moTa={moTa}
        hanhDong={
          laAdmin ? (
            <Button
              variant="outline"
              type="button"
              disabled={!phong || dangXuat || total === 0}
              onClick={() => setMoHopXuat(true)}
            >
              Xuất Excel
            </Button>
          ) : undefined
        }
      />

      {/* Hỏi tên khoa trước khi xuất (mẫu của trường có dòng "KHOA:"). */}
      {laAdmin && (
        <Modal
          moRa={moHopXuat}
          onDong={() => setMoHopXuat(false)}
          tieuDe="Xuất bảng điểm ra Excel"
          kichThuoc="sm"
          chanDuoi={
            <>
              <Button variant="outline" type="button" onClick={() => setMoHopXuat(false)}>
                Hủy
              </Button>
              <Button type="button" disabled={dangXuat} onClick={xuLyXuatExcel}>
                {dangXuat ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
            </>
          }
        >
          <Input
            name="khoa"
            label="Khoa"
            value={khoa}
            placeholder="VD: Công nghệ Thông tin"
            autoFocus
            onChange={(e) => setKhoa(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-500">
            Điền vào dòng "KHOA:" trên biểu mẫu. Để trống nếu muốn ghi tay sau khi in.
          </p>
        </Modal>
      )}

      {/* Thẻ thống kê */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ThongKeCard nhan="Lượt thi" giaTri={thongKe?.soLuotThi ?? 0} mau="text-gray-900" />
        <ThongKeCard nhan="Điểm TB" giaTri={formatScore(thongKe?.diemTrungBinh)} mau="text-primary" />
        <ThongKeCard nhan="Cao nhất" giaTri={formatScore(thongKe?.diemCaoNhat)} mau="text-green-600" />
        <ThongKeCard nhan="Thấp nhất" giaTri={formatScore(thongKe?.diemThapNhat)} mau="text-red-600" />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.maNguoiDung}
        dangTai={dangTai}
        rong="Chưa có học sinh nào được gán vào phòng"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}

function ThongKeCard({
  nhan,
  giaTri,
  mau,
}: {
  nhan: string;
  giaTri: string | number;
  mau: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <p className="text-xs text-gray-500">{nhan}</p>
      <p className={`mt-1 text-2xl font-bold ${mau}`}>{giaTri}</p>
    </div>
  );
}
