import { useEffect, useState, useCallback, useMemo, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { examsApi } from '@/api/exams.api';
import { subjectsApi } from '@/api/subjects.api';
import { questionsApi } from '@/api/questions.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import { DoKho, NHAN_DO_KHO } from '@/enums/doKho';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { CauHoi } from '@/types/cau-hoi.type';

// Câu hỏi đã bốc vào đề (giữ thứ tự theo mảng).
interface CauHoiChon {
  maCauHoi: number;
  noiDung: string;
  doKho: DoKho;
}

// Chế độ nhập cơ cấu độ khó: theo số câu cụ thể hoặc theo tỷ lệ %.
type CheDoNhap = 'so_cau' | 'ty_le';

// Cơ cấu độ khó theo 3 mức, dùng chung cho pool có sẵn lẫn số câu mục tiêu.
interface CoCau {
  de: number;
  trung_binh: number;
  kho: number;
}

// Xáo trộn (Fisher–Yates) rồi lấy N phần tử đầu.
function bocNgauNhien<T>(nguon: T[], soLuong: number): T[] {
  const ban = nguon.slice();
  for (let i = ban.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ban[i], ban[j]] = [ban[j], ban[i]];
  }
  return ban.slice(0, soLuong);
}

export default function ExamFormPage() {
  const { id } = useParams<{ id: string }>();
  const laSua = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [nganHang, setNganHang] = useState<CauHoi[]>([]);

  const [tieuDe, setTieuDe] = useState('');
  const [maMonHoc, setMaMonHoc] = useState('');
  const [thoiGian, setThoiGian] = useState(30);
  const [trangThai, setTrangThai] = useState<TrangThaiBaiThi>(TrangThaiBaiThi.NHAP);

  // Cấu hình bốc câu hỏi theo độ khó.
  const [cheDoNhap, setCheDoNhap] = useState<CheDoNhap>('so_cau');
  const [soCauDe, setSoCauDe] = useState(0);
  const [soCauTB, setSoCauTB] = useState(0);
  const [soCauKho, setSoCauKho] = useState(0);
  const [tongSoCau, setTongSoCau] = useState(10);
  const [tyLeDe, setTyLeDe] = useState(40);
  const [tyLeTB, setTyLeTB] = useState(40);
  const [tyLeKho, setTyLeKho] = useState(20);

  // Danh sách câu đã bốc để xem trước (chỉ đọc).
  const [daBoc, setDaBoc] = useState<CauHoiChon[]>([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  // Đề đã được dùng (có phòng thi / bài làm) => khóa toàn bộ chỉnh sửa.
  const [daKhoa, setDaKhoa] = useState(false);

  // Nạp môn học + (nếu sửa) đề thi hiện có. Ngân hàng câu hỏi tải riêng theo môn.
  const napDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const mh = await subjectsApi.getSubjects({ page: 1, limit: 1000 });
      setMonHocs(mh.items);

      if (laSua && id) {
        const bt = await examsApi.getExamById(+id);
        setTieuDe(bt.tieuDe);
        setMaMonHoc(String(bt.maMonHoc));
        setThoiGian(bt.thoiGianLamBai);
        setTrangThai(bt.trangThai);
        setDaKhoa(!!bt.daSuDung);
        const chon: CauHoiChon[] = (bt.cauHoiBaiThis ?? [])
          .slice()
          .sort((a, b) => a.thuTu - b.thuTu)
          .map((c) => ({
            maCauHoi: c.maCauHoi,
            noiDung: c.cauHoi?.noiDung ?? `Câu #${c.maCauHoi}`,
            doKho: c.cauHoi?.doKho ?? DoKho.TRUNG_BINH,
          }));
        setDaBoc(chon);
        // Tái tạo cấu hình số câu từ bộ câu hiện có để prefill.
        setSoCauDe(chon.filter((c) => c.doKho === DoKho.DE).length);
        setSoCauTB(chon.filter((c) => c.doKho === DoKho.TRUNG_BINH).length);
        setSoCauKho(chon.filter((c) => c.doKho === DoKho.KHO).length);
      }
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
      if (laSua) navigate('/exams');
    } finally {
      setDangTai(false);
    }
  }, [id, laSua, navigate, toast]);

  useEffect(() => {
    napDuLieu();
  }, [napDuLieu]);

  // Ngân hàng câu hỏi chỉ tải khi đã chọn môn học; chưa chọn thì để trống.
  useEffect(() => {
    if (!maMonHoc) {
      setNganHang([]);
      return;
    }
    let huy = false;
    (async () => {
      try {
        const ch = await questionsApi.getQuestions({
          page: 1,
          limit: 1000,
          maMonHoc: Number(maMonHoc),
        });
        if (!huy) setNganHang(ch.items);
      } catch (err) {
        if (!huy) toast.error(chuanHoaLoi(err).message);
      }
    })();
    return () => {
      huy = true;
    };
  }, [maMonHoc, toast]);

  // Gom ngân hàng theo độ khó -> dùng làm pool bốc & hiển thị số có sẵn.
  const poolTheoDoKho = useMemo(
    () => ({
      de: nganHang.filter((q) => q.doKho === DoKho.DE),
      trung_binh: nganHang.filter((q) => q.doKho === DoKho.TRUNG_BINH),
      kho: nganHang.filter((q) => q.doKho === DoKho.KHO),
    }),
    [nganHang],
  );

  const soCoSan: CoCau = {
    de: poolTheoDoKho.de.length,
    trung_binh: poolTheoDoKho.trung_binh.length,
    kho: poolTheoDoKho.kho.length,
  };

  // Số câu mục tiêu theo từng mức, tính theo chế độ đang chọn.
  // Trả về null nếu cấu hình chưa hợp lệ (kèm thông báo lỗi).
  const tinhSoCauMucTieu = (): { coCau: CoCau; loi?: string } => {
    if (cheDoNhap === 'so_cau') {
      return { coCau: { de: soCauDe, trung_binh: soCauTB, kho: soCauKho } };
    }
    // Chế độ tỷ lệ: tổng % phải bằng 100.
    if (tyLeDe + tyLeTB + tyLeKho !== 100)
      return {
        coCau: { de: 0, trung_binh: 0, kho: 0 },
        loi: 'Tổng tỷ lệ dễ + trung bình + khó phải bằng 100%',
      };
    let de = Math.round((tongSoCau * tyLeDe) / 100);
    let trung_binh = Math.round((tongSoCau * tyLeTB) / 100);
    let kho = Math.round((tongSoCau * tyLeKho) / 100);
    // Dồn chênh lệch (do làm tròn) vào mức có tỷ lệ lớn nhất.
    const chenh = tongSoCau - (de + trung_binh + kho);
    if (chenh !== 0) {
      const lonNhat = Math.max(tyLeDe, tyLeTB, tyLeKho);
      if (lonNhat === tyLeDe) de += chenh;
      else if (lonNhat === tyLeTB) trung_binh += chenh;
      else kho += chenh;
    }
    return { coCau: { de, trung_binh, kho } };
  };

  // Bốc / bốc lại câu hỏi theo cấu hình hiện tại (xem trước trước khi lưu).
  const bocCauHoi = () => {
    if (daKhoa) return;
    if (!maMonHoc) return toast.error('Vui lòng chọn môn học');

    const { coCau, loi } = tinhSoCauMucTieu();
    if (loi) return toast.error(loi);

    const tong = coCau.de + coCau.trung_binh + coCau.kho;
    if (tong < 1) return toast.error('Số câu muốn lấy phải ≥ 1');

    // Kiểm tra đủ câu cho từng mức.
    const thieu: string[] = [];
    if (coCau.de > soCoSan.de) thieu.push(`Dễ (cần ${coCau.de}, có ${soCoSan.de})`);
    if (coCau.trung_binh > soCoSan.trung_binh)
      thieu.push(`Trung bình (cần ${coCau.trung_binh}, có ${soCoSan.trung_binh})`);
    if (coCau.kho > soCoSan.kho) thieu.push(`Khó (cần ${coCau.kho}, có ${soCoSan.kho})`);
    if (thieu.length > 0)
      return toast.error(`Không đủ câu hỏi: ${thieu.join('; ')}`);

    const chon: CauHoiChon[] = [
      ...bocNgauNhien(poolTheoDoKho.de, coCau.de),
      ...bocNgauNhien(poolTheoDoKho.trung_binh, coCau.trung_binh),
      ...bocNgauNhien(poolTheoDoKho.kho, coCau.kho),
    ].map((q) => ({ maCauHoi: q.maCauHoi, noiDung: q.noiDung, doKho: q.doKho }));

    setDaBoc(chon);
  };

  // Đổi môn (do người dùng thao tác) -> bỏ câu đã bốc & reset cấu hình vì khác môn.
  const doiMonHoc = (value: string) => {
    setMaMonHoc(value);
    setDaBoc([]);
    setSoCauDe(0);
    setSoCauTB(0);
    setSoCauKho(0);
  };

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (daKhoa) return; // Đề đã sử dụng: không cho lưu thay đổi.
    if (!tieuDe.trim()) return toast.error('Vui lòng nhập tiêu đề');
    if (!maMonHoc) return toast.error('Vui lòng chọn môn học');
    if (thoiGian < 1) return toast.error('Thời gian làm bài phải ≥ 1 phút');
    if (daBoc.length === 0)
      return toast.error('Vui lòng bốc câu hỏi trước khi lưu');

    setDangLuu(true);
    try {
      const payload = {
        tieuDe: tieuDe.trim(),
        maMonHoc: Number(maMonHoc),
        thoiGianLamBai: thoiGian,
        trangThai,
        cauHois: daBoc.map((c, i) => ({ maCauHoi: c.maCauHoi, thuTu: i + 1 })),
      };
      if (laSua) {
        await examsApi.updateExam(+id!, payload);
        toast.success('Cập nhật đề thi thành công');
      } else {
        await examsApi.createExam(payload);
        toast.success('Tạo đề thi thành công');
      }
      navigate('/exams');
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

  const tongMucTieu =
    cheDoNhap === 'so_cau' ? soCauDe + soCauTB + soCauKho : tongSoCau;

  return (
    <div>
      <PageHeader
        tieuDe={laSua ? 'Sửa đề thi' : 'Tạo đề thi'}
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/exams')}>
            ← Quay lại
          </Button>
        }
      />

      <form onSubmit={xuLyLuu} className="space-y-5">
        {daKhoa && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            🔒 Đề thi đã được dùng để tạo phòng thi hoặc đã có học sinh làm bài nên không thể
            chỉnh sửa. Hãy tạo một đề thi mới nếu cần thay đổi.
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Input
              label="Tiêu đề *"
              value={tieuDe}
              maxLength={100}
              disabled={daKhoa}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Kiểm tra giữa kỳ"
            />
          </div>
          <Select
            label="Môn học *"
            placeholder="-- Chọn môn --"
            value={maMonHoc}
            disabled={daKhoa}
            onChange={(e) => doiMonHoc(e.target.value)}
            options={monHocs
              .filter((m) => m.laHoatDong || String(m.maMonHoc) === String(maMonHoc))
              .map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
          />
          <Input
            label="Thời gian (phút) *"
            type="number"
            min={1}
            value={thoiGian}
            disabled={daKhoa}
            onChange={(e) => setThoiGian(Number(e.target.value))}
          />
          <Select
            label="Trạng thái"
            value={trangThai}
            disabled={daKhoa}
            onChange={(e) => setTrangThai(e.target.value as TrangThaiBaiThi)}
            options={Object.values(TrangThaiBaiThi).map((v) => ({
              value: v,
              label: NHAN_TRANG_THAI_BAI_THI[v],
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Cấu hình bốc câu hỏi theo độ khó */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-medium text-gray-800">Lấy câu hỏi từ ngân hàng</h3>
              {/* Chuyển chế độ nhập */}
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCheDoNhap('so_cau')}
                  disabled={daKhoa}
                  className={`px-3 py-1.5 disabled:cursor-not-allowed ${
                    cheDoNhap === 'so_cau'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Số câu
                </button>
                <button
                  type="button"
                  onClick={() => setCheDoNhap('ty_le')}
                  disabled={daKhoa}
                  className={`px-3 py-1.5 disabled:cursor-not-allowed ${
                    cheDoNhap === 'ty_le'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tỷ lệ %
                </button>
              </div>
            </div>

            {!maMonHoc ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Hãy chọn môn học để xem số câu có sẵn
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-gray-500">
                  Có sẵn: <span className="font-medium text-emerald-600">{soCoSan.de} dễ</span> ·{' '}
                  <span className="font-medium text-amber-600">
                    {soCoSan.trung_binh} trung bình
                  </span>{' '}
                  · <span className="font-medium text-rose-600">{soCoSan.kho} khó</span>
                </p>

                {cheDoNhap === 'so_cau' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Số câu dễ"
                      type="number"
                      min={0}
                      max={soCoSan.de}
                      value={soCauDe}
                      disabled={daKhoa}
                      onChange={(e) => setSoCauDe(Math.max(0, Number(e.target.value)))}
                    />
                    <Input
                      label="Số câu TB"
                      type="number"
                      min={0}
                      max={soCoSan.trung_binh}
                      value={soCauTB}
                      disabled={daKhoa}
                      onChange={(e) => setSoCauTB(Math.max(0, Number(e.target.value)))}
                    />
                    <Input
                      label="Số câu khó"
                      type="number"
                      min={0}
                      max={soCoSan.kho}
                      value={soCauKho}
                      disabled={daKhoa}
                      onChange={(e) => setSoCauKho(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="Tổng số câu muốn lấy"
                      type="number"
                      min={1}
                      value={tongSoCau}
                      disabled={daKhoa}
                      onChange={(e) => setTongSoCau(Math.max(1, Number(e.target.value)))}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Tỷ lệ dễ (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={tyLeDe}
                        disabled={daKhoa}
                        onChange={(e) => setTyLeDe(Math.max(0, Number(e.target.value)))}
                      />
                      <Input
                        label="Tỷ lệ TB (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={tyLeTB}
                        disabled={daKhoa}
                        onChange={(e) => setTyLeTB(Math.max(0, Number(e.target.value)))}
                      />
                      <Input
                        label="Tỷ lệ khó (%)"
                        type="number"
                        min={0}
                        max={100}
                        value={tyLeKho}
                        disabled={daKhoa}
                        onChange={(e) => setTyLeKho(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                    <p
                      className={`text-xs ${
                        tyLeDe + tyLeTB + tyLeKho === 100 ? 'text-gray-500' : 'text-rose-600'
                      }`}
                    >
                      Tổng tỷ lệ: {tyLeDe + tyLeTB + tyLeKho}% (phải bằng 100%)
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600">
                    Tổng câu muốn lấy: <span className="font-semibold">{tongMucTieu}</span>
                  </span>
                  <Button type="button" variant="secondary" onClick={bocCauHoi} disabled={daKhoa}>
                    {daBoc.length > 0 ? 'Bốc lại' : 'Bốc câu hỏi'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Xem trước câu hỏi đã bốc */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-medium text-gray-800">
              Câu hỏi trong đề ({daBoc.length})
            </h3>
            {daBoc.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Chưa có câu nào. Cấu hình bên trái rồi bấm "Bốc câu hỏi".
              </p>
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto">
                {daBoc.map((c, i) => (
                  <li
                    key={c.maCauHoi}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="line-clamp-1 flex-1 text-sm text-gray-700">
                      <MathText>{c.noiDung}</MathText>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.doKho === DoKho.DE
                          ? 'bg-emerald-50 text-emerald-600'
                          : c.doKho === DoKho.TRUNG_BINH
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {NHAN_DO_KHO[c.doKho]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/exams')}>
            Hủy
          </Button>
          <Button type="submit" dangTai={dangLuu} disabled={daKhoa}>
            {laSua ? 'Lưu thay đổi' : 'Tạo đề thi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
