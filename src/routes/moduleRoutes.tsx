import type { RouteObject } from 'react-router-dom';
import RoleBasedRoute from './RoleBasedRoute';
import { VaiTro } from '@/enums/vaiTro';
import UserListPage from '@/pages/users/UserListPage';
import UserImportPage from '@/pages/users/UserImportPage';
import UserDetailPage from '@/pages/users/UserDetailPage';
import SubjectListPage from '@/pages/subjects/SubjectListPage';
import SubjectDetailPage from '@/pages/subjects/SubjectDetailPage';
import SemesterListPage from '@/pages/semesters/SemesterListPage';
import SemesterDetailPage from '@/pages/semesters/SemesterDetailPage';
import QuestionListPage from '@/pages/questions/QuestionListPage';
import QuestionFormPage from '@/pages/questions/QuestionFormPage';
import QuestionImportPage from '@/pages/questions/QuestionImportPage';
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
import ResultRoomScorePage from '@/pages/results/ResultRoomScorePage';
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
      { path: '/users/import', element: <UserImportPage /> },
      { path: '/users/:id', element: <UserDetailPage /> },
    ],
  },

  // ----- Module Môn học (chỉ Admin quản lý danh mục) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.QUAN_TRI_VIEN]} />,
    children: [
      { path: '/subjects', element: <SubjectListPage /> },
      { path: '/subjects/:id', element: <SubjectDetailPage /> },
    ],
  },

  // ----- Module Học kỳ / Mở môn / Phân công / Ghi danh (chỉ Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.QUAN_TRI_VIEN]} />,
    children: [
      { path: '/semesters', element: <SemesterListPage /> },
      { path: '/semesters/:id', element: <SemesterDetailPage /> },
    ],
  },

  // ----- Module Câu hỏi: xem (GV + Admin, Admin chỉ đọc) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [
      { path: '/questions', element: <QuestionListPage /> },
      { path: '/questions/:id', element: <QuestionDetailPage /> },
    ],
  },
  // ----- Module Câu hỏi: tạo/sửa/import (chỉ GV) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.GIAO_VIEN]} />,
    children: [
      { path: '/questions/new', element: <QuestionFormPage /> },
      { path: '/questions/import', element: <QuestionImportPage /> },
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

  // ----- Module Phòng thi: Admin quản lý CRUD -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={[VaiTro.QUAN_TRI_VIEN]} />,
    children: [
      { path: '/exam-rooms', element: <ExamRoomListPage /> },
      { path: '/exam-rooms/new', element: <ExamRoomFormPage /> },
      { path: '/exam-rooms/:id', element: <ExamRoomDetailPage /> },
      { path: '/exam-rooms/:id/edit', element: <ExamRoomFormPage /> },
    ],
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
  // ----- Module Kết quả: tổng quan theo phòng + bảng điểm phòng (GV + Admin) -----
  {
    element: <RoleBasedRoute vaiTroChoPhep={GV_ADMIN} />,
    children: [
      { path: '/results', element: <ResultListPage /> },
      { path: '/results/rooms/:maPhongThi', element: <ResultRoomScorePage /> },
    ],
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
