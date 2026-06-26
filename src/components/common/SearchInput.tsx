import type { InputHTMLAttributes } from 'react';

// Component không debounce; kết hợp với useDebounce ở trang gọi.
type Props = InputHTMLAttributes<HTMLInputElement>;

// Ô tìm kiếm có icon kính lúp, dùng ở đầu các trang danh sách.
export default function SearchInput({ className = '', ...rest }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
      <input
        type="search"
        className={`input-base pl-9 ${className}`}
        {...rest}
      />
    </div>
  );
}
