import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { usersApi } from '@/api/users.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';
import type { NguoiDung } from '@/types/nguoi-dung.type';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<NguoiDung | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [xacNhan, setXacNhan] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const toast = useToast();

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      setUser(await usersApi.getUserById(+id));
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [id, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const xacNhanDoiTrangThai = async () => {
    if (!user) return;
    setDangXuLy(true);
    try {
      const moi = await usersApi.updateUserStatus(user.maNguoiDung, !user.laHoatDong);
      setUser(moi);
      toast.success(user.laHoatDong ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setXacNhan(false);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuLy(false);
    }
  };

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy người dùng.{' '}
        <Link to="/users" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        tieuDe="Chi tiết người dùng"
        hanhDong={
          <>
            <Link to="/users">
              <Button variant="secondary" type="button">
                ← Quay lại
              </Button>
            </Link>
            <Button
              variant={user.laHoatDong ? 'outline' : 'primary'}
              type="button"
              onClick={() => setXacNhan(true)}
            >
              {user.laHoatDong ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </Button>
          </>
        }
      />

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.tenNguoiDung.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.tenNguoiDung}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Mã người dùng</dt>
            <dd className="font-medium text-gray-800">#{user.maNguoiDung}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Vai trò</dt>
            <dd className="font-medium text-gray-800">{NHAN_VAI_TRO[user.vaiTro]}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Trạng thái</dt>
            <dd>
              {user.laHoatDong ? (
                <StatusBadge mau="green">Hoạt động</StatusBadge>
              ) : (
                <StatusBadge mau="red">Đã khóa</StatusBadge>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <ConfirmDialog
        moRa={xacNhan}
        tieuDe={user.laHoatDong ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        noiDung={
          user.laHoatDong
            ? `Khóa tài khoản "${user.tenNguoiDung}"? Người dùng sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản "${user.tenNguoiDung}"?`
        }
        nhanXacNhan={user.laHoatDong ? 'Khóa' : 'Mở khóa'}
        nguyHiem={user.laHoatDong}
        dangXuLy={dangXuLy}
        onXacNhan={xacNhanDoiTrangThai}
        onHuy={() => setXacNhan(false)}
      />
    </div>
  );
}
