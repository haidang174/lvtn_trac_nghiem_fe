import type { RouteObject } from 'react-router-dom';
import RoleBasedRoute from './RoleBasedRoute';
import { VaiTro } from '@/enums/vaiTro';
import UserListPage from '@/pages/users/UserListPage';
import UserDetailPage from '@/pages/users/UserDetailPage';

// Tập hợp route của các module nghiệp vụ (nằm trong MainLayout).
export const moduleRoutes: RouteObject[] = [
  // ----- Module Người dùng (chỉ Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.QUAN_TRI_VIEN]} />,
    children: [
      { path: '/users', element: <UserListPage /> },
      { path: '/users/:id', element: <UserDetailPage /> },
    ],
  },
];
