import { useEffect, useState, useCallback, useMemo, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import SearchInput from '@/components/common/SearchInput';
import { examsApi } from '@/api/exams.api';
import { subjectsApi } from '@/api/subjects.api';
import { questionsApi } from '@/api/questions.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { CauHoi } from '@/types/cau-hoi.type';

// Câu hỏi đã chọn vào đề (giữ thứ tự theo mảng).
interface CauHoiChon {
  maCauHoi: number;
  noiDung: string;
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
  const [daChon, setDaChon] = useState<CauHoiChon[]>([]);

  const [timKiem, setTimKiem] = useState('');
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
        const chon = (bt.cauHoiBaiThis ?? [])
          .slice()
          .sort((a, b) => a.thuTu - b.thuTu)
          .map((c) => ({ maCauHoi: c.maCauHoi, noiDung: c.cauHoi?.noiDung ?? `Câu #${c.maCauHoi}` }));
        setDaChon(chon);
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

  // Ngân hàng còn lại (chưa chọn) + lọc theo từ khóa.
  const conLai = useMemo(() => {
    const daChonId = new Set(daChon.map((c) => c.maCauHoi));
    const tk = timKiem.trim().toLowerCase();
    return nganHang.filter(
      (q) => !daChonId.has(q.maCauHoi) && (!tk || q.noiDung.toLowerCase().includes(tk)),
    );
  }, [nganHang, daChon, timKiem]);

  // Đổi môn (do người dùng thao tác) → bỏ các câu đã chọn vì khác môn.
  const doiMonHoc = (value: string) => {
    setMaMonHoc(value);
    setDaChon([]);
    setTimKiem('');
  };

  const themCauHoi = (q: CauHoi) =>
    setDaChon((ds) => [...ds, { maCauHoi: q.maCauHoi, noiDung: q.noiDung }]);

  // Thêm toàn bộ câu hỏi đang hiển thị trong ngân hàng (theo bộ lọc) vào đề.
  const themTatCa = () =>
    setDaChon((ds) => [
      ...ds,
      ...conLai.map((q) => ({ maCauHoi: q.maCauHoi, noiDung: q.noiDung })),
    ]);

  const boCauHoi = (maCauHoi: number) =>
    setDaChon((ds) => ds.filter((c) => c.maCauHoi !== maCauHoi));

  // Bỏ toàn bộ câu hỏi khỏi đề.
  const xoaTatCa = () => setDaChon([]);

  const doiViTri = (index: number, huong: -1 | 1) =>
    setDaChon((ds) => {
      const moi = index + huong;
      if (moi < 0 || moi >= ds.length) return ds;
      const ban = ds.slice();
      [ban[index], ban[moi]] = [ban[moi], ban[index]];
      return ban;
    });

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (daKhoa) return; // Đề đã sử dụng: không cho lưu thay đổi.
    if (!tieuDe.trim()) return toast.error('Vui lòng nhập tiêu đề');
    if (!maMonHoc) return toast.error('Vui lòng chọn môn học');
    if (thoiGian < 1) return toast.error('Thời gian làm bài phải ≥ 1 phút');
    if (daChon.length === 0) return toast.error('Đề thi phải có ít nhất 1 câu hỏi');

    setDangLuu(true);
    try {
      const payload = {
        tieuDe: tieuDe.trim(),
        maMonHoc: Number(maMonHoc),
        thoiGianLamBai: thoiGian,
        trangThai,
        cauHois: daChon.map((c, i) => ({ maCauHoi: c.maCauHoi, thuTu: i + 1 })),
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
            options={monHocs.map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
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
          {/* Câu hỏi đã chọn */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-medium text-gray-800">
                Câu hỏi trong đề ({daChon.length})
              </h3>
              <button
                type="button"
                onClick={xoaTatCa}
                disabled={daKhoa || daChon.length === 0}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                🗑️ Xóa tất cả
              </button>
            </div>
            {daChon.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Chưa chọn câu hỏi nào. Thêm từ ngân hàng bên phải →
              </p>
            ) : (
              <ul className="space-y-2">
                {daChon.map((c, i) => (
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
                    <button
                      type="button"
                      onClick={() => doiViTri(i, -1)}
                      disabled={daKhoa || i === 0}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      title="Lên"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => doiViTri(i, 1)}
                      disabled={daKhoa || i === daChon.length - 1}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                      title="Xuống"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => boCauHoi(c.maCauHoi)}
                      disabled={daKhoa}
                      className="shrink-0 rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Bỏ khỏi đề"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ngân hàng câu hỏi */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-medium text-gray-800">Ngân hàng câu hỏi</h3>
              <button
                type="button"
                onClick={themTatCa}
                disabled={daKhoa || conLai.length === 0}
                className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary/10"
              >
                + Thêm tất cả ({conLai.length})
              </button>
            </div>
            <div className="mb-3">
              <SearchInput
                placeholder="Tìm câu hỏi..."
                value={timKiem}
                onChange={(e) => setTimKiem(e.target.value)}
              />
            </div>
            {!maMonHoc ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Hãy chọn môn học
              </p>
            ) : conLai.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Không có câu hỏi phù hợp</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {conLai.map((q) => (
                  <li
                    key={q.maCauHoi}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <span className="line-clamp-1 flex-1 text-sm text-gray-700">
                      <MathText>{q.noiDung}</MathText>
                    </span>
                    <button
                      type="button"
                      onClick={() => themCauHoi(q)}
                      disabled={daKhoa}
                      className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary/10"
                    >
                      + Thêm
                    </button>
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
