import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { examRoomsApi } from '@/api/examRooms.api';
import { examsApi } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { formatDateTime } from '@/utils/formatDate';
import { TrangThaiPhongThi, NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
import type { PhongThi } from '@/types/phong-thi.type';

export const mauTrangThaiPhong: Record<TrangThaiPhongThi, MauBadge> = {
  dang_cho: 'amber',
  dang_dien_ra: 'green',
  da_dong: 'gray',
};

export default function ExamRoomListPage() {
  const { page, limit, setPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [items, setItems] = useState<PhongThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [tenDe, setTenDe] = useState<Record<number, string>>({});

  useEffect(() => {
    examsApi
      .getExams({ page: 1, limit: 1000 })
      .then((d) => {
        const map: Record<number, string> = {};
        d.items.forEach((e) => (map[e.maBaiThi] = e.tieuDe));
        setTenDe(map);
      })
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const data = await examRoomsApi.getExamRooms({ page, limit });
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

  const columns: ColumnDef<PhongThi>[] = [
    {
      tieuDe: 'Mã phòng',
      render: (p) => (
        <button
          onClick={() => navigate(`/exam-rooms/${p.maPhongThi}`)}
          className="font-mono font-semibold tracking-wider text-primary hover:underline"
        >
          {p.maThamGiaPhong}
        </button>
      ),
    },
    { tieuDe: 'Đề thi', render: (p) => tenDe[p.maBaiThi] ?? `#${p.maBaiThi}` },
    { tieuDe: 'Mở lúc', render: (p) => formatDateTime(p.moLuc) },
    { tieuDe: 'Đóng lúc', render: (p) => formatDateTime(p.dongLuc) },
    {
      tieuDe: 'Trạng thái',
      render: (p) => (
        <StatusBadge mau={mauTrangThaiPhong[p.trangThai]}>
          {NHAN_TRANG_THAI_PHONG_THI[p.trangThai]}
        </StatusBadge>
      ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (p) => (
        <Button
          variant="ghost"
          type="button"
          className="!px-2 !py-1"
          onClick={() => navigate(`/exam-rooms/${p.maPhongThi}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Quản lý phòng thi"
        moTa="Tạo phòng từ đề thi đã công khai và theo dõi thí sinh"
        hanhDong={
          laGiaoVien && (
            <Button type="button" onClick={() => navigate('/exam-rooms/new')}>
              + Tạo phòng thi
            </Button>
          )
        }
      />

      <Table
        columns={columns}
        data={items}
        rowKey={(p) => p.maPhongThi}
        dangTai={dangTai}
        rong="Chưa có phòng thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
