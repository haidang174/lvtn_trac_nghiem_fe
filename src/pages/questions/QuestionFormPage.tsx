import { useEffect, useState, useCallback, useRef, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import MathSymbolPicker from '@/components/common/MathSymbolPicker';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { questionsApi, type LuaChonInput } from '@/api/questions.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { DoKho, NHAN_DO_KHO } from '@/enums/doKho';
import { LoaiCauHoi, NHAN_LOAI_CAU_HOI } from '@/enums/loaiCauHoi';
import type { MonHoc } from '@/types/mon-hoc.type';

interface LuaChonForm extends LuaChonInput {
  // Khóa cục bộ để React render danh sách động ổn định.
  key: string;
}

function luaChonRong(): LuaChonForm {
  return { key: crypto.randomUUID(), noiDung: '', laDapAnDung: false };
}

// Ô đang nhận ký hiệu: nội dung câu hỏi hoặc một lựa chọn cụ thể (theo key).
type MucTieuChen = { loai: 'noiDung' } | { loai: 'luaChon'; key: string };

// Chèn LaTeX (bọc trong $...$) vào vị trí con trỏ của một ô input/textarea.
// Ký tự `|` trong `chen` (nếu có) đánh dấu nơi đặt con trỏ sau khi chèn.
function chenVaoTruong(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  giaTri: string,
  setGiaTri: (v: string) => void,
  chen: string,
) {
  const goc = `$${chen}$`;
  const viTriConTro = goc.indexOf('|');
  const doan = goc.replace('|', '');

  const start = el?.selectionStart ?? giaTri.length;
  const end = el?.selectionEnd ?? giaTri.length;
  setGiaTri(giaTri.slice(0, start) + doan + giaTri.slice(end));

  const pos = viTriConTro >= 0 ? start + viTriConTro : start + doan.length;
  requestAnimationFrame(() => {
    el?.focus();
    el?.setSelectionRange(pos, pos);
  });
}

export default function QuestionFormPage() {
  const { id } = useParams<{ id: string }>();
  const laSua = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [noiDung, setNoiDung] = useState('');
  const noiDungRef = useRef<HTMLTextAreaElement>(null);
  // Ô input của từng lựa chọn, để chèn ký hiệu đúng vị trí con trỏ.
  const luaChonRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // Ô vừa được focus -> bảng ký hiệu sẽ chèn vào đây.
  const mucTieuRef = useRef<MucTieuChen>({ loai: 'noiDung' });
  const [hienBangKyHieu, setHienBangKyHieu] = useState(false);
  const [maMonHoc, setMaMonHoc] = useState('');
  const [doKho, setDoKho] = useState<DoKho>(DoKho.DE);
  const [loaiCauHoi, setLoaiCauHoi] = useState<LoaiCauHoi>(LoaiCauHoi.MOT_DAP_AN);
  const [luaChons, setLuaChons] = useState<LuaChonForm[]>([luaChonRong(), luaChonRong()]);

  const [file, setFile] = useState<File | null>(null);
  const [anhHienTai, setAnhHienTai] = useState<string | null>(null);
  const [xemTruoc, setXemTruoc] = useState<string | null>(null);

  // Chế độ sửa: BE không trả cờ đáp án đúng -> phải chọn lại.
  const [canChonLaiDapAn, setCanChonLaiDapAn] = useState(false);
  const [dangTai, setDangTai] = useState(laSua);
  const [dangLuu, setDangLuu] = useState(false);

  // Nạp danh sách môn học cho dropdown.
  useEffect(() => {
    subjectsApi
      .getSubjects({ page: 1, limit: 1000 })
      .then((d) => setMonHocs(d.items))
      .catch((err) => toast.error(chuanHoaLoi(err).message));
  }, [toast]);

  const taiCauHoi = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      const ch = await questionsApi.getQuestionById(+id);
      setNoiDung(ch.noiDung);
      setMaMonHoc(String(ch.maMonHoc));
      setDoKho(ch.doKho);
      setLoaiCauHoi(ch.loaiCauHoi);
      setAnhHienTai(ch.hinhAnh ?? null);
      setLuaChons(
        ch.luaChons.map((lc) => ({
          key: crypto.randomUUID(),
          noiDung: lc.noiDung,
          laDapAnDung: !!lc.laDapAnDung,
        })),
      );
      // Nếu không có cờ đáp án đúng nào -> cảnh báo chọn lại.
      setCanChonLaiDapAn(!ch.luaChons.some((lc) => lc.laDapAnDung));
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
      navigate('/questions');
    } finally {
      setDangTai(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (laSua) taiCauHoi();
  }, [laSua, taiCauHoi]);

  const doiNoiDungLuaChon = (key: string, value: string) =>
    setLuaChons((ds) => ds.map((lc) => (lc.key === key ? { ...lc, noiDung: value } : lc)));

  const doiDapAnDung = (key: string) =>
    setLuaChons((ds) =>
      ds.map((lc) => {
        if (loaiCauHoi === LoaiCauHoi.MOT_DAP_AN) {
          // Một đáp án: chọn 1 cái, bỏ các cái khác.
          return { ...lc, laDapAnDung: lc.key === key };
        }
        // Nhiều đáp án: toggle.
        return lc.key === key ? { ...lc, laDapAnDung: !lc.laDapAnDung } : lc;
      }),
    );

  const themLuaChon = () => setLuaChons((ds) => [...ds, luaChonRong()]);
  const xoaLuaChon = (key: string) =>
    setLuaChons((ds) => (ds.length <= 2 ? ds : ds.filter((lc) => lc.key !== key)));

  const chonFile = (f: File | null) => {
    setFile(f);
    setXemTruoc(f ? URL.createObjectURL(f) : null);
  };

  // Chèn LaTeX vào ô vừa được focus (nội dung câu hỏi hoặc một lựa chọn).
  const chenLatex = (chen: string) => {
    const mt = mucTieuRef.current;
    if (mt.loai === 'noiDung') {
      chenVaoTruong(noiDungRef.current, noiDung, setNoiDung, chen);
      return;
    }
    const lc = luaChons.find((l) => l.key === mt.key);
    if (!lc) return;
    chenVaoTruong(
      luaChonRefs.current[mt.key],
      lc.noiDung,
      (v) => doiNoiDungLuaChon(mt.key, v),
      chen,
    );
  };

  const kiemTra = (): string | null => {
    if (!noiDung.trim()) return 'Vui lòng nhập nội dung câu hỏi';
    if (!maMonHoc) return 'Vui lòng chọn môn học';
    if (luaChons.length < 2) return 'Cần ít nhất 2 lựa chọn';
    if (luaChons.some((lc) => !lc.noiDung.trim())) return 'Tất cả lựa chọn phải có nội dung';
    const soDung = luaChons.filter((lc) => lc.laDapAnDung).length;
    if (loaiCauHoi === LoaiCauHoi.MOT_DAP_AN && soDung !== 1)
      return 'Câu hỏi một đáp án phải có đúng 1 đáp án đúng';
    if (loaiCauHoi === LoaiCauHoi.NHIEU_DAP_AN && soDung < 2)
      return 'Câu hỏi nhiều đáp án phải có ít nhất 2 đáp án đúng';
    return null;
  };

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    const loi = kiemTra();
    if (loi) {
      toast.error(loi);
      return;
    }
    setDangLuu(true);
    try {
      const payload = {
        noiDung: noiDung.trim(),
        maMonHoc: Number(maMonHoc),
        doKho,
        loaiCauHoi,
        luaChons: luaChons.map(({ noiDung, laDapAnDung }) => ({ noiDung: noiDung.trim(), laDapAnDung })),
      };

      const ch = laSua
        ? await questionsApi.updateQuestion(+id!, payload)
        : await questionsApi.createQuestion(payload);

      // Upload ảnh (nếu có chọn) sau khi đã có mã câu hỏi.
      if (file) {
        await questionsApi.uploadQuestionImage(ch.maCauHoi, file);
      }

      toast.success(laSua ? 'Cập nhật câu hỏi thành công' : 'Tạo câu hỏi thành công');
      navigate('/questions');
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

  const motDapAn = loaiCauHoi === LoaiCauHoi.MOT_DAP_AN;

  return (
    <div>
      <PageHeader
        tieuDe={laSua ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/questions')}>
            ← Quay lại
          </Button>
        }
      />

      <form onSubmit={xuLyLuu} className="max-w space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="noiDung" className="block text-sm font-medium text-gray-700">
              Nội dung câu hỏi *
            </label>
            <Button
              type="button"
              variant="outline"
              className="!px-3 !py-1.5 text-sm"
              onClick={() => setHienBangKyHieu((v) => !v)}
            >
              {hienBangKyHieu ? 'Đóng ký hiệu' : 'Ký hiệu Toán/Lý/Hóa'}
            </Button>
          </div>

          {hienBangKyHieu && <MathSymbolPicker onChon={chenLatex} />}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <textarea
              id="noiDung"
              ref={noiDungRef}
              rows={5}
              className="input-base resize-none font-mono"
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              onFocus={() => (mucTieuRef.current = { loai: 'noiDung' })}
              placeholder="Nhập nội dung câu hỏi..."
            />
            {/* Ô xem trước: render LaTeX của nội dung câu hỏi. */}
            <div className="min-h-[7.5rem] overflow-auto rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
              <p className="mb-1 text-xs font-medium text-gray-400">Xem trước</p>
              {noiDung.trim() ? (
                <MathText className="whitespace-pre-wrap text-gray-900">{noiDung}</MathText>
              ) : (
                <p className="text-sm text-gray-400">Nội dung hiển thị sẽ xuất hiện ở đây…</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Môn học *"
            placeholder="-- Chọn môn --"
            value={maMonHoc}
            onChange={(e) => setMaMonHoc(e.target.value)}
            options={monHocs
              .filter((m) => m.laHoatDong || String(m.maMonHoc) === String(maMonHoc))
              .map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
          />
          <Select
            label="Độ khó"
            value={doKho}
            onChange={(e) => setDoKho(e.target.value as DoKho)}
            options={Object.values(DoKho).map((v) => ({ value: v, label: NHAN_DO_KHO[v] }))}
          />
          <Select
            label="Loại câu hỏi"
            value={loaiCauHoi}
            onChange={(e) => setLoaiCauHoi(e.target.value as LoaiCauHoi)}
            options={Object.values(LoaiCauHoi).map((v) => ({
              value: v,
              label: NHAN_LOAI_CAU_HOI[v],
            }))}
          />
        </div>

        {/* Ảnh minh họa */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ảnh minh họa (tùy chọn)</label>
          {(xemTruoc || anhHienTai) && (
            <img
              src={xemTruoc ?? anhHienTai ?? ''}
              alt="Xem trước"
              className="max-h-48 rounded-lg border border-gray-200 object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => chonFile(e.target.files?.[0] ?? null)}
            className="block text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {/* Lựa chọn + đáp án đúng */}
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">
              Lựa chọn ({motDapAn ? 'chọn 1 đáp án đúng' : 'chọn ≥ 2 đáp án đúng'})
            </h3>
            <Button type="button" variant="outline" className="!px-3 !py-1.5" onClick={themLuaChon}>
              + Thêm lựa chọn
            </Button>
          </div>

          {canChonLaiDapAn && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              ⚠️ Hệ thống chưa trả về đáp án đúng cũ — vui lòng chọn lại đáp án đúng trước khi lưu.
            </p>
          )}

          {luaChons.map((lc, i) => (
            <div key={lc.key} className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type={motDapAn ? 'radio' : 'checkbox'}
                  name="dapAnDung"
                  checked={lc.laDapAnDung}
                  onChange={() => doiDapAnDung(lc.key)}
                  className="h-5 w-5 shrink-0 accent-primary"
                  title="Đáp án đúng"
                />
                <Input
                  ref={(el) => {
                    luaChonRefs.current[lc.key] = el;
                  }}
                  name={`luaChon-${i}`}
                  className="flex-1"
                  value={lc.noiDung}
                  onChange={(e) => doiNoiDungLuaChon(lc.key, e.target.value)}
                  onFocus={() => (mucTieuRef.current = { loai: 'luaChon', key: lc.key })}
                  placeholder={`Lựa chọn ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => xoaLuaChon(lc.key)}
                  disabled={luaChons.length <= 2}
                  className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                  title="Xóa lựa chọn"
                >
                  🗑️
                </button>
              </div>
              {/* Xem trước chỉ hiện khi lựa chọn có chứa công thức LaTeX. */}
              {lc.noiDung.includes('$') && (
                <div className="ml-8 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
                  <span className="mr-2 text-xs text-gray-400">Xem trước:</span>
                  <MathText className="text-gray-900">{lc.noiDung}</MathText>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/questions')}>
            Hủy
          </Button>
          <Button type="submit" dangTai={dangLuu}>
            {laSua ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
