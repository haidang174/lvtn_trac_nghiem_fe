import type { ReactNode } from 'react';
import Spinner from '@/components/ui/Spinner';

export interface ColumnDef<T> {
  // Tiêu đề cột.
  tieuDe: ReactNode;
  // Hàm render giá trị ô từ 1 dòng dữ liệu.
  render: (row: T, index: number) => ReactNode;
  // Class tùy chỉnh cho ô (vd canh phải, độ rộng).
  className?: string;
}

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  // Khóa duy nhất cho mỗi dòng (React key).
  rowKey: (row: T) => string | number;
  dangTai?: boolean;
  // Nội dung hiển thị khi không có dữ liệu.
  rong?: ReactNode;
  // Bấm vào dòng (tùy chọn).
  onRowClick?: (row: T) => void;
}

// Bảng dữ liệu dùng chung cho các trang danh sách. Responsive bằng overflow ngang.
export default function Table<T>({
  columns,
  data,
  rowKey,
  dangTai = false,
  rong = 'Không có dữ liệu',
  onRowClick,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 font-semibold ${col.className ?? ''}`}>
                {col.tieuDe}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {dangTai ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <Spinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                {rong}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
