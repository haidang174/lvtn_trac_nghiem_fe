import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { examRoomsApi } from '@/api/examRooms.api';
import { examsApi } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { localToISO, nowLocalInput } from '@/utils/formatDate';
import { CheDoCauHoi, NHAN_CHE_DO_CAU_HOI } from '@/enums/cheDoCauHoi';
import { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';

export default function ExamRoomFormPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Chỉ đề đã công khai mới được tạo phòng.
  const [deCongKhai, setDeCongKhai] = useState<BaiThi[]>([]);
  const [maBaiThi, setMaBaiThi] = useState('');
  const [cheDo, setCheDo] = useState<CheDoCauHoi>(CheDoCauHoi.THEO_THU_TU);
  const [soCauChon, setSoCauChon] = useState<number | ''>('');
  const [moLuc, setMoLuc] = useState('');
  const [dongLuc, setDongLuc] = useState('');
  const [soNguoiThamGia, setSoNguoiThamGia] = useState<number | ''>('');

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    examsApi
      .getExams({ page: 1, limit: 1000 })
      .then((d) => setDeCongKhai(d.items.filter((e) => e.trangThai === TrangThaiBaiThi.CONG_KHAI)))
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTai(false));
  }, [toast]);

  // Đổi giờ mở: nếu giờ đóng đang chọn không còn hợp lệ (<= giờ mở) thì xóa để buộc chọn lại.
  const doiMoLuc = (v: string) => {
    setMoLuc(v);
    if (dongLuc && v && new Date(dongLuc) <= new Date(v)) setDongLuc('');
  };

  // Đổi giờ đóng: chặn chọn giờ <= giờ mở (min của datetime-local không khóa được phần giờ).
  const doiDongLuc = (v: string) => {
    if (v && moLuc && new Date(v) <= new Date(moLuc)) {
      toast.error('Thời gian đóng phòng phải sau thời gian mở phòng');
      return;
    }
    setDongLuc(v);
  };

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (!maBaiThi) return toast.error('Vui lòng chọn đề thi');
    if (!moLuc || !dongLuc) return toast.error('Vui lòng nhập thời gian mở/đóng phòng');
    if (new Date(moLuc) < new Date())
      return toast.error('Thời gian mở phòng không được ở quá khứ');
    if (new Date(moLuc) >= new Date(dongLuc))
      return toast.error('Thời gian mở phòng phải trước thời gian đóng phòng');
    if (cheDo === CheDoCauHoi.NGAU_NHIEN && (!soCauChon || soCauChon < 1))
      return toast.error('Chế độ ngẫu nhiên cần số câu chọn ≥ 1');

    setDangLuu(true);
    try {
      const phong = await examRoomsApi.createExamRoom({
        maBaiThi: Number(maBaiThi),
        cheDoCauHoi: cheDo,
        soCauChon: cheDo === CheDoCauHoi.NGAU_NHIEN ? Number(soCauChon) : undefined,
        moLuc: localToISO(moLuc),
        dongLuc: localToISO(dongLuc),
        soNguoiThamGia: soNguoiThamGia ? Number(soNguoiThamGia) : undefined,
      });
      toast.success(`Đã tạo phòng thi · Mã: ${phong.maThamGiaPhong}`);
      navigate(`/exam-rooms/${phong.maPhongThi}`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangLuu(false);
    }
  };

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        tieuDe="Tạo phòng thi"
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
            ← Quay lại
          </Button>
        }
      />

      {deCongKhai.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Chưa có đề thi nào ở trạng thái <b>Công khai</b>. Hãy công khai một đề thi trước khi tạo
          phòng.
        </div>
      ) : (
        <form onSubmit={xuLyLuu} className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-5">
          <Select
            label="Đề thi (đã công khai) *"
            placeholder="-- Chọn đề thi --"
            value={maBaiThi}
            onChange={(e) => setMaBaiThi(e.target.value)}
            options={deCongKhai.map((e) => ({ value: e.maBaiThi, label: e.tieuDe }))}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Chế độ câu hỏi"
              value={cheDo}
              onChange={(e) => setCheDo(e.target.value as CheDoCauHoi)}
              options={Object.values(CheDoCauHoi).map((v) => ({
                value: v,
                label: NHAN_CHE_DO_CAU_HOI[v],
              }))}
            />
            {cheDo === CheDoCauHoi.NGAU_NHIEN && (
              <Input
                label="Số câu chọn ngẫu nhiên *"
                type="number"
                min={1}
                value={soCauChon}
                onChange={(e) => setSoCauChon(e.target.value ? Number(e.target.value) : '')}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Mở phòng lúc *"
              type="datetime-local"
              min={nowLocalInput()}
              value={moLuc}
              onChange={(e) => doiMoLuc(e.target.value)}
            />
            <Input
              label="Đóng phòng lúc *"
              type="datetime-local"
              min={moLuc || nowLocalInput()}
              value={dongLuc}
              onChange={(e) => doiDongLuc(e.target.value)}
            />
          </div>

          <Input
            label="Số người tham gia tối đa (tùy chọn)"
            type="number"
            min={1}
            value={soNguoiThamGia}
            onChange={(e) => setSoNguoiThamGia(e.target.value ? Number(e.target.value) : '')}
            placeholder="Bỏ trống = không giới hạn"
          />

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
              Hủy
            </Button>
            <Button type="submit" dangTai={dangLuu}>
              Tạo phòng
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
