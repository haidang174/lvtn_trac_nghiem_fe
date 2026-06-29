import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';

interface Props {
  onMoSidebar: () => void;
}

// Thanh trên cùng: nút mở sidebar (mobile) + hồ sơ tài khoản; hover hồ sơ mở popup
// chứa Đổi mật khẩu / Đăng xuất.
export default function Header({ onMoSidebar }: Props) {
  const { user, logout } = useAuth();
  const chuCaiDau = user?.tenNguoiDung?.charAt(0).toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMoSidebar}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Mở menu"
      >
        ☰
      </button>

      {/* Hồ sơ: icon chữ cái bên trái, tên + vai trò bên phải. Hover/focus mở popup. */}
      <div className="group relative ml-auto">
        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-gray-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {chuCaiDau}
          </span>
          <span className="text-left">
            <span className="block text-sm font-medium text-gray-800">{user?.tenNguoiDung}</span>
            <span className="block text-xs text-gray-500">
              {user ? NHAN_VAI_TRO[user.vaiTro] : ''}
            </span>
          </span>
        </button>

        {/* Popup: pt-2 phủ khoảng hở giữa nút và thẻ để hover không bị ngắt. */}
        <div className="invisible absolute right-0 top-full z-30 w-52 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            {user?.coMatKhau && (
              <Link
                to="/change-password"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="text-lg">🔒</span>
                Đổi mật khẩu
              </Link>
            )}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <span className="text-lg">🚪</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
