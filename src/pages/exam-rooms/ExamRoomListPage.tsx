import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import SearchInput from '@/components/common/SearchInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { examRoomsApi, type QueryExamRoomParams } from '@/api/examRooms.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { TrangThaiPhongThi, NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
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

  const [tuKhoa, setTuKhoa] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<PhongThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  const [chonXoa, setChonXoa] = useState<PhongThi | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryExamRoomParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locTrangThai) params.trangThai = locTrangThai as TrangThaiPhongThi;
      const data = await examRoomsApi.getExamRooms(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, locTrangThai, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locTrangThai, resetPage]);

  const xacNhanXoa = async () => {
    if (!chonXoa) return;
    setDangXoa(true);
    try {
      await examRoomsApi.deleteExamRoom(chonXoa.maPhongThi);
      toast.success('Đã xóa phòng thi');
      setChonXoa(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXoa(false);
    }
  };

  const columns: ColumnDef<PhongThi>[] = [
    {
      tieuDe: 'Tên phòng',
      render: (p) => (
        <button
          onClick={() => navigate(`/exam-rooms/${p.maPhongThi}`)}
          className="text-left font-medium text-primary hover:underline"
        >
          {p.tenPhongThi}
        </button>
      ),
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
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/exam-rooms/${p.maPhongThi}`)}
          >
            Chi tiết
          </Button>
          {p.trangThai === TrangThaiPhongThi.DANG_CHO && (
            <Button
              variant="ghost"
              type="button"
              className="!px-2 !py-1"
              onClick={() => navigate(`/exam-rooms/${p.maPhongThi}/edit`)}
            >
              ✏️ Sửa
            </Button>
          )}
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1 text-red-600 hover:bg-red-50"
            onClick={() => setChonXoa(p)}
          >
            Ẩn
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Quản lý phòng thi"
        moTa="Tạo phòng từ đề công khai của giáo viên và theo dõi thí sinh"
        hanhDong={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/exam-rooms/deleted')}
            >
              Phòng đã ẩn
            </Button>
            <Button type="button" onClick={() => navigate('/exam-rooms/new')}>
              + Tạo phòng thi
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchInput
          placeholder="Tìm theo tên phòng thi..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
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

      <ConfirmDialog
        moRa={!!chonXoa}
        tieuDe="Xóa phòng thi"
        noiDung={`Xóa phòng thi "${chonXoa?.tenPhongThi}"? Phòng sẽ bị ẩn khỏi danh sách.`}
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={xacNhanXoa}
        onHuy={() => setChonXoa(null)}
      />
    </div>
  );
}
