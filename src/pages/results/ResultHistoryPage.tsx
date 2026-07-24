import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { resultsApi, type QueryMyResultParams, type MonDaThi } from '@/api/results.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { formatScore } from '@/utils/formatScore';
import { TrangThaiBaiLam, NHAN_TRANG_THAI_BAI_LAM } from '@/enums/trangThaiBaiLam';
import type { KetQuaCuaToi } from '@/types/ket-qua.type';

const mauTrangThai: Record<TrangThaiBaiLam, MauBadge> = {
  dang_lam: 'amber',
  da_nop: 'green',
  het_thoi_gian: 'red',
};

export default function ResultHistoryPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [tuKhoa, setTuKhoa] = useState('');
  const [locMon, setLocMon] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<KetQuaCuaToi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [dsMon, setDsMon] = useState<MonDaThi[]>([]);

  // Nạp danh sách môn đã thi để làm options cho bộ lọc.
  useEffect(() => {
    resultsApi
      .getMySubjects()
      .then(setDsMon)
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryMyResultParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locMon) params.maMonHoc = Number(locMon);
      const data = await resultsApi.getMyResults(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, locMon, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Đổi từ khóa/bộ lọc → quay về trang 1.
  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locMon, resetPage]);

  const columns: ColumnDef<KetQuaCuaToi>[] = [
    {
      tieuDe: 'Phòng thi',
      render: (r) => <span className="font-semibold text-gray-900">{r.tenPhongThi}</span>,
    },
    {
      tieuDe: 'Đề thi',
      render: (r) => <span className="font-medium text-gray-900">{r.tieuDe ?? '—'}</span>,
    },
    { tieuDe: 'Môn học', render: (r) => r.tenMonHoc ?? '—' },
    {
      tieuDe: 'Điểm',
      className: 'text-center',
      render: (r) =>
        r.daThi ? (
          <span className="font-bold text-primary">{formatScore(r.diemSo)}/10</span>
        ) : (
          '—'
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
      tieuDe: 'Trạng thái',
      render: (r) =>
        r.daThi && r.trangThaiBaiLam ? (
          <StatusBadge mau={mauTrangThai[r.trangThaiBaiLam] ?? 'gray'}>
            {NHAN_TRANG_THAI_BAI_LAM[r.trangThaiBaiLam] ?? r.trangThaiBaiLam}
          </StatusBadge>
        ) : (
          <StatusBadge mau="gray">Không tham gia</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (r) => {
        if (!r.daThi || r.maKetQua == null) return null;
        // Chi tiết bài làm chỉ mở sau khi phòng đóng (BE chặn trước dongLuc).
        const daMoChiTiet = new Date() >= new Date(r.dongLuc);
        return daMoChiTiet ? (
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/results/${r.maKetQua}`)}
          >
            Xem chi tiết
          </Button>
        ) : (
          <span
            className="text-xs text-gray-400"
            title="Chi tiết bài làm chỉ xem được sau khi phòng thi đóng"
          >
            Mở khi phòng đóng
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader tieuDe="Kết quả của tôi" moTa="Lịch sử các bài thi bạn đã làm" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchInput
          placeholder="Tìm theo tên phòng / đề thi..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <Select
          placeholder="-- Tất cả môn học --"
          value={locMon}
          onChange={(e) => setLocMon(e.target.value)}
          options={dsMon.map((m) => ({ value: String(m.maMonHoc), label: m.tenMonHoc }))}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.maPhongThi}
        dangTai={dangTai}
        rong="Bạn chưa được gán vào phòng thi đã kết thúc nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
