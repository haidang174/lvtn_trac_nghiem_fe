import type { RouteObject } from 'react-router-dom';
import RoleBasedRoute from './RoleBasedRoute';
import { VaiTro } from '@/enums/vaiTro';
import UserListPage from '@/pages/users/UserListPage';
import UserDetailPage from '@/pages/users/UserDetailPage';
import SubjectListPage from '@/pages/subjects/SubjectListPage';
import QuestionListPage from '@/pages/questions/QuestionListPage';
import QuestionFormPage from '@/pages/questions/QuestionFormPage';
import QuestionDetailPage from '@/pages/questions/QuestionDetailPage';

// Vai trò Giáo viên + Admin (quản lý nội dung): dùng lại cho nhiều module.
const GV_ADMIN = [VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN];

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

  // ----- Module Môn học (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [{ path: '/subjects', element: <SubjectListPage /> }],
  },

  // ----- Module Câu hỏi (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [
      { path: '/questions', element: <QuestionListPage /> },
      { path: '/questions/new', element: <QuestionFormPage /> },
      { path: '/questions/:id', element: <QuestionDetailPage /> },
      { path: '/questions/:id/edit', element: <QuestionFormPage /> },
    ],
  },
];
