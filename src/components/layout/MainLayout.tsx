import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Khung trang chính cho người dùng đã đăng nhập: Sidebar + Header + nội dung.
export default function MainLayout() {
  const [moSidebar, setMoSidebar] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar moRa={moSidebar} onDong={() => setMoSidebar(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMoSidebar={() => setMoSidebar(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
