import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { xoaToast, type LoaiToast } from '@/store/slices/ui.slice';

const mauTheoLoai: Record<LoaiToast, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
  warning: 'bg-amber-500',
};

function ToastItem({ id, loai, noiDung }: { id: string; loai: LoaiToast; noiDung: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(xoaToast(id)), 4000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${mauTheoLoai[loai]}`}
    >
      <span>{noiDung}</span>
      <button onClick={() => dispatch(xoaToast(id))} className="text-white/80 hover:text-white">
        ✕
      </button>
    </div>
  );
}

// Hiển thị toast toàn cục (state ở ui.slice).
export default function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}
