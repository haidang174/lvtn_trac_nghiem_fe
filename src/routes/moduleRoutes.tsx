import type { RouteObject } from 'react-router-dom';
import RoleBasedRoute from './RoleBasedRoute';
import { VaiTro } from '@/enums/vaiTro';
import UserListPage from '@/pages/users/UserListPage';
import UserDetailPage from '@/pages/users/UserDetailPage';
import SubjectListPage from '@/pages/subjects/SubjectListPage';
import SubjectDetailPage from '@/pages/subjects/SubjectDetailPage';
import QuestionListPage from '@/pages/questions/QuestionListPage';
import QuestionFormPage from '@/pages/questions/QuestionFormPage';
import QuestionDetailPage from '@/pages/questions/QuestionDetailPage';
import ExamListPage from '@/pages/exams/ExamListPage';
import ExamFormPage from '@/pages/exams/ExamFormPage';
import ExamDetailPage from '@/pages/exams/ExamDetailPage';
import ExamRoomListPage from '@/pages/exam-rooms/ExamRoomListPage';
import ExamRoomFormPage from '@/pages/exam-rooms/ExamRoomFormPage';
import ExamRoomDetailPage from '@/pages/exam-rooms/ExamRoomDetailPage';
import JoinRoomPage from '@/pages/exam-sessions/JoinRoomPage';
import ResultHistoryPage from '@/pages/results/ResultHistoryPage';
import ResultListPage from '@/pages/results/ResultListPage';
import ResultDetailPage from '@/pages/results/ResultDetailPage';

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
    children: [
      { path: '/subjects', element: <SubjectListPage /> },
      { path: '/subjects/:id', element: <SubjectDetailPage /> },
    ],
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

  // ----- Module Phòng thi: xem (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [
      { path: '/exam-rooms', element: <ExamRoomListPage /> },
      { path: '/exam-rooms/:id', element: <ExamRoomDetailPage /> },
    ],
  },
  // ----- Module Phòng thi: tạo (chỉ GV) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.GIAO_VIEN]} />,
    children: [{ path: '/exam-rooms/new', element: <ExamRoomFormPage /> }],
  },

  // ----- Vào phòng thi (chỉ HS) — trang /exam/:id dùng ExamLayout riêng ở routes/index -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.HOC_SINH]} />,
    children: [{ path: '/join', element: <JoinRoomPage /> }],
  },

  // ----- Module Kết quả: lịch sử của tôi (chỉ HS) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.HOC_SINH]} />,
    children: [{ path: '/results/me', element: <ResultHistoryPage /> }],
  },
  // ----- Module Kết quả: danh sách + thống kê (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [{ path: '/results', element: <ResultListPage /> }],
  },
  // ----- Module Kết quả: chi tiết (cả 3 vai trò) -----
  {
    element: (
      <RoleBasedRoute
        vaiTroChoPhep={[VaiTro.HOC_SINH, VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN]}
      />
    ),
    children: [{ path: '/results/:id', element: <ResultDetailPage /> }],
  },
];
