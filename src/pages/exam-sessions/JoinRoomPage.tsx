import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import { examSessionsApi } from '@/api/examSessions.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [maPhong, setMaPhong] = useState('');
  const [dangVao, setDangVao] = useState(false);

  const xuLyVao = async (e: FormEvent) => {
    e.preventDefault();
    const ma = maPhong.trim().toUpperCase();
    if (!ma) return toast.error('Vui lòng nhập mã phòng');

    setDangVao(true);
    try {
      const phien = await examSessionsApi.joinExamRoom(ma);
      navigate(`/exam/${phien.maBaiLam}`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangVao(false);
    }
  };

  return (
    <div>
      <PageHeader tieuDe="Vào phòng thi" moTa="Nhập mã phòng do giáo viên cung cấp" />

      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <span className="text-5xl">🚪</span>
          <p className="mt-2 text-sm text-gray-500">
            Nhập mã gồm 6 ký tự để bắt đầu làm bài thi
          </p>
        </div>

        <form onSubmit={xuLyVao} className="space-y-4">
          <input
            value={maPhong}
            onChange={(e) => setMaPhong(e.target.value.toUpperCase())}
            maxLength={10}
            placeholder="VD: A1B2C3"
            autoFocus
            className="input-base text-center font-mono text-2xl font-bold uppercase tracking-[0.4em]"
          />
          <Button type="submit" fullWidth dangTai={dangVao}>
            Vào thi
          </Button>
        </form>
      </div>
    </div>
  );
}
