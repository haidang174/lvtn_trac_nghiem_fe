import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';
import { NAV_ITEMS } from '@/components/layout/navItems';

// Trang chủ: lời chào + lối tắt nhanh tới các chức năng theo vai trò.
export default function HomePage() {
  const { user } = useAuth();
  if (!user) return null;

  // Bỏ chính "Trang chủ" khỏi danh sách lối tắt.
  const loiTat = NAV_ITEMS.filter(
    (item) => item.path !== '/' && item.vaiTro.includes(user.vaiTro),
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow">
        <h1 className="text-2xl font-bold">Xin chào, {user.tenNguoiDung} 👋</h1>
        <p className="mt-1 text-white/80">
          {NHAN_VAI_TRO[user.vaiTro]} · {user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loiTat.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              {item.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{item.nhan}</p>
              <p className="text-sm text-gray-500">Truy cập {item.nhan.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
