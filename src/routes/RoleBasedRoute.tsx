import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { VaiTro } from '@/enums/vaiTro';

interface Props {
  // Danh sách vai trò được phép truy cập route con.
  vaiTroChoPhep: VaiTro[];
}

// Tương ứng common/guards/roles.guard.ts + @Roles() — chặn theo vaiTro.
export default function RoleBasedRoute({ vaiTroChoPhep }: Props) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!vaiTroChoPhep.includes(user.vaiTro)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
