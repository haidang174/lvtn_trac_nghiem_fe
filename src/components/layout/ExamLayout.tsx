import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Thông tin hiển thị trên header trang làm bài (trang con set qua Outlet context).
export interface ThongTinHeaderThi {
  tenDe: string;
  tenMon: string | null;
}

export interface ExamLayoutContext {
  datThongTinHeader: (tt: ThongTinHeaderThi | null) => void;
}

// Layout riêng cho trang làm bài: KHÔNG Sidebar/Header chính để HS tập trung làm bài.
export default function ExamLayout() {
  const [thongTin, setThongTin] = useState<ThongTinHeaderThi | null>(null);

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50">
      {/* Thanh trên cùng tối giản: tên đề thi + tên môn, không có điều hướng. */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          {thongTin ? (
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-800">{thongTin.tenDe}</p>
              {thongTin.tenMon && (
                <p className="truncate text-xs text-gray-500">{thongTin.tenMon}</p>
              )}
            </div>
          ) : (
            <span className="font-semibold text-gray-800">Phòng làm bài thi</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 lg:p-6">
        <Outlet context={{ datThongTinHeader: setThongTin } satisfies ExamLayoutContext} />
      </main>
    </div>
  );
}
