import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { themToast } from '@/store/slices/ui.slice';

export default function LoginPage() {
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const tuTrang = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [dangTai, setDangTai] = useState(false);

  const xuLyDangNhap = async (e: FormEvent) => {
    e.preventDefault();
    setDangTai(true);
    try {
      await login({ email, matKhau });
      dispatch(themToast('success', 'Đăng nhập thành công'));
      navigate(tuTrang, { replace: true });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangTai(false);
    }
  };

  return (
    <AuthLayout tieuDe="Đăng nhập" moTa="Hệ thống thi trắc nghiệm trực tuyến">
      <form onSubmit={xuLyDangNhap} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@example.com"
        />
        <Input
          label="Mật khẩu"
          name="matKhau"
          type="password"
          required
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          placeholder="••••••••"
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <Button type="submit" fullWidth dangTai={dangTai}>
          Đăng nhập
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        hoặc
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <a href={authApi.loginWithGoogleUrl()}>
        <Button variant="outline" fullWidth type="button">
          Đăng nhập với Google
        </Button>
      </a>

      <p className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
