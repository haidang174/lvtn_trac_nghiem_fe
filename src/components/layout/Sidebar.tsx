import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { useAppSelector } from '@/store/hooks';

interface Props {
  // Trên mobile: sidebar trượt ra, điều khiển bằng state ở MainLayout.
  moRa: boolean;
  onDong: () => void;
}

export default function Sidebar({ moRa, onDong }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const items = NAV_ITEMS.filter((item) => user && item.vaiTro.includes(user.vaiTro));

  return (
    <>
      {/* Nền mờ khi mở trên mobile */}
      {moRa && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onDong} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          moRa ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
          <span className="text-2xl">🧠</span>
          <span className="text-lg font-bold text-primary">Trắc Nghiệm</span>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onDong}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.nhan}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
