import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import SubjectFormModal from './SubjectFormModal';
import { subjectsApi, type QuerySubjectParams } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import type { MonHoc } from '@/types/mon-hoc.type';

export default function SubjectListPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, resetPage } = usePagination();
  const [tuKhoa, setTuKhoa] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<MonHoc[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  // null = đóng form; undefined = mở form tạo mới; object = mở form sửa.
  const [formMonHoc, setFormMonHoc] = useState<MonHoc | null | undefined>(null);
  const [chonXoa, setChonXoa] = useState<MonHoc | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const toast = useToast();

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QuerySubjectParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locTrangThai) params.laHoatDong = locTrangThai === 'true';
      const data = await subjectsApi.getSubjects(params);
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

  // Đổi từ khóa/bộ lọc → quay về trang 1.
  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locTrangThai, resetPage]);

  const doiTrangThai = async (mh: MonHoc) => {
    try {
      await subjectsApi.updateSubjectStatus(mh.maMonHoc, !mh.laHoatDong);
      toast.success(mh.laHoatDong ? 'Đã khóa môn học' : 'Đã mở khóa môn học');
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const xacNhanXoa = async () => {
    if (!chonXoa) return;
    setDangXoa(true);
    try {
      await subjectsApi.deleteSubject(chonXoa.maMonHoc);
      toast.success('Đã xóa môn học');
      setChonXoa(null);
      // Nếu xóa phần tử cuối trang → lùi về trang trước.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXoa(false);
    }
  };

  const columns: ColumnDef<MonHoc>[] = [
    {
      tieuDe: 'Tên môn học',
      render: (m) => (
        <button
          onClick={() => navigate(`/subjects/${m.maMonHoc}`)}
          className="text-left font-medium text-primary hover:underline"
        >
          {m.tenMonHoc}
        </button>
      ),
    },
    {
      tieuDe: 'Trạng thái',
      render: (m) =>
        m.laHoatDong ? (
          <StatusBadge mau="green">Hoạt động</StatusBadge>
        ) : (
          <StatusBadge mau="gray">Đã khóa</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (m) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => setFormMonHoc(m)}
          >
            ✏️ Sửa
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => doiTrangThai(m)}
          >
            {m.laHoatDong ? '🔒 Khóa' : '🔓 Mở'}
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1 text-red-600 hover:bg-red-50"
            onClick={() => setChonXoa(m)}
          >
            🗑️ Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Quản lý môn học"
        moTa="Danh mục môn học dùng cho ngân hàng câu hỏi và đề thi"
        hanhDong={
          <Button type="button" onClick={() => setFormMonHoc(undefined)}>
            + Thêm môn học
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchInput
          placeholder="Tìm theo tên môn hoặc mã định danh..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <Select
          placeholder="-- Tất cả trạng thái --"
          value={locTrangThai}
          onChange={(e) => setLocTrangThai(e.target.value)}
          options={[
            { value: 'true', label: 'Hoạt động' },
            { value: 'false', label: 'Đã khóa' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(m) => m.maMonHoc}
        dangTai={dangTai}
        rong="Không tìm thấy môn học nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />

      <SubjectFormModal
        moRa={formMonHoc !== null}
        monHoc={formMonHoc ?? null}
        onDong={() => setFormMonHoc(null)}
        onLuuXong={taiDuLieu}
      />

      <ConfirmDialog
        moRa={!!chonXoa}
        tieuDe="Xóa môn học"
        noiDung={`Xóa môn học "${chonXoa?.tenMonHoc}"? Hành động này không thể hoàn tác. Môn đang có câu hỏi/đề thi sẽ không xóa được.`}
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={xacNhanXoa}
        onHuy={() => setChonXoa(null)}
      />
    </div>
  );
}
