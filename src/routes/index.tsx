import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import GuestRoute from './GuestRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage';
import HomePage from '@/pages/HomePage';
import { ForbiddenPage, NotFoundPage } from '@/pages/ErrorPages';
import { moduleRoutes } from './moduleRoutes';

export const router = createBrowserRouter([
  // Route công khai — chỉ dành cho khách (đã đăng nhập sẽ bị đẩy về '/')
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Callback Google: không bọc GuestRoute vì cần xử lý token rồi mới chuyển hướng
  { path: '/auth/google/callback', element: <GoogleCallbackPage /> },

  // Route yêu cầu đăng nhập
  {
    element: <PrivateRoute />,
    children: [
      // Đổi mật khẩu: card full-screen riêng, không bọc MainLayout
      { path: '/change-password', element: <ChangePasswordPage /> },

      // Các trang nghiệp vụ dùng chung khung MainLayout (Sidebar + Header)
      {
        element: <MainLayout />,
        children: [{ path: '/', element: <HomePage /> }, ...moduleRoutes],
      },
    ],
  },

  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
