import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { examRoomsApi, type QueryExamRoomParams } from '@/api/examRooms.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { formatDateTime } from '@/utils/formatDate';
import { TrangThaiPhongThi, NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { PhongThi } from '@/types/phong-thi.type';

export const mauTrangThaiPhong: Record<TrangThaiPhongThi, MauBadge> = {
  dang_cho: 'amber',
  dang_dien_ra: 'green',
  da_dong: 'gray',
};

export default function ExamRoomListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [tuKhoa, setTuKhoa] = useState('');
  const [locMon, setLocMon] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<PhongThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [dsMon, setDsMon] = useState<MonHoc[]>([]);

  // Nạp danh sách môn làm options cho bộ lọc.
  useEffect(() => {
    subjectsApi
      .getSubjects({ page: 1, limit: 1000 })
      .then((d) => setDsMon(d.items))
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryExamRoomParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locMon) params.maMonHoc = Number(locMon);
      if (locTrangThai) params.trangThai = locTrangThai as TrangThaiPhongThi;
      const data = await examRoomsApi.getExamRooms(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, locMon, locTrangThai, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Đổi từ khóa/bộ lọc → quay về trang 1.
  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locMon, locTrangThai, resetPage]);

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
    { tieuDe: 'Đề thi', render: (p) => p.baiThi?.tieuDe ?? `#${p.maBaiThi}` },
    { tieuDe: 'Môn học', render: (p) => p.baiThi?.monHoc?.tenMonHoc ?? '—' },
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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SearchInput
          placeholder="Tìm theo tên đề thi..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <Select
          placeholder="-- Tất cả môn học --"
          value={locMon}
          onChange={(e) => setLocMon(e.target.value)}
          options={dsMon.map((m) => ({ value: String(m.maMonHoc), label: m.tenMonHoc }))}
        />
        <Select
          placeholder="-- Tất cả trạng thái --"
          value={locTrangThai}
          onChange={(e) => setLocTrangThai(e.target.value)}
          options={Object.values(TrangThaiPhongThi).map((v) => ({
            value: v,
            label: NHAN_TRANG_THAI_PHONG_THI[v],
          }))}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(p) => p.maPhongThi}
        dangTai={dangTai}
        rong="Không tìm thấy phòng thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
