import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import SemesterFormModal from './SemesterFormModal';
import { semestersApi, type QuerySemesterParams } from '@/api/semesters.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import type { HocKy } from '@/types/hoc-ky.type';

export default function SemesterListPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, resetPage } = usePagination();
  const [tuKhoa, setTuKhoa] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<HocKy[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  const [formHocKy, setFormHocKy] = useState<HocKy | null | undefined>(null);

  const toast = useToast();

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QuerySemesterParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      const data = await semestersApi.getSemesters(params);
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

  const columns: ColumnDef<HocKy>[] = [
    {
      tieuDe: 'Học kỳ',
      render: (h) => (
        <button
          onClick={() => navigate(`/semesters/${h.maHocKy}`)}
          className="text-left font-medium text-primary hover:underline"
        >
          {h.tenHocKy} — {h.namHoc}
        </button>
      ),
    },
    {
      tieuDe: 'Trạng thái',
      render: (h) =>
        h.daKetThuc ? (
          <StatusBadge mau="gray">Đã kết thúc</StatusBadge>
        ) : (
          <StatusBadge mau="green">Đang diễn ra</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (h) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/semesters/${h.maHocKy}`)}
          >
            Mở môn / phân công
          </Button>
          {!h.daKetThuc && (
            <Button
              variant="ghost"
              type="button"
              className="!px-2 !py-1"
              onClick={() => setFormHocKy(h)}
            >
              Sửa
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Quản lý học kỳ"
        moTa="Mở môn học theo học kỳ, phân công giáo viên và ghi danh học sinh"
        hanhDong={
          <Button type="button" onClick={() => setFormHocKy(undefined)}>
            + Thêm học kỳ
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          placeholder="Tìm theo tên học kỳ hoặc năm học..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(h) => h.maHocKy}
        dangTai={dangTai}
        rong="Chưa có học kỳ nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />

      <SemesterFormModal
        moRa={formHocKy !== null}
        hocKy={formHocKy ?? null}
        onDong={() => setFormHocKy(null)}
        onLuuXong={taiDuLieu}
      />
    </div>
  );
}
