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
import { enrollmentsApi } from '@/api/enrollments.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { VaiTro } from '@/enums/vaiTro';
import { localToISO, nowLocalInput, formatDateTime } from '@/utils/formatDate';
import { CheDoCauHoi, NHAN_CHE_DO_CAU_HOI } from '@/enums/cheDoCauHoi';
import { HinhThucThamGia } from '@/enums/hinhThucThamGia';
import { TrangThaiBaiThi } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';
import type { GhiDanh } from '@/types/ghi-danh.type';

export default function ExamRoomFormPage() {
  const { id } = useParams<{ id: string }>();
  const laSua = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  // GV chỉ mở được phòng dùng mã tham gia, không gán học sinh.
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [offerings, setOfferings] = useState<MonHocHocKy[]>([]);
  const [deCongKhai, setDeCongKhai] = useState<BaiThi[]>([]);
  const [dsGhiDanh, setDsGhiDanh] = useState<GhiDanh[]>([]);
  const [daGanKhac, setDaGanKhac] = useState<number[]>([]);

  const [maMonHocHocKy, setMaMonHocHocKy] = useState('');
  const [tenPhongThi, setTenPhongThi] = useState('');
  const [maBaiThis, setMaBaiThis] = useState<number[]>([]);
  const [maHocSinhs, setMaHocSinhs] = useState<number[]>([]);
  const [hinhThuc, setHinhThuc] = useState<HinhThucThamGia>(
    laGiaoVien ? HinhThucThamGia.MA_THAM_GIA : HinhThucThamGia.GAN_HOC_SINH,
  );
  // Hình thức lúc nạp (chế độ sửa) — dùng để cảnh báo khi Admin đổi qua lại.
  const [hinhThucGoc, setHinhThucGoc] = useState<HinhThucThamGia | null>(null);
  const [maThamGia, setMaThamGia] = useState<string | null>(null);
  const [cheDo, setCheDo] = useState<CheDoCauHoi>(CheDoCauHoi.THEO_THU_TU);
  const [thoiGianLamBai, setThoiGianLamBai] = useState(30);
  const [moLuc, setMoLuc] = useState('');

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const napDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      // GV không gọi được GET /subject-offerings (Admin-only) — dùng danh sách
      // môn mình được phân dạy; endpoint đó đã tự lọc môn đã gỡ và học kỳ đã
      // kết thúc, còn phía Admin phải xin lọc bằng tham số.
      let ds: MonHocHocKy[];
      if (laGiaoVien) {
        ds = await subjectOfferingsApi.getMyTeaching();
      } else {
        const dsOffering = await subjectOfferingsApi.getOfferings({
          page: 1,
          limit: 1000,
          laHoatDong: true,
          chuaKetThuc: true,
        });
        ds = dsOffering.items;
      }
      setOfferings(ds);

      if (laSua && id) {
        const phong = await examRoomsApi.getExamRoomById(+id);
        setMaMonHocHocKy(String(phong.maMonHocHocKy));
        // Phòng cũ có thể thuộc học kỳ đã kết thúc (đã bị lọc khỏi danh sách
        // trên) — bổ sung để ô chọn môn vẫn hiển thị đúng tên.
        if (
          phong.monHocHocKy &&
          !ds.some((o) => o.maMonHocHocKy === phong.maMonHocHocKy)
        )
          setOfferings([phong.monHocHocKy, ...ds]);
        setTenPhongThi(phong.tenPhongThi);
        setCheDo(phong.cheDoCauHoi);
        setHinhThuc(phong.hinhThucThamGia);
        setHinhThucGoc(phong.hinhThucThamGia);
        setMaThamGia(phong.maThamGia);
        setThoiGianLamBai(phong.thoiGianLamBai);
        setMaBaiThis(
          (phong.phongThiBaiThis ?? []).map((p) => p.maBaiThi),
        );
        setMaHocSinhs(
          (phong.phongThiHocSinhs ?? []).map((p) => p.maHocSinh),
        );
      }
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
      if (laSua) navigate('/exam-rooms');
    } finally {
      setDangTai(false);
    }
  }, [id, laSua, laGiaoVien, navigate, toast]);

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

  // Nạp danh sách HS đã ghi danh môn-học-kỳ + HS đã gán vào phòng khác (để ẩn).
  // Chỉ Admin cần: 2 endpoint này đều Admin-only và GV không gán học sinh.
  useEffect(() => {
    if (!maMonHocHocKy || laGiaoVien) {
      setDsGhiDanh([]);
      setDaGanKhac([]);
      return;
    }
    let huy = false;
    Promise.all([
      enrollmentsApi.getEnrollments({ maMonHocHocKy: Number(maMonHocHocKy) }),
      examRoomsApi.getAssignedStudents(
        Number(maMonHocHocKy),
        laSua && id ? Number(id) : undefined,
      ),
    ])
      .then(([ds, daGan]) => {
        if (!huy) {
          setDsGhiDanh(ds);
          setDaGanKhac(daGan);
        }
      })
      .catch((err) => !huy && toast.error(chuanHoaLoi(err).message));
    return () => {
      huy = true;
    };
  }, [maMonHocHocKy, id, laSua, laGiaoVien, toast]);

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

  const toggleHocSinh = (maHocSinh: number) => {
    setMaHocSinhs((prev) =>
      prev.includes(maHocSinh)
        ? prev.filter((x) => x !== maHocSinh)
        : [...prev, maHocSinh],
    );
  };

  const laDungMa = hinhThuc === HinhThucThamGia.MA_THAM_GIA;
  const doiHinhThuc = hinhThucGoc !== null && hinhThuc !== hinhThucGoc;

  // HS đã gán vào phòng khác thì ẩn khỏi danh sách chọn.
  const dsKhaDung = dsGhiDanh.filter((g) => !daGanKhac.includes(g.maHocSinh));
  const chonTatCaHs = () => setMaHocSinhs(dsKhaDung.map((g) => g.maHocSinh));
  const boChonHs = () => setMaHocSinhs([]);

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (!maMonHocHocKy) return toast.error('Vui lòng chọn môn học của học kỳ');
    if (!tenPhongThi.trim()) return toast.error('Vui lòng nhập tên phòng thi');
    if (maBaiThis.length === 0)
      return toast.error('Vui lòng chọn ít nhất 1 đề thi');
    if (thoiGianLamBai < 1) return toast.error('Thời lượng phải ≥ 1 phút');
    const dsChon = deCongKhai.filter((d) => maBaiThis.includes(d.maBaiThi));
    const maxDe = dsChon.length ? Math.max(...dsChon.map((d) => d.thoiGianLamBai)) : 0;
    if (thoiGianLamBai < maxDe)
      return toast.error(
        `Thời lượng phòng (${thoiGianLamBai} phút) không được nhỏ hơn thời lượng đề dài nhất (${maxDe} phút)`,
      );
    if (!laDungMa && maHocSinhs.length === 0)
      return toast.error('Vui lòng gán ít nhất 1 học sinh vào phòng');
    if (!moLuc) return toast.error('Vui lòng nhập thời gian mở phòng');
    if (new Date(moLuc) < new Date())
      return toast.error('Thời gian mở phòng không được ở quá khứ');

    setDangLuu(true);
    try {
      // Chế độ mã tham gia: không gửi maHocSinhs — danh sách trong phòng là do
      // HS tự nhập mã, Backend sẽ từ chối nếu nhận danh sách gán tay.
      const payload = {
        maMonHocHocKy: Number(maMonHocHocKy),
        tenPhongThi: tenPhongThi.trim(),
        maBaiThis,
        hinhThucThamGia: hinhThuc,
        ...(laDungMa ? {} : { maHocSinhs }),
        cheDoCauHoi: cheDo,
        thoiGianLamBai,
        moLuc: localToISO(moLuc),
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
        className="max-w space-y-5 rounded-xl border border-gray-200 bg-white p-5"
      >
        <Select
          label="Môn học (học kỳ) *"
          placeholder="-- Chọn môn học của học kỳ --"
          value={maMonHocHocKy}
          disabled={laSua}
          onChange={(e) => {
            setMaMonHocHocKy(e.target.value);
            setMaBaiThis([]);
            setMaHocSinhs([]);
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

        {laGiaoVien ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Phòng của giáo viên dùng <strong>mã tham gia</strong>: học sinh đã
            đăng ký môn này tự nhập mã để vào phòng.
          </p>
        ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Hình thức tham gia *
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                {
                  giaTri: HinhThucThamGia.GAN_HOC_SINH,
                  nhan: 'Gán học sinh',
                  moTa: 'Chọn sẵn danh sách học sinh được vào phòng.',
                },
                {
                  giaTri: HinhThucThamGia.MA_THAM_GIA,
                  nhan: 'Mã tham gia',
                  moTa: 'Hệ thống sinh mã, học sinh tự nhập mã để vào phòng.',
                },
              ] as const
            ).map((o) => (
              <label
                key={o.giaTri}
                className={`flex cursor-pointer gap-2 rounded-lg border p-3 ${
                  hinhThuc === o.giaTri
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="hinhThucThamGia"
                  className="mt-0.5"
                  checked={hinhThuc === o.giaTri}
                  onChange={() => setHinhThuc(o.giaTri)}
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    {o.nhan}
                  </span>
                  <span className="block text-xs text-gray-500">{o.moTa}</span>
                </span>
              </label>
            ))}
          </div>

          {doiHinhThuc && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {laDungMa
                ? 'Đổi sang mã tham gia sẽ xóa danh sách học sinh đã có trong phòng; các em sẽ vào lại bằng mã.'
                : 'Đổi sang gán tay sẽ hủy mã tham gia hiện tại; hãy kiểm tra danh sách học sinh bên dưới.'}
            </p>
          )}
        </div>
        )}

        {laDungMa ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mã tham gia
            </label>
            {maThamGia ? (
              <div className="input-base flex items-center bg-gray-50 font-mono text-lg tracking-widest text-gray-800">
                {maThamGia}
              </div>
            ) : (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                Mã tham gia sẽ được sinh sau khi lưu phòng thi.
              </p>
            )}
          </div>
        ) : (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Học sinh trong phòng * (đã chọn {maHocSinhs.length}/{dsKhaDung.length})
            </label>
            {maMonHocHocKy && dsKhaDung.length > 0 && (
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={chonTatCaHs}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:underline"
                  onClick={boChonHs}
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>
          {!maMonHocHocKy ? (
            <p className="py-4 text-center text-sm text-gray-400">
              Hãy chọn môn học của học kỳ để xem danh sách học sinh đã ghi danh
            </p>
          ) : dsKhaDung.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {dsGhiDanh.length === 0
                ? 'Chưa có học sinh nào được ghi danh vào môn học của học kỳ này.'
                : 'Tất cả học sinh đã ghi danh đều đã được gán vào phòng khác.'}
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {dsKhaDung.map((g) => (
                <li key={g.maGhiDanh}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={maHocSinhs.includes(g.maHocSinh)}
                      onChange={() => toggleHocSinh(g.maHocSinh)}
                    />
                    <span className="text-sm text-gray-700">
                      {g.hocSinh?.tenNguoiDung ?? `#${g.maHocSinh}`}{' '}
                      <span className="text-xs text-gray-400">
                        ({g.hocSinh?.email ?? ''})
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}

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
