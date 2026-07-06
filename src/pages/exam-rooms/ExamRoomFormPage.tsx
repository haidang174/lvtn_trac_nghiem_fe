import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { examRoomsApi } from '@/api/examRooms.api';
import { examsApi } from '@/api/exams.api';
import { subjectOfferingsApi } from '@/api/subjectOfferings.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { localToISO, nowLocalInput, formatDateTime } from '@/utils/formatDate';
import { CheDoCauHoi, NHAN_CHE_DO_CAU_HOI } from '@/enums/cheDoCauHoi';
import { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';

export default function ExamRoomFormPage() {
  const { id } = useParams<{ id: string }>();
  const laSua = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [offerings, setOfferings] = useState<MonHocHocKy[]>([]);
  const [deCongKhai, setDeCongKhai] = useState<BaiThi[]>([]);

  const [maMonHocHocKy, setMaMonHocHocKy] = useState('');
  const [tenPhongThi, setTenPhongThi] = useState('');
  const [maBaiThis, setMaBaiThis] = useState<number[]>([]);
  const [cheDo, setCheDo] = useState<CheDoCauHoi>(CheDoCauHoi.THEO_THU_TU);
  const [thoiGianLamBai, setThoiGianLamBai] = useState(30);
  const [moLuc, setMoLuc] = useState('');
  const [soNguoiThamGia, setSoNguoiThamGia] = useState<number | ''>('');

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const napDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const dsOffering = await subjectOfferingsApi.getOfferings({
        page: 1,
        limit: 1000,
        laHoatDong: true,
      });
      setOfferings(dsOffering.items);

      if (laSua && id) {
        const phong = await examRoomsApi.getExamRoomById(+id);
        setMaMonHocHocKy(String(phong.maMonHocHocKy));
        setTenPhongThi(phong.tenPhongThi);
        setCheDo(phong.cheDoCauHoi);
        setThoiGianLamBai(phong.thoiGianLamBai);
        setSoNguoiThamGia(phong.soNguoiThamGia ?? '');
        setMaBaiThis(
          (phong.phongThiBaiThis ?? []).map((p) => p.maBaiThi),
        );
      }
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
      if (laSua) navigate('/exam-rooms');
    } finally {
      setDangTai(false);
    }
  }, [id, laSua, navigate, toast]);

  useEffect(() => {
    napDuLieu();
  }, [napDuLieu]);

  // Nạp đề công khai của môn-học-kỳ đang chọn.
  useEffect(() => {
    if (!maMonHocHocKy) {
      setDeCongKhai([]);
      return;
    }
    let huy = false;
    examsApi
      .getExams({
        page: 1,
        limit: 1000,
        maMonHocHocKy: Number(maMonHocHocKy),
        trangThai: TrangThaiBaiThi.CONG_KHAI,
      })
      .then((d) => {
        if (!huy) setDeCongKhai(d.items);
      })
      .catch((err) => !huy && toast.error(chuanHoaLoi(err).message));
    return () => {
      huy = true;
    };
  }, [maMonHocHocKy, toast]);

  const dongLucTuTinh =
    moLuc && thoiGianLamBai
      ? new Date(new Date(moLuc).getTime() + thoiGianLamBai * 60000)
      : null;

  const toggleDe = (maBaiThi: number) => {
    setMaBaiThis((prev) =>
      prev.includes(maBaiThi)
        ? prev.filter((x) => x !== maBaiThi)
        : [...prev, maBaiThi],
    );
  };

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (!maMonHocHocKy) return toast.error('Vui lòng chọn môn học của học kỳ');
    if (!tenPhongThi.trim()) return toast.error('Vui lòng nhập tên phòng thi');
    if (maBaiThis.length === 0)
      return toast.error('Vui lòng chọn ít nhất 1 đề thi');
    if (thoiGianLamBai < 1) return toast.error('Thời lượng phải ≥ 1 phút');
    if (!moLuc) return toast.error('Vui lòng nhập thời gian mở phòng');
    if (new Date(moLuc) < new Date())
      return toast.error('Thời gian mở phòng không được ở quá khứ');

    setDangLuu(true);
    try {
      const payload = {
        maMonHocHocKy: Number(maMonHocHocKy),
        tenPhongThi: tenPhongThi.trim(),
        maBaiThis,
        cheDoCauHoi: cheDo,
        thoiGianLamBai,
        moLuc: localToISO(moLuc),
        soNguoiThamGia: soNguoiThamGia ? Number(soNguoiThamGia) : undefined,
      };
      if (laSua) {
        await examRoomsApi.updateExamRoom(+id!, payload);
        toast.success('Đã cập nhật phòng thi');
        navigate(`/exam-rooms/${id}`);
      } else {
        const phong = await examRoomsApi.createExamRoom(payload);
        toast.success('Đã tạo phòng thi');
        navigate(`/exam-rooms/${phong.maPhongThi}`);
      }
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
        tieuDe={laSua ? 'Sửa phòng thi' : 'Tạo phòng thi'}
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
            ← Quay lại
          </Button>
        }
      />

      <form
        onSubmit={xuLyLuu}
        className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-5"
      >
        <Select
          label="Môn học (học kỳ) *"
          placeholder="-- Chọn môn học của học kỳ --"
          value={maMonHocHocKy}
          disabled={laSua}
          onChange={(e) => {
            setMaMonHocHocKy(e.target.value);
            setMaBaiThis([]);
          }}
          options={offerings.map((o) => ({
            value: o.maMonHocHocKy,
            label: `${o.monHoc?.tenMonHoc ?? 'Môn ' + o.maMonHoc} — ${o.hocKy?.tenHocKy ?? ''} ${o.hocKy?.namHoc ?? ''}`,
          }))}
        />

        <Input
          label="Tên phòng thi *"
          value={tenPhongThi}
          maxLength={150}
          onChange={(e) => setTenPhongThi(e.target.value)}
          placeholder="VD: Kiểm tra giữa kỳ - Ca 1"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Đề thi trong phòng * (bốc ngẫu nhiên 1 đề cho mỗi học sinh)
          </label>
          {!maMonHocHocKy ? (
            <p className="py-4 text-center text-sm text-gray-400">
              Hãy chọn môn học của học kỳ để xem danh sách đề công khai
            </p>
          ) : deCongKhai.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Chưa có đề thi công khai nào cho môn học của học kỳ này.
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {deCongKhai.map((de) => (
                <li key={de.maBaiThi}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={maBaiThis.includes(de.maBaiThi)}
                      onChange={() => toggleDe(de.maBaiThi)}
                    />
                    <span className="text-sm text-gray-700">
                      {de.tieuDe}{' '}
                      <span className="text-xs text-gray-400">
                        ({de.nguoiTao?.tenNguoiDung ?? 'GV'})
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

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
          <Input
            label="Thời lượng làm bài (phút) *"
            type="number"
            min={1}
            value={thoiGianLamBai}
            onChange={(e) => setThoiGianLamBai(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Mở phòng lúc *"
            type="datetime-local"
            min={nowLocalInput()}
            value={moLuc}
            onChange={(e) => setMoLuc(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đóng phòng lúc (tự tính)
            </label>
            <div className="input-base mt-1 flex items-center bg-gray-50 text-gray-700">
              {dongLucTuTinh ? formatDateTime(dongLucTuTinh.toISOString()) : '—'}
            </div>
          </div>
        </div>

        <Input
          label="Số người tham gia tối đa (tùy chọn)"
          type="number"
          min={1}
          value={soNguoiThamGia}
          onChange={(e) =>
            setSoNguoiThamGia(e.target.value ? Number(e.target.value) : '')
          }
          placeholder="Bỏ trống = không giới hạn"
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
            Hủy
          </Button>
          <Button type="submit" dangTai={dangLuu}>
            {laSua ? 'Lưu thay đổi' : 'Tạo phòng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
