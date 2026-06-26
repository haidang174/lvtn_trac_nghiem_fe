import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { resultsApi, type QueryResultParams } from '@/api/results.api';
import { examsApi } from '@/api/exams.api';
import { examRoomsApi } from '@/api/examRooms.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { formatScore } from '@/utils/formatScore';
import type { KetQuaItem, ThongKeKetQua } from '@/types/ket-qua.type';
import type { BaiThi } from '@/types/bai-thi.type';
import type { PhongThi } from '@/types/phong-thi.type';

export default function ResultListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [deThis, setDeThis] = useState<BaiThi[]>([]);
  const [phongs, setPhongs] = useState<PhongThi[]>([]);
  const [locDe, setLocDe] = useState('');
  const [locPhong, setLocPhong] = useState('');

  const [items, setItems] = useState<KetQuaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [thongKe, setThongKe] = useState<ThongKeKetQua | null>(null);
  const [dangTai, setDangTai] = useState(false);

  // Nạp đề thi + phòng thi cho bộ lọc.
  useEffect(() => {
    Promise.all([
      examsApi.getExams({ page: 1, limit: 1000 }),
      examRoomsApi.getExamRooms({ page: 1, limit: 1000 }),
    ])
      .then(([e, p]) => {
        setDeThis(e.items);
        setPhongs(p.items);
      })
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryResultParams = { page, limit };
      if (locDe) params.maBaiThi = Number(locDe);
      if (locPhong) params.maPhongThi = Number(locPhong);
      const [ds, tk] = await Promise.all([
        resultsApi.getResults(params),
        resultsApi.getResultStats({
          maBaiThi: locDe ? Number(locDe) : undefined,
          maPhongThi: locPhong ? Number(locPhong) : undefined,
        }),
      ]);
      setItems(ds.items);
      setTotal(ds.total);
      setThongKe(tk);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, locDe, locPhong, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    resetPage();
  }, [locDe, locPhong, resetPage]);

  const columns: ColumnDef<KetQuaItem>[] = [
    { tieuDe: 'Học sinh', render: (r) => `#${r.maNguoiDung}` },
    { tieuDe: 'Đề thi', render: (r) => <span className="font-medium text-gray-900">{r.tieuDe}</span> },
    {
      tieuDe: 'Điểm',
      className: 'text-center',
      render: (r) => <span className="font-bold text-primary">{formatScore(r.diemSo)}/10</span>,
    },
    {
      tieuDe: 'Đúng/Tổng',
      className: 'text-center',
      render: (r) => `${r.soCauDung}/${r.tongSoCau}`,
    },
    { tieuDe: 'Nộp lúc', render: (r) => formatDateTime(r.thoiGianNop) },
    {
      tieuDe: '',
      className: 'text-right',
      render: (r) => (
        <Button
          variant="ghost"
          type="button"
          className="!px-2 !py-1"
          onClick={() => navigate(`/results/${r.maKetQua}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader tieuDe="Kết quả & Thống kê" moTa="Theo dõi điểm thi theo đề và phòng thi" />

      {/* Bộ lọc */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          placeholder="-- Tất cả đề thi --"
          value={locDe}
          onChange={(e) => setLocDe(e.target.value)}
          options={deThis.map((d) => ({ value: d.maBaiThi, label: d.tieuDe }))}
        />
        <Select
          placeholder="-- Tất cả phòng thi --"
          value={locPhong}
          onChange={(e) => setLocPhong(e.target.value)}
          options={phongs.map((p) => ({ value: p.maPhongThi, label: p.maThamGiaPhong }))}
        />
      </div>

      {/* Thẻ thống kê */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ThongKeCard nhan="Lượt thi" giaTri={thongKe?.soLuotThi ?? 0} mau="text-gray-900" />
        <ThongKeCard
          nhan="Điểm TB"
          giaTri={formatScore(thongKe?.diemTrungBinh)}
          mau="text-primary"
        />
        <ThongKeCard
          nhan="Cao nhất"
          giaTri={formatScore(thongKe?.diemCaoNhat)}
          mau="text-green-600"
        />
        <ThongKeCard
          nhan="Thấp nhất"
          giaTri={formatScore(thongKe?.diemThapNhat)}
          mau="text-red-600"
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.maKetQua}
        dangTai={dangTai}
        rong="Chưa có kết quả nào"
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
