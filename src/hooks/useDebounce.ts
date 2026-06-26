import { useEffect, useState } from 'react';

// Debounce một giá trị (thường là từ khóa tìm kiếm) trước khi gọi API.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
