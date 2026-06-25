import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { themToast } from '@/store/slices/ui.slice';

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const emailMacDinh = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(emailMacDinh);
  const [otp, setOtp] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [dangTai, setDangTai] = useState(false);

  const xuLyDatLai = async (e: FormEvent) => {
    e.preventDefault();
    if (matKhauMoi !== xacNhanMatKhau) {
      dispatch(themToast('error', 'Mật khẩu xác nhận không khớp'));
      return;
    }
    setDangTai(true);
    try {
      await authApi.resetPassword({ email, otp, matKhauMoi, xacNhanMatKhau });
      dispatch(themToast('success', 'Đặt lại mật khẩu thành công'));
      navigate('/login', { replace: true });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangTai(false);
    }
  };

  return (
    <AuthLayout tieuDe="Đặt lại mật khẩu" moTa="Nhập mã OTP và mật khẩu mới">
      <form onSubmit={xuLyDatLai} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Mã OTP"
          name="otp"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6 chữ số"
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
        <Button type="submit" fullWidth dangTai={dangTai}>
          Đặt lại mật khẩu
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
