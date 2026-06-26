import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type KichThuoc = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  moRa: boolean;
  onDong: () => void;
  tieuDe?: ReactNode;
  children: ReactNode;
  chanDuoi?: ReactNode;
  kichThuoc?: KichThuoc;
}

const lopKichThuoc: Record<KichThuoc, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Modal cơ bản dùng portal, đóng khi bấm nền hoặc phím Esc.
export default function Modal({
  moRa,
  onDong,
  tieuDe,
  children,
  chanDuoi,
  kichThuoc = 'md',
}: Props) {
  useEffect(() => {
    if (!moRa) return;
    const xuLyEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDong();
    };
    document.addEventListener('keydown', xuLyEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', xuLyEsc);
      document.body.style.overflow = '';
    };
  }, [moRa, onDong]);

  if (!moRa) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onDong}
        aria-hidden="true"
      />
      {/* Hộp nội dung */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${lopKichThuoc[kichThuoc]} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl`}
      >
        {tieuDe && (
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{tieuDe}</h2>
            <button
              onClick={onDong}
              className="text-gray-400 transition hover:text-gray-700"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-5 py-4">{children}</div>
        {chanDuoi && (
          <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
            {chanDuoi}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
