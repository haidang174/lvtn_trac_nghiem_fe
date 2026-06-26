import { useAuth } from '@/hooks/useAuth';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';

interface Props {
  onMoSidebar: () => void;
}

// Thanh trên cùng: nút mở sidebar (mobile) + thông tin tài khoản hiển thị tĩnh.
export default function Header({ onMoSidebar }: Props) {
  const { user } = useAuth();
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

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <span className="block text-sm font-medium text-gray-800">{user?.tenNguoiDung}</span>
          <span className="block text-xs text-gray-500">
            {user ? NHAN_VAI_TRO[user.vaiTro] : ''}
          </span>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {chuCaiDau}
        </span>
      </div>
    </header>
  );
}
