import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Spinner from '@/components/ui/Spinner';

// Ngược với PrivateRoute: chặn các trang khách (login/register/...) khi ĐÃ đăng nhập.
// Người đã đăng nhập sẽ bị đẩy về trang chủ, không thể quay lại trang login bằng back/forward.
export default function GuestRoute() {
  const { daXacThuc, dangKhoiPhuc } = useAppSelector((s) => s.auth);

  if (dangKhoiPhuc) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (daXacThuc) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
