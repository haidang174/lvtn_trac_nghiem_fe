import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { themToast } from '@/store/slices/ui.slice';
import { VaiTro } from '@/enums/vaiTro';

export default function RegisterPage() {
  const { register } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [tenNguoiDung, setTenNguoiDung] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  // Đăng ký chỉ cho phép Học sinh / Giáo viên (không tạo Quản trị viên).
  const [vaiTro, setVaiTro] = useState<VaiTro>(VaiTro.HOC_SINH);
  const [dangTai, setDangTai] = useState(false);

  const xuLyDangKy = async (e: FormEvent) => {
    e.preventDefault();
    if (matKhau !== xacNhan) {
      dispatch(themToast('error', 'Mật khẩu xác nhận không khớp'));
      return;
    }
    setDangTai(true);
    try {
      await register({ tenNguoiDung, email, matKhau, vaiTro });
      dispatch(themToast('success', 'Đăng ký thành công'));
      navigate('/', { replace: true });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangTai(false);
    }
  };

  return (
    <AuthLayout tieuDe="Đăng ký" moTa="Tạo tài khoản mới">
      <form onSubmit={xuLyDangKy} className="space-y-4">
        <Input
          label="Họ tên"
          name="tenNguoiDung"
          required
          value={tenNguoiDung}
          onChange={(e) => setTenNguoiDung(e.target.value)}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Mật khẩu"
          name="matKhau"
          type="password"
          required
          minLength={6}
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
        />
        <Input
          label="Xác nhận mật khẩu"
          name="xacNhan"
          type="password"
          required
          minLength={6}
          value={xacNhan}
          onChange={(e) => setXacNhan(e.target.value)}
        />
        <div className="space-y-1">
          <label htmlFor="vaiTro" className="block text-sm font-medium text-gray-700">
            Vai trò
          </label>
          <select
            id="vaiTro"
            name="vaiTro"
            value={vaiTro}
            onChange={(e) => setVaiTro(e.target.value as VaiTro)}
            className="input-base"
          >
            <option value={VaiTro.HOC_SINH}>Học sinh</option>
            <option value={VaiTro.GIAO_VIEN}>Giáo viên</option>
          </select>
        </div>
        <Button type="submit" fullWidth dangTai={dangTai}>
          Đăng ký
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
