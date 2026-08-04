import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { examRoomsApi } from '@/api/examRooms.api';
import { examSessionsApi } from '@/api/examSessions.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { TrangThaiPhongThi, NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
import { mauTrangThaiPhong } from '@/pages/exam-rooms/ExamRoomListPage';
import type { PhongThi } from '@/types/phong-thi.type';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [rooms, setRooms] = useState<PhongThi[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangVao, setDangVao] = useState<number | null>(null);
  const [ma, setMa] = useState('');
  const [dangThamGia, setDangThamGia] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const data = await examRoomsApi.getAvailableRooms();
      setRooms(data.items);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Nhập mã tham gia: chỉ thêm mình vào phòng rồi tải lại danh sách — phòng có
  // thể chưa tới giờ mở nên không điều hướng thẳng vào bài thi.
  const xuLyNhapMa = async (e: FormEvent) => {
    e.preventDefault();
    if (!ma.trim()) return toast.error('Vui lòng nhập mã tham gia');
    setDangThamGia(true);
    try {
      const kq = await examRoomsApi.joinByCode(ma.trim());
      toast.success(
        kq.daThamGiaTruocDo
          ? `Bạn đã ở trong phòng "${kq.tenPhongThi}"`
          : `Đã tham gia phòng "${kq.tenPhongThi}"`,
      );
      setMa('');
      await taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangThamGia(false);
    }
  };

  const vaoThi = async (phong: PhongThi) => {
    setDangVao(phong.maPhongThi);
    try {
      const phien = await examSessionsApi.joinExamRoom(phong.maPhongThi);
      navigate(`/exam/${phien.maBaiLam}`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangVao(null);
    }
  };

  return (
    <div>
      <PageHeader
        tieuDe="Danh sách phòng thi"
        moTa="Phòng thi bạn được phân công hoặc đã tham gia bằng mã"
        hanhDong={
          <Button variant="ghost" type="button" onClick={taiDuLieu}>
            🔄 Làm mới
          </Button>
        }
      />

      <form
        onSubmit={xuLyNhapMa}
        className="mb-5 rounded-xl border border-gray-200 bg-white p-4"
      >
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tham gia bằng mã
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={ma}
            maxLength={8}
            className="font-mono uppercase tracking-widest"
            placeholder="VD: K7M2QP"
            onChange={(e) => setMa(e.target.value.toUpperCase())}
          />
          <Button type="submit" dangTai={dangThamGia} className="sm:w-40">
            Tham gia
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Nhập mã do giáo viên/quản trị cung cấp. Bạn phải đã đăng ký môn học
          của phòng thi đó.
        </p>
      </form>

      {dangTai ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Chưa có phòng thi nào. Hãy nhập mã tham gia ở trên, hoặc liên hệ giáo
          viên/quản trị nếu bạn cần được phân công vào phòng.
        </div>
      ) : (
        <div>
          {rooms.map((p) => {
            const coTheVao = p.trangThai !== TrangThaiPhongThi.DA_DONG;
            return (
              <div
                key={p.maPhongThi}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800">{p.tenPhongThi}</h3>
                  <StatusBadge mau={mauTrangThaiPhong[p.trangThai]}>
                    {NHAN_TRANG_THAI_PHONG_THI[p.trangThai]}
                  </StatusBadge>
                </div>
                <p className="mb-1 text-sm text-gray-500">
                  {p.monHocHocKy?.monHoc?.tenMonHoc ?? ''}
                  {p.monHocHocKy?.hocKy
                    ? ` — ${p.monHocHocKy.hocKy.tenHocKy} ${p.monHocHocKy.hocKy.namHoc}`
                    : ''}
                </p>
                <p className="text-xs text-gray-400">
                  Mở: {formatDateTime(p.moLuc)} · Đóng: {formatDateTime(p.dongLuc)}
                </p>
                <p className="mb-3 text-xs text-gray-400">
                  Thời lượng: {p.thoiGianLamBai} phút
                </p>
                <Button
                  type="button"
                  fullWidth
                  className="mt-auto"
                  disabled={!coTheVao}
                  dangTai={dangVao === p.maPhongThi}
                  onClick={() => vaoThi(p)}
                >
                  {coTheVao ? 'Vào thi' : 'Đã đóng'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
