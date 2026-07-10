import { VaiTro } from '@/enums/vaiTro';

export interface NavItem {
  path: string;
  nhan: string;
  icon: string;
  vaiTro: VaiTro[];
}

// Cấu hình menu điều hướng theo vai trò. Sidebar lọc theo vaiTro của user hiện tại.
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    nhan: 'Trang chủ',
    icon: '🏠',
    vaiTro: [VaiTro.HOC_SINH, VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/users',
    nhan: 'Người dùng',
    icon: '👥',
    vaiTro: [VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/subjects',
    nhan: 'Môn học',
    icon: '📚',
    vaiTro: [VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/semesters',
    nhan: 'Học kỳ',
    icon: '🗓️',
    vaiTro: [VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/questions',
    nhan: 'Câu hỏi',
    icon: '❓',
    vaiTro: [VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/exams',
    nhan: 'Đề thi',
    icon: '📝',
    vaiTro: [VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/exam-rooms',
    nhan: 'Phòng thi',
    icon: '🏫',
    vaiTro: [VaiTro.QUAN_TRI_VIEN],
  },
  {
    path: '/enroll',
    nhan: 'Đăng ký môn học',
    icon: '📝',
    vaiTro: [VaiTro.HOC_SINH],
  },
  {
    path: '/join',
    nhan: 'Phòng thi',
    icon: '🚪',
    vaiTro: [VaiTro.HOC_SINH],
  },
  {
    path: '/results/me',
    nhan: 'Kết quả của tôi',
    icon: '🎯',
    vaiTro: [VaiTro.HOC_SINH],
  },
  {
    path: '/results',
    nhan: 'Kết quả & Thống kê',
    icon: '📊',
    vaiTro: [VaiTro.GIAO_VIEN, VaiTro.QUAN_TRI_VIEN],
  },
];
