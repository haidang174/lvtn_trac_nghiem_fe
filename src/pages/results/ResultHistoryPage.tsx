import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { resultsApi } from '@/api/results.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
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
  const { page, limit, setPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<KetQuaCuaToi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const data = await resultsApi.getMyResults({ page, limit });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const columns: ColumnDef<KetQuaCuaToi>[] = [
    {
      tieuDe: 'Đề thi',
      render: (r) => <span className="font-medium text-gray-900">{r.tieuDe}</span>,
    },
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
      tieuDe: 'Trạng thái',
      render: (r) => (
        <StatusBadge mau={mauTrangThai[r.trangThaiBaiLam] ?? 'gray'}>
          {NHAN_TRANG_THAI_BAI_LAM[r.trangThaiBaiLam] ?? r.trangThaiBaiLam}
        </StatusBadge>
      ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (r) => {
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
            🔒 Mở khi phòng đóng
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader tieuDe="Kết quả của tôi" moTa="Lịch sử các bài thi bạn đã làm" />

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.maKetQua}
        dangTai={dangTai}
        rong="Bạn chưa có kết quả thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
