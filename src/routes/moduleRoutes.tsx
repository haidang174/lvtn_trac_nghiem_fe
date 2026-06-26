import type { RouteObject } from 'react-router-dom';
import RoleBasedRoute from './RoleBasedRoute';
import { VaiTro } from '@/enums/vaiTro';
import UserListPage from '@/pages/users/UserListPage';
import UserDetailPage from '@/pages/users/UserDetailPage';
import SubjectListPage from '@/pages/subjects/SubjectListPage';
import QuestionListPage from '@/pages/questions/QuestionListPage';
import QuestionFormPage from '@/pages/questions/QuestionFormPage';
import QuestionDetailPage from '@/pages/questions/QuestionDetailPage';
import ExamListPage from '@/pages/exams/ExamListPage';
import ExamFormPage from '@/pages/exams/ExamFormPage';
import ExamDetailPage from '@/pages/exams/ExamDetailPage';

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

  // ----- Module Đề thi: xem (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [
      { path: '/exams', element: <ExamListPage /> },
      { path: '/exams/:id', element: <ExamDetailPage /> },
    ],
  },
  // ----- Module Đề thi: tạo/sửa (chỉ GV) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.GIAO_VIEN]} />,
    children: [
      { path: '/exams/new', element: <ExamFormPage /> },
      { path: '/exams/:id/edit', element: <ExamFormPage /> },
    ],
  },
];
