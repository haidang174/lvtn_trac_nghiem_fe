import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resultsApi, type QueryRoomStatsParams } from '@/api/results.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatScore } from '@/utils/formatScore';
import type { ThongKePhong } from '@/types/ket-qua.type';
import type { MonHoc } from '@/types/mon-hoc.type';

export default function ResultListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [locMon, setLocMon] = useState('');
  const [timKiem, setTimKiem] = useState('');

  const [items, setItems] = useState<ThongKePhong[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  // Nạp môn học cho bộ lọc.
  useEffect(() => {
    subjectsApi
      .getSubjects({ page: 1, limit: 1000 })
      .then((e) => setMonHocs(e.items))
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryRoomStatsParams = { page, limit };
      if (locMon) params.maMonHoc = Number(locMon);
      if (timKiem.trim()) params.search = timKiem.trim();
      const ds = await resultsApi.getRoomStats(params);
      setItems(ds.items);
      setTotal(ds.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, locMon, timKiem, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    resetPage();
  }, [locMon, timKiem, resetPage]);

  const columns: ColumnDef<ThongKePhong>[] = [
    {
      tieuDe: 'Tên phòng',
      render: (r) => <span className="font-semibold text-gray-900">{r.tenPhongThi}</span>,
    },
    {
      tieuDe: 'Môn học',
      render: (r) => (
        <div>
          <span className="font-medium text-gray-900">{r.tenMonHoc ?? '—'}</span>
          {r.tenHocKy && (
            <div className="text-xs text-gray-500">
              {r.tenHocKy}
              {r.namHoc ? ` · ${r.namHoc}` : ''}
            </div>
          )}
        </div>
      ),
    },
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
          placeholder="-- Tất cả môn học --"
          value={locMon}
          onChange={(e) => setLocMon(e.target.value)}
          options={monHocs.map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
        />
        <Input
          placeholder="Tìm theo tên phòng..."
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
