import { useCallback, useState } from 'react';

interface Options {
  page?: number;
  limit?: number;
}

// Quản lý state phân trang cho danh sách (khớp PaginationDto: page, limit ở Backend).
export function usePagination({ page = 1, limit = 20 }: Options = {}) {
  const [trang, setTrang] = useState(page);
  const [gioiHan, setGioiHan] = useState(limit);

  // Đặt lại về trang 1 — gọi khi đổi bộ lọc/từ khóa tìm kiếm.
  const datLai = useCallback(() => setTrang(1), []);

  const doiGioiHan = useCallback((value: number) => {
    setGioiHan(value);
    setTrang(1);
  }, []);

  return {
    page: trang,
    limit: gioiHan,
    setPage: setTrang,
    setLimit: doiGioiHan,
    resetPage: datLai,
  };
}
