import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { themToast } from '@/store/slices/ui.slice';
import { useAuth } from '@/hooks/useAuth';

export default function ChangePasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tài khoản đăng nhập bằng Google chưa đặt mật khẩu LOCAL -> không cho đổi mật khẩu.
  if (user && !user.coMatKhau) {
    return <Navigate to="/" replace />;
  }

  const [matKhauHienTai, setMatKhauHienTai] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [dangTai, setDangTai] = useState(false);

  const xuLyDoiMatKhau = async (e: FormEvent) => {
    e.preventDefault();
    if (matKhauMoi !== xacNhanMatKhau) {
      dispatch(themToast('error', 'Mật khẩu xác nhận không khớp'));
      return;
    }
    setDangTai(true);
    try {
      await authApi.changePassword({ matKhauHienTai, matKhauMoi, xacNhanMatKhau });
      dispatch(themToast('success', 'Đổi mật khẩu thành công'));
      navigate('/', { replace: true });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangTai(false);
    }
  };

  return (
    <AuthLayout tieuDe="Đổi mật khẩu">
      <form onSubmit={xuLyDoiMatKhau} className="space-y-4">
        <Input
          label="Mật khẩu hiện tại"
          name="matKhauHienTai"
          type="password"
          required
          value={matKhauHienTai}
          onChange={(e) => setMatKhauHienTai(e.target.value)}
        />
        <Input
          label="Mật khẩu mới"
          name="matKhauMoi"
          type="password"
          required
          minLength={6}
          value={matKhauMoi}
          onChange={(e) => setMatKhauMoi(e.target.value)}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          name="xacNhanMatKhau"
          type="password"
          required
          minLength={6}
          value={xacNhanMatKhau}
          onChange={(e) => setXacNhanMatKhau(e.target.value)}
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Button type="submit" fullWidth dangTai={dangTai}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
