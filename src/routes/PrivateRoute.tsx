import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Spinner from '@/components/ui/Spinner';

// Tương ứng common/guards/jwt-auth.guard.ts — chặn truy cập nếu chưa đăng nhập.
export default function PrivateRoute() {
  const { daXacThuc, dangKhoiPhuc } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (dangKhoiPhuc) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!daXacThuc) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
