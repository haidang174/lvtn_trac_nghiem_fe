import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import ToastContainer from '@/components/common/ToastContainer';
import { useAppDispatch } from '@/store/hooks';
import { khoiPhucPhien } from '@/store/slices/auth.slice';

export default function App() {
  const dispatch = useAppDispatch();

  // Khôi phục phiên đăng nhập khi mở app (nếu còn token).
  useEffect(() => {
    dispatch(khoiPhucPhien());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
