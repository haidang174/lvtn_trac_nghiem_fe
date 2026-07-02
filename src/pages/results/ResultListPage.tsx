import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resultsApi, type QueryRoomStatsParams } from '@/api/results.api';
import { examsApi } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatScore } from '@/utils/formatScore';
import type { ThongKePhong } from '@/types/ket-qua.type';
import type { BaiThi } from '@/types/bai-thi.type';

export default function ResultListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [deThis, setDeThis] = useState<BaiThi[]>([]);
  const [locDe, setLocDe] = useState('');
  const [timKiem, setTimKiem] = useState('');

  const [items, setItems] = useState<ThongKePhong[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  // Nạp đề thi cho bộ lọc.
  useEffect(() => {
    examsApi
      .getExams({ page: 1, limit: 1000 })
      .then((e) => setDeThis(e.items))
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryRoomStatsParams = { page, limit };
      if (locDe) params.maBaiThi = Number(locDe);
      if (timKiem.trim()) params.search = timKiem.trim();
      const ds = await resultsApi.getRoomStats(params);
      setItems(ds.items);
      setTotal(ds.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, locDe, timKiem, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    resetPage();
  }, [locDe, timKiem, resetPage]);

  const columns: ColumnDef<ThongKePhong>[] = [
    {
      tieuDe: 'Mã phòng',
      render: (r) => <span className="font-mono font-semibold text-gray-900">{r.maThamGiaPhong}</span>,
    },
    { tieuDe: 'Đề thi', render: (r) => <span className="font-medium text-gray-900">{r.tieuDe}</span> },
    {
      tieuDe: 'Số lượt thi',
      className: 'text-center',
      render: (r) => (
        <span className="font-semibold">
          {r.soLuotNop}
          <span className="text-gray-400">/{r.tongThanhVien}</span>
        </span>
      ),
    },
    {
      tieuDe: 'Điểm TB',
      className: 'text-center',
      render: (r) => <span className="font-bold text-primary">{formatScore(r.diemTrungBinh)}</span>,
    },
    {
      tieuDe: 'Cao nhất / Thấp nhất',
      className: 'text-center',
      render: (r) => (
        <span>
          <span className="font-semibold text-green-600">{formatScore(r.diemCaoNhat)}</span>
          <span className="text-gray-400"> / </span>
          <span className="font-semibold text-red-600">{formatScore(r.diemThapNhat)}</span>
        </span>
      ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (r) => (
        <Button
          variant="ghost"
          type="button"
          className="!px-2 !py-1"
          onClick={() => navigate(`/results/rooms/${r.maPhongThi}`)}
        >
          Xem bảng điểm
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader tieuDe="Kết quả & Thống kê" moTa="Tổng quan điểm thi theo từng phòng thi" />

      {/* Bộ lọc */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          placeholder="-- Tất cả đề thi --"
          value={locDe}
          onChange={(e) => setLocDe(e.target.value)}
          options={deThis.map((d) => ({ value: d.maBaiThi, label: d.tieuDe }))}
        />
        <Input
          placeholder="Tìm theo mã phòng hoặc tên đề..."
          value={timKiem}
          onChange={(e) => setTimKiem(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.maPhongThi}
        dangTai={dangTai}
        rong="Chưa có phòng thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
