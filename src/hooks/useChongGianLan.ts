import { useEffect, useRef } from 'react';

interface Options {
  // Chỉ giám sát khi đang làm bài (bài còn DANG_LAM, đã nạp xong).
  hoatDong: boolean;
  // Số lần vi phạm tối đa trước khi tự nộp bài (mặc định 3).
  soLanToiDa?: number;
  // Gọi mỗi lần phát hiện vi phạm; soLan là số lần đã vi phạm (1, 2, 3...).
  onViPham: (soLan: number) => void;
  // Gọi khi số lần vi phạm đạt ngưỡng -> tự động nộp bài.
  onVuotNguong: () => void;
}

// Phát hiện thí sinh rời màn hình làm bài: Alt+Tab, chuyển tab, click sang
// ứng dụng/cửa sổ khác, thu nhỏ cửa sổ... Trình duyệt KHÔNG cho phép chặn
// các hành vi cấp hệ điều hành này, nên ta phát hiện qua sự kiện mất tiêu
// điểm (blur) và ẩn tab (visibilitychange) rồi tính số lần vi phạm.
export function useChongGianLan({ hoatDong, soLanToiDa = 3, onViPham, onVuotNguong }: Options) {
  const soLanRef = useRef(0);
  // Mốc thời gian vi phạm gần nhất để gộp các sự kiện cùng một hành động
  // (vd: chuyển tab phát cả blur lẫn visibilitychange) thành 1 lần.
  const mocCuoiRef = useRef(0);

  const onViPhamRef = useRef(onViPham);
  const onVuotNguongRef = useRef(onVuotNguong);
  onViPhamRef.current = onViPham;
  onVuotNguongRef.current = onVuotNguong;

  useEffect(() => {
    if (!hoatDong) return;

    const ghiNhanViPham = () => {
      const now = Date.now();
      if (now - mocCuoiRef.current < 1500) return; // bỏ qua sự kiện trùng
      mocCuoiRef.current = now;

      soLanRef.current += 1;
      const soLan = soLanRef.current;
      onViPhamRef.current(soLan);
      if (soLan >= soLanToiDa) onVuotNguongRef.current();
    };

    // window.blur: Alt+Tab, click sang cửa sổ/ứng dụng khác, mở cửa sổ mới.
    const xuLyBlur = () => ghiNhanViPham();
    // visibilitychange: chuyển sang tab khác hoặc thu nhỏ trình duyệt.
    const xuLyAnTab = () => {
      if (document.hidden) ghiNhanViPham();
    };

    window.addEventListener('blur', xuLyBlur);
    document.addEventListener('visibilitychange', xuLyAnTab);

    return () => {
      window.removeEventListener('blur', xuLyBlur);
      document.removeEventListener('visibilitychange', xuLyAnTab);
    };
  }, [hoatDong, soLanToiDa]);
}
