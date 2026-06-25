import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage';
import HomePage from '@/pages/HomePage';
import { ForbiddenPage, NotFoundPage } from '@/pages/ErrorPages';

export const router = createBrowserRouter([
  // Route công khai (chưa cần đăng nhập)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/google/callback', element: <GoogleCallbackPage /> },

  // Route yêu cầu đăng nhập
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/change-password', element: <ChangePasswordPage /> },
    ],
  },

  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
