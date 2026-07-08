import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
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
        moTa="Các phòng thi bạn được phân công vào"
        hanhDong={
          <Button variant="ghost" type="button" onClick={taiDuLieu}>
            🔄 Làm mới
          </Button>
        }
      />

      {dangTai ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Chưa có phòng thi nào. Hãy liên hệ giáo viên/quản trị nếu bạn cần được phân công vào phòng.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
