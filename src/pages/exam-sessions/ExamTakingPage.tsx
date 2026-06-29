import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import type { ExamLayoutContext } from '@/components/layout/ExamLayout';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import MathText from '@/components/common/MathText';
import { examSessionsApi } from '@/api/examSessions.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useChongGianLan } from '@/hooks/useChongGianLan';
import { LoaiCauHoi } from '@/enums/loaiCauHoi';
import { TrangThaiBaiLam } from '@/enums/trangThaiBaiLam';
import type { PhienThi, KetQuaTomTat } from '@/types/bai-lam.type';

function dinhDangGio(giay: number | null): string {
  if (giay == null) return '--:--';
  const g = Math.max(0, giay);
  const gio = Math.floor(g / 3600);
  const phut = Math.floor((g % 3600) / 60);
  const giayLe = g % 60;
  const hai = (n: number) => String(n).padStart(2, '0');
  return gio > 0 ? `${hai(gio)}:${hai(phut)}:${hai(giayLe)}` : `${hai(phut)}:${hai(giayLe)}`;
}

export default function ExamTakingPage() {
  const { id } = useParams<{ id: string }>();
  const maBaiLam = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { datThongTinHeader } = useOutletContext<ExamLayoutContext>();

  const [phien, setPhien] = useState<PhienThi | null>(null);
  const [dapAn, setDapAn] = useState<Record<number, number[]>>({});
  const [viTri, setViTri] = useState(0);
  const [dangTai, setDangTai] = useState(true);

  const [ketQua, setKetQua] = useState<KetQuaTomTat | null>(null);
  const [daKetThuc, setDaKetThuc] = useState(false); // hết giờ/nộp xong
  const [xacNhanNop, setXacNhanNop] = useState(false);
  const [dangNop, setDangNop] = useState(false);
  // Cảnh báo chống gian lận đang hiển thị (lần 1: nhắc nhở, lần 2: cảnh cáo).
  const [canhBaoViPham, setCanhBaoViPham] = useState<{ soLan: number } | null>(null);

  // Nạp phiên thi.
  useEffect(() => {
    let huy = false;
    (async () => {
      try {
        const data = await examSessionsApi.getExamSession(maBaiLam);
        if (huy) return;
        setPhien(data);
        datThongTinHeader({ tenDe: data.tenDeThi, tenMon: data.tenMonHoc });
        const map: Record<number, number[]> = {};
        data.cauHois.forEach((c) => (map[c.maCauHoi] = c.daChon ?? []));
        setDapAn(map);
        if (data.trangThai !== TrangThaiBaiLam.DANG_LAM) setDaKetThuc(true);
      } catch (err) {
        toast.error(chuanHoaLoi(err).message);
        navigate('/join');
      } finally {
        if (!huy) setDangTai(false);
      }
    })();
    return () => {
      huy = true;
    };
  }, [maBaiLam, navigate, toast]);

  const xuLyHetGio = useCallback((kq: KetQuaTomTat | null) => {
    setKetQua(kq);
    setDaKetThuc(true);
  }, []);

  const { conLaiGiay } = useExamTimer({
    maBaiLam,
    hoatDong: !!phien && !daKetThuc,
    giayBanDau: phien?.thoiGianConLaiGiay,
    onHetGio: xuLyHetGio,
    onLoi: (m) => toast.error(m),
  });

  const luuTraLoi = async (maCauHoi: number, maLuaChons: number[]) => {
    setDapAn((cu) => ({ ...cu, [maCauHoi]: maLuaChons }));
    try {
      await examSessionsApi.submitAnswer(maBaiLam, maCauHoi, maLuaChons);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const chonDapAn = (maCauHoi: number, maLuaChon: number, motDapAn: boolean) => {
    if (daKetThuc) return;
    const hienTai = dapAn[maCauHoi] ?? [];
    let moi: number[];
    if (motDapAn) {
      moi = hienTai.includes(maLuaChon) ? [] : [maLuaChon];
    } else {
      moi = hienTai.includes(maLuaChon)
        ? hienTai.filter((x) => x !== maLuaChon)
        : [...hienTai, maLuaChon];
    }
    luuTraLoi(maCauHoi, moi);
  };

  const nopBaiThi = useCallback(async () => {
    setDangNop(true);
    try {
      const kq = await examSessionsApi.submitExam(maBaiLam);
      setKetQua(kq);
      setDaKetThuc(true);
      setXacNhanNop(false);
      setCanhBaoViPham(null);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangNop(false);
    }
  }, [maBaiLam, toast]);

  // ----- Chống gian lận: rời màn hình làm bài (Alt+Tab, đổi tab, app khác) -----
  const xuLyViPham = useCallback(
    (soLan: number) => {
      if (soLan >= 3) {
        // Lần 3: thông báo và tự động nộp bài (việc nộp do onVuotNguong lo).
        setCanhBaoViPham(null);
        toast.error('Bạn đã vi phạm quy chế thi 3 lần. Hệ thống tự động nộp bài.');
        return;
      }
      // Lần 1: nhắc nhở, lần 2: cảnh cáo.
      setCanhBaoViPham({ soLan });
    },
    [toast],
  );

  useChongGianLan({
    hoatDong: !!phien && !daKetThuc && !dangTai,
    onViPham: xuLyViPham,
    onVuotNguong: nopBaiThi,
  });

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!phien) return null;

  // ----- Màn hình kết thúc (nộp xong / hết giờ) -----
  if (daKetThuc) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <span className="text-6xl">{ketQua ? '🎉' : '⏰'}</span>
          <h1 className="mt-3 text-xl font-bold text-gray-900">
            {ketQua ? 'Đã nộp bài!' : 'Bài thi đã kết thúc'}
          </h1>
          {ketQua ? (
            <>
              <p className="mt-4 text-4xl font-bold text-primary">{ketQua.diemSo}/10</p>
              <p className="mt-1 text-gray-500">
                Đúng {ketQua.soCauDung}/{ketQua.tongSoCau} câu
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Bài làm đã được ghi nhận. Xem điểm trong mục kết quả của bạn.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/results/me">
              <Button type="button">Xem kết quả</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" type="button">
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----- Màn hình làm bài -----
  const cauHoi = phien.cauHois[viTri];
  const motDapAn = cauHoi.loaiCauHoi === LoaiCauHoi.MOT_DAP_AN;
  const daChonCauNay = dapAn[cauHoi.maCauHoi] ?? [];
  const sapHetGio = conLaiGiay != null && conLaiGiay <= 60;
  const soCauDaLam = phien.cauHois.filter((c) => (dapAn[c.maCauHoi] ?? []).length > 0).length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
      {/* Cột nội dung câu hỏi */}
      <div className="order-2 lg:order-1">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Câu {viTri + 1}/{phien.cauHois.length}
            </span>
            <span className="text-xs text-gray-400">
              {motDapAn ? 'Chọn 1 đáp án' : 'Chọn nhiều đáp án'}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-lg font-medium text-gray-900">
            <MathText>{cauHoi.noiDung}</MathText>
          </p>
          {cauHoi.hinhAnh && (
            <img
              src={cauHoi.hinhAnh}
              alt="Hình minh họa"
              className="mt-3 max-h-60 rounded-lg border border-gray-200 object-contain"
            />
          )}

          <div className="mt-4 space-y-2">
            {cauHoi.luaChons.map((lc, i) => {
              const chon = daChonCauNay.includes(lc.maLuaChon);
              return (
                <button
                  key={lc.maLuaChon}
                  type="button"
                  onClick={() => chonDapAn(cauHoi.maCauHoi, lc.maLuaChon, motDapAn)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    chon
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center ${
                      motDapAn ? 'rounded-full' : 'rounded-md'
                    } border text-sm font-medium ${
                      chon ? 'border-primary bg-primary text-white' : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-gray-800">
                    <MathText>{lc.noiDung}</MathText>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            type="button"
            disabled={viTri === 0}
            onClick={() => setViTri((v) => v - 1)}
          >
            ← Câu trước
          </Button>
          {viTri < phien.cauHois.length - 1 ? (
            <Button type="button" onClick={() => setViTri((v) => v + 1)}>
              Câu sau →
            </Button>
          ) : (
            <Button type="button" onClick={() => setXacNhanNop(true)}>
              Nộp bài
            </Button>
          )}
        </div>
      </div>

      {/* Cột timer + bảng câu hỏi */}
      <div className="order-1 space-y-4 lg:order-2">
        <div
          className={`rounded-xl border p-4 text-center ${
            sapHetGio ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-xs text-gray-500">Thời gian còn lại</p>
          <p
            className={`mt-1 font-mono text-3xl font-bold ${
              sapHetGio ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {dinhDangGio(conLaiGiay)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Đã làm {soCauDaLam}/{phien.cauHois.length}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {phien.cauHois.map((c, i) => {
              const daLam = (dapAn[c.maCauHoi] ?? []).length > 0;
              const dangXem = i === viTri;
              return (
                <button
                  key={c.maCauHoi}
                  type="button"
                  onClick={() => setViTri(i)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                    dangXem
                      ? 'border-primary bg-primary text-white'
                      : daLam
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="button" fullWidth onClick={() => setXacNhanNop(true)}>
          Nộp bài
        </Button>
      </div>

      <ConfirmDialog
        moRa={xacNhanNop}
        tieuDe="Nộp bài thi"
        noiDung={`Bạn đã làm ${soCauDaLam}/${phien.cauHois.length} câu. Nộp bài ngay? Sau khi nộp sẽ không thể sửa.`}
        nhanXacNhan="Nộp bài"
        dangXuLy={dangNop}
        onXacNhan={nopBaiThi}
        onHuy={() => setXacNhanNop(false)}
      />

      {/* Overlay cảnh báo chống gian lận (lần 1: nhắc nhở, lần 2: cảnh cáo). */}
      {canhBaoViPham && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="text-5xl">⚠️</span>
            <h2
              className={`mt-3 text-xl font-bold ${
                canhBaoViPham.soLan === 1 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {canhBaoViPham.soLan === 1 ? 'Nhắc nhở' : 'Cảnh cáo'}
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Bạn vừa rời khỏi màn hình làm bài (chuyển tab, cửa sổ hoặc ứng dụng khác). Hành vi này
              vi phạm quy chế thi.
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800">
              {canhBaoViPham.soLan === 1
                ? 'Đây là lần vi phạm thứ 1/3. Vui lòng tập trung làm bài.'
                : 'Đây là lần vi phạm thứ 2/3. Nếu vi phạm thêm 1 lần nữa, bài thi sẽ tự động bị nộp.'}
            </p>
            <div className="mt-6">
              <Button type="button" fullWidth onClick={() => setCanhBaoViPham(null)}>
                Tôi đã hiểu, tiếp tục làm bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
