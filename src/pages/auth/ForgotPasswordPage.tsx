import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { themToast } from '@/store/slices/ui.slice';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [dangTai, setDangTai] = useState(false);

  const xuLyGuiOtp = async (e: FormEvent) => {
    e.preventDefault();
    setDangTai(true);
    try {
      await authApi.forgotPassword(email);
      dispatch(themToast('success', 'Đã gửi mã OTP tới email của bạn'));
      // Chuyển sang trang đặt lại, mang theo email để điền sẵn.
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangTai(false);
    }
  };

  return (
    <AuthLayout tieuDe="Quên mật khẩu" moTa="Nhập email để nhận mã OTP">
      <form onSubmit={xuLyGuiOtp} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" fullWidth dangTai={dangTai}>
          Gửi mã OTP
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
