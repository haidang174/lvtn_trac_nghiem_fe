import { io, type Socket } from 'socket.io-client';
import { tokenStorage } from '@/utils/token';
import type { KetQuaTomTat } from '@/types/bai-lam.type';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

// Sự kiện server -> client (khớp exam-sessions.gateway.ts ở Backend).
export interface ServerToClientEvents {
  timer_tick: (payload: { conLaiGiay: number }) => void;
  time_up: (payload: { ketQua: KetQuaTomTat | null }) => void;
  error: (payload: { message: string }) => void;
}

export type ExamSocket = Socket<ServerToClientEvents>;

// Tạo kết nối WebSocket cho 1 bài làm (namespace 'exam-sessions').
// Token gửi qua handshake.auth.token; maBaiLam qua query (Backend yêu cầu cả hai).
export function taoSocketPhienThi(maBaiLam: number): ExamSocket {
  return io(`${WS_URL}/exam-sessions`, {
    transports: ['websocket'],
    auth: { token: tokenStorage.getAccessToken() ?? '' },
    query: { maBaiLam },
  });
}
