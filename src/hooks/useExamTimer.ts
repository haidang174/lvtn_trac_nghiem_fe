import { useEffect, useRef, useState } from 'react';
import { taoSocketPhienThi, type ExamSocket } from '@/sockets/socket';
import type { KetQuaTomTat } from '@/types/bai-lam.type';

interface Options {
  maBaiLam: number;
  // Chỉ kết nối khi bài còn đang làm.
  hoatDong: boolean;
  // Số giây còn lại ban đầu (lấy từ phiên thi) để hiển thị ngay.
  giayBanDau?: number;
  // Gọi khi hết giờ (server tự nộp và trả kết quả).
  onHetGio: (ketQua: KetQuaTomTat | null) => void;
  onLoi?: (message: string) => void;
}

// Kết nối WebSocket nghe timer_tick/time_up, đồng bộ lại sau reconnect.
export function useExamTimer({ maBaiLam, hoatDong, giayBanDau, onHetGio, onLoi }: Options) {
  const [conLaiGiay, setConLaiGiay] = useState<number | null>(giayBanDau ?? null);
  const [daKetNoi, setDaKetNoi] = useState(false);

  // Giữ callback mới nhất trong ref để không phải reconnect khi prop đổi.
  const onHetGioRef = useRef(onHetGio);
  const onLoiRef = useRef(onLoi);
  onHetGioRef.current = onHetGio;
  onLoiRef.current = onLoi;

  useEffect(() => {
    if (!hoatDong) return;

    const socket: ExamSocket = taoSocketPhienThi(maBaiLam);

    socket.on('connect', () => setDaKetNoi(true));
    socket.on('disconnect', () => setDaKetNoi(false));
    socket.on('timer_tick', ({ conLaiGiay }) => setConLaiGiay(conLaiGiay));
    socket.on('time_up', ({ ketQua }) => {
      setConLaiGiay(0);
      onHetGioRef.current(ketQua);
    });
    socket.on('error', ({ message }) => onLoiRef.current?.(message));
    socket.on('connect_error', (err) => onLoiRef.current?.(err.message));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [maBaiLam, hoatDong]);

  return { conLaiGiay, daKetNoi };
}
