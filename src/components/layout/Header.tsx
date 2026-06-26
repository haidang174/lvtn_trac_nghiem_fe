import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';

interface Props {
  onMoSidebar: () => void;
}

export default function Header({ onMoSidebar }: Props) {
  const { user, logout } = useAuth();
  const [moMenu, setMoMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi bấm ra ngoài.
  useEffect(() => {
    const xuLy = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoMenu(false);
      }
    };
    document.addEventListener('mousedown', xuLy);
    return () => document.removeEventListener('mousedown', xuLy);
  }, []);

  const chuCaiDau = user?.tenNguoiDung?.charAt(0).toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMoSidebar}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Mở menu"
      >
        ☰
      </button>

      <div className="flex-1 lg:hidden" />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMoMenu((v) => !v)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {chuCaiDau}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-gray-800">{user?.tenNguoiDung}</span>
            <span className="block text-xs text-gray-500">
              {user ? NHAN_VAI_TRO[user.vaiTro] : ''}
            </span>
          </span>
        </button>

        {moMenu && (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="truncate text-sm font-medium text-gray-800">{user?.tenNguoiDung}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            {user?.coMatKhau && (
              <Link
                to="/change-password"
                onClick={() => setMoMenu(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                🔒 Đổi mật khẩu
              </Link>
            )}
            <button
              onClick={logout}
              className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
