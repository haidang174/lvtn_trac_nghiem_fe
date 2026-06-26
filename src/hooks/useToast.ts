import { useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { themToast, type LoaiToast } from '@/store/slices/ui.slice';

// Tiện ích phát toast nhanh từ component (bọc dispatch themToast).
// QUAN TRỌNG: trả về object ổn định (useMemo) để dùng làm dependency của
// useEffect/useCallback mà không gây vòng lặp render vô hạn.
export function useToast() {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const toast = (loai: LoaiToast, noiDung: string) => dispatch(themToast(loai, noiDung));
    return {
      success: (noiDung: string) => toast('success', noiDung),
      error: (noiDung: string) => toast('error', noiDung),
      info: (noiDung: string) => toast('info', noiDung),
      warning: (noiDung: string) => toast('warning', noiDung),
    };
  }, [dispatch]);
}
