import type { ReactNode } from 'react';

interface Props {
  tieuDe: string;
  moTa?: string;
  children: ReactNode;
}

// Khung trang xác thực: card căn giữa, responsive cho điện thoại.
export default function AuthLayout({ tieuDe, moTa, children }: Props) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-primary/10 to-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{tieuDe}</h1>
          {moTa && <p className="mt-1 text-sm text-gray-500">{moTa}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
