import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import UserFormModal from './UserFormModal';
import { usersApi, type QueryUserParams } from '@/api/users.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { VaiTro, NHAN_VAI_TRO } from '@/enums/vaiTro';
import type { NguoiDung } from '@/types/nguoi-dung.type';

export default function UserListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const [tuKhoa, setTuKhoa] = useState('');
  const [locVaiTro, setLocVaiTro] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<NguoiDung[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  // Người dùng đang chờ xác nhận khóa/mở khóa.
  const [chonDoiTrangThai, setChonDoiTrangThai] = useState<NguoiDung | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);

  // null = đóng form; undefined = tạo mới; object = sửa.
  const [formUser, setFormUser] = useState<NguoiDung | null | undefined>(null);
  const [chonXoa, setChonXoa] = useState<NguoiDung | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const toast = useToast();

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryUserParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locVaiTro) params.vaiTro = locVaiTro as VaiTro;
      if (locTrangThai) params.laHoatDong = locTrangThai === 'true';
      const data = await usersApi.getUsers(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, locVaiTro, locTrangThai, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Đổi bộ lọc/từ khóa → quay về trang 1.
  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locVaiTro, locTrangThai, resetPage]);

  const xacNhanXoa = async () => {
    if (!chonXoa) return;
    setDangXoa(true);
    try {
      const ketQua = await usersApi.deleteUser(chonXoa.maNguoiDung);
      toast.success(
        ketQua.daXoaCung
          ? 'Đã xóa tài khoản thành công'
          : 'Tài khoản còn dữ liệu liên quan nên đã bị khóa (vô hiệu hóa)',
      );
      setChonXoa(null);
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXoa(false);
    }
  };

  const xacNhanDoiTrangThai = async () => {
    if (!chonDoiTrangThai) return;
    setDangXuLy(true);
    try {
      await usersApi.updateUserStatus(
        chonDoiTrangThai.maNguoiDung,
        !chonDoiTrangThai.laHoatDong,
      );
      toast.success(
        chonDoiTrangThai.laHoatDong ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      );
      setChonDoiTrangThai(null);
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuLy(false);
    }
  };

  const columns: ColumnDef<NguoiDung>[] = [
    {
      tieuDe: 'Tên người dùng',
      render: (u) => (
        <Link to={`/users/${u.maNguoiDung}`} className="font-medium text-primary hover:underline">
          {u.tenNguoiDung}
        </Link>
      ),
    },
    { tieuDe: 'Email', render: (u) => <span className="text-gray-600">{u.email}</span> },
    { tieuDe: 'Vai trò', render: (u) => NHAN_VAI_TRO[u.vaiTro] },
    {
      tieuDe: 'Trạng thái',
      render: (u) =>
        u.laHoatDong ? (
          <StatusBadge mau="green">Hoạt động</StatusBadge>
        ) : (
          <StatusBadge mau="red">Đã khóa</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => setFormUser(u)}
          >
            ✏️ Sửa
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => setChonDoiTrangThai(u)}
          >
            {u.laHoatDong ? '🔒 Khóa' : '🔓 Mở'}
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1 text-red-600 hover:bg-red-50"
            onClick={() => setChonXoa(u)}
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
        tieuDe="Quản lý người dùng"
        moTa="Danh sách tài khoản trong hệ thống"
        hanhDong={
          <div className="flex gap-2">
            <Link to="/users/import">
              <Button type="button" variant="secondary">
                Nhập từ Excel
              </Button>
            </Link>
            <Button type="button" onClick={() => setFormUser(undefined)}>
              + Thêm người dùng
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SearchInput
          placeholder="Tìm theo tên hoặc email..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <Select
          placeholder="-- Tất cả vai trò --"
          value={locVaiTro}
          onChange={(e) => setLocVaiTro(e.target.value)}
          options={Object.values(VaiTro).map((v) => ({ value: v, label: NHAN_VAI_TRO[v] }))}
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
        rowKey={(u) => u.maNguoiDung}
        dangTai={dangTai}
        rong="Không tìm thấy người dùng nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />

      <UserFormModal
        moRa={formUser !== null}
        nguoiDung={formUser ?? null}
        onDong={() => setFormUser(null)}
        onLuuXong={taiDuLieu}
      />

      <ConfirmDialog
        moRa={!!chonXoa}
        tieuDe="Xóa người dùng"
        noiDung={`Xóa tài khoản "${chonXoa?.tenNguoiDung}"? Nếu chưa có dữ liệu liên quan, tài khoản sẽ bị xóa hoàn toàn khỏi hệ thống; nếu còn dữ liệu, tài khoản chỉ bị khóa (vô hiệu hóa).`}
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={xacNhanXoa}
        onHuy={() => setChonXoa(null)}
      />

      <ConfirmDialog
        moRa={!!chonDoiTrangThai}
        tieuDe={chonDoiTrangThai?.laHoatDong ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        noiDung={
          chonDoiTrangThai?.laHoatDong
            ? `Khóa tài khoản "${chonDoiTrangThai?.tenNguoiDung}"? Người dùng sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản "${chonDoiTrangThai?.tenNguoiDung}"?`
        }
        nhanXacNhan={chonDoiTrangThai?.laHoatDong ? 'Khóa' : 'Mở khóa'}
        nguyHiem={chonDoiTrangThai?.laHoatDong}
        dangXuLy={dangXuLy}
        onXacNhan={xacNhanDoiTrangThai}
        onHuy={() => setChonDoiTrangThai(null)}
      />
    </div>
  );
}
