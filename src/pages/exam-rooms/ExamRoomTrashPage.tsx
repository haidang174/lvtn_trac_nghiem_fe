import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import { examRoomsApi, type QueryExamRoomParams } from '@/api/examRooms.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
import { mauTrangThaiPhong } from './ExamRoomListPage';
import type { PhongThi } from '@/types/phong-thi.type';

// Trang chỉ đọc: liệt kê các phòng thi đã xóa mềm (laHoatDong=false).
// Không có hành động (sửa/xóa/khôi phục/chi tiết) — chỉ để Admin tra cứu.
export default function ExamRoomTrashPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [tuKhoa, setTuKhoa] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<PhongThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryExamRoomParams = { page, limit, laHoatDong: false };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      const data = await examRoomsApi.getExamRooms(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, resetPage]);

  const columns: ColumnDef<PhongThi>[] = [
    {
      tieuDe: 'Tên phòng',
      render: (p) => <span className="font-medium text-gray-800">{p.tenPhongThi}</span>,
    },
    {
      tieuDe: 'Môn học (học kỳ)',
      render: (p) =>
        p.monHocHocKy
          ? `${p.monHocHocKy.monHoc?.tenMonHoc ?? ''} — ${p.monHocHocKy.hocKy?.tenHocKy ?? ''} ${p.monHocHocKy.hocKy?.namHoc ?? ''}`
          : '—',
    },
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
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Phòng thi đã xóa"
        moTa="Các phòng thi đã xóa được lưu lại để tra cứu (chỉ xem)"
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
            ← Quay lại
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          placeholder="Tìm theo tên phòng thi..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(p) => p.maPhongThi}
        dangTai={dangTai}
        rong="Không có phòng thi nào đã xóa"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
