import type { ReactNode } from 'react';

interface Props {
  tieuDe: string;
  moTa?: string;
  // Vùng hành động bên phải (vd nút "Thêm mới").
  hanhDong?: ReactNode;
}

// Tiêu đề trang chuẩn cho các trang nghiệp vụ.
export default function PageHeader({ tieuDe, moTa, hanhDong }: Props) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{tieuDe}</h1>
        {moTa && <p className="mt-0.5 text-sm text-gray-500">{moTa}</p>}
      </div>
      {hanhDong && <div className="flex flex-wrap gap-2">{hanhDong}</div>}
    </div>
  );
}
