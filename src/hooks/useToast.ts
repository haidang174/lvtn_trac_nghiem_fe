import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { themToast, type LoaiToast } from '@/store/slices/ui.slice';

// Tiện ích phát toast nhanh từ component (bọc dispatch themToast).
export function useToast() {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (loai: LoaiToast, noiDung: string) => dispatch(themToast(loai, noiDung)),
    [dispatch],
  );

  return {
    success: (noiDung: string) => toast('success', noiDung),
    error: (noiDung: string) => toast('error', noiDung),
    info: (noiDung: string) => toast('info', noiDung),
    warning: (noiDung: string) => toast('warning', noiDung),
  };
}
