import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { questionsApi } from '@/api/questions.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { DoKho, NHAN_DO_KHO } from '@/enums/doKho';
import { LoaiCauHoi, NHAN_LOAI_CAU_HOI } from '@/enums/loaiCauHoi';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { CauHoiNhap } from '@/types/cau-hoi.type';

// Dạng cục bộ có `key` để React render danh sách động ổn định khi chỉnh sửa.
interface LuaChonItem {
  key: string;
  noiDung: string;
  laDapAnDung: boolean;
}
interface CauHoiItem {
  key: string;
  noiDung: string;
  doKho: DoKho;
  loaiCauHoi: LoaiCauHoi;
  luaChons: LuaChonItem[];
}

function tuNhap(ch: CauHoiNhap): CauHoiItem {
  return {
    key: crypto.randomUUID(),
    noiDung: ch.noiDung,
    doKho: ch.doKho,
    loaiCauHoi: ch.loaiCauHoi,
    luaChons: ch.luaChons.map((lc) => ({
      key: crypto.randomUUID(),
      noiDung: lc.noiDung,
      laDapAnDung: lc.laDapAnDung,
    })),
  };
}

export default function QuestionImportPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [maMonHoc, setMaMonHoc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dangPhanTich, setDangPhanTich] = useState(false);

  const [cauHois, setCauHois] = useState<CauHoiItem[]>([]);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    subjectsApi
      .getSubjects({ page: 1, limit: 1000 })
      .then((d) => setMonHocs(d.items))
      .catch((err) => toast.error(chuanHoaLoi(err).message));
  }, [toast]);

  const phanTich = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Word (.docx) hoặc PDF');
      return;
    }
    setDangPhanTich(true);
    try {
      const { cauHois: ds } = await questionsApi.importQuestions(file);
      setCauHois(ds.map(tuNhap));
      toast.success(`Đã trích xuất ${ds.length} câu hỏi. Kiểm tra & chỉnh sửa trước khi lưu.`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangPhanTich(false);
    }
  };

  // ----- Chỉnh sửa trên danh sách nháp -----
  const capNhatCau = (key: string, thayDoi: Partial<CauHoiItem>) =>
    setCauHois((ds) => ds.map((c) => (c.key === key ? { ...c, ...thayDoi } : c)));

  const xoaCau = (key: string) =>
    setCauHois((ds) => ds.filter((c) => c.key !== key));

  const doiLoai = (key: string, loai: LoaiCauHoi) =>
    setCauHois((ds) =>
      ds.map((c) => {
        if (c.key !== key) return c;
        // Chuyển sang "một đáp án": chỉ giữ đáp án đúng đầu tiên.
        if (loai === LoaiCauHoi.MOT_DAP_AN) {
          let daGiu = false;
          const luaChons = c.luaChons.map((lc) => {
            if (lc.laDapAnDung && !daGiu) {
              daGiu = true;
              return lc;
            }
            return { ...lc, laDapAnDung: false };
          });
          return { ...c, loaiCauHoi: loai, luaChons };
        }
        return { ...c, loaiCauHoi: loai };
      }),
    );

  const doiNoiDungLuaChon = (cauKey: string, lcKey: string, value: string) =>
    setCauHois((ds) =>
      ds.map((c) =>
        c.key !== cauKey
          ? c
          : {
              ...c,
              luaChons: c.luaChons.map((lc) =>
                lc.key === lcKey ? { ...lc, noiDung: value } : lc,
              ),
            },
      ),
    );

  const doiDapAnDung = (cauKey: string, lcKey: string) =>
    setCauHois((ds) =>
      ds.map((c) => {
        if (c.key !== cauKey) return c;
        const motDapAn = c.loaiCauHoi === LoaiCauHoi.MOT_DAP_AN;
        return {
          ...c,
          luaChons: c.luaChons.map((lc) => {
            if (motDapAn) return { ...lc, laDapAnDung: lc.key === lcKey };
            return lc.key === lcKey ? { ...lc, laDapAnDung: !lc.laDapAnDung } : lc;
          }),
        };
      }),
    );

  const themLuaChon = (cauKey: string) =>
    setCauHois((ds) =>
      ds.map((c) =>
        c.key !== cauKey
          ? c
          : {
              ...c,
              luaChons: [
                ...c.luaChons,
                { key: crypto.randomUUID(), noiDung: '', laDapAnDung: false },
              ],
            },
      ),
    );

  const xoaLuaChon = (cauKey: string, lcKey: string) =>
    setCauHois((ds) =>
      ds.map((c) =>
        c.key !== cauKey || c.luaChons.length <= 2
          ? c
          : { ...c, luaChons: c.luaChons.filter((lc) => lc.key !== lcKey) },
      ),
    );

  // Trả về thông báo lỗi của câu thứ i (1-based) đầu tiên không hợp lệ.
  const kiemTra = (): string | null => {
    if (!maMonHoc) return 'Vui lòng chọn môn học để lưu';
    if (cauHois.length === 0) return 'Không có câu hỏi nào để lưu';
    for (let i = 0; i < cauHois.length; i++) {
      const c = cauHois[i];
      const stt = i + 1;
      if (!c.noiDung.trim()) return `Câu ${stt}: chưa có nội dung`;
      if (c.luaChons.length < 2) return `Câu ${stt}: cần ít nhất 2 lựa chọn`;
      if (c.luaChons.some((lc) => !lc.noiDung.trim()))
        return `Câu ${stt}: tất cả lựa chọn phải có nội dung`;
      const soDung = c.luaChons.filter((lc) => lc.laDapAnDung).length;
      if (c.loaiCauHoi === LoaiCauHoi.MOT_DAP_AN && soDung !== 1)
        return `Câu ${stt}: câu một đáp án phải có đúng 1 đáp án đúng`;
      if (c.loaiCauHoi === LoaiCauHoi.NHIEU_DAP_AN && soDung < 2)
        return `Câu ${stt}: câu nhiều đáp án phải có ít nhất 2 đáp án đúng`;
    }
    return null;
  };

  const luuTatCa = async () => {
    const loi = kiemTra();
    if (loi) {
      toast.error(loi);
      return;
    }
    setDangLuu(true);
    try {
      const payload = {
        cauHois: cauHois.map((c) => ({
          noiDung: c.noiDung.trim(),
          maMonHoc: Number(maMonHoc),
          doKho: c.doKho,
          loaiCauHoi: c.loaiCauHoi,
          luaChons: c.luaChons.map((lc) => ({
            noiDung: lc.noiDung.trim(),
            laDapAnDung: lc.laDapAnDung,
          })),
        })),
      };
      const { soLuong } = await questionsApi.createQuestionsBulk(payload);
      toast.success(`Đã lưu ${soLuong} câu hỏi`);
      navigate('/questions');
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangLuu(false);
    }
  };

  // ===== Bước 1: tải file =====
  if (cauHois.length === 0) {
    return (
      <div>
        <PageHeader
          tieuDe="Import câu hỏi từ file"
          moTa="Tải lên file Word (.docx) hoặc PDF chứa câu hỏi trắc nghiệm — AI sẽ trích xuất để bạn xem trước & chỉnh sửa."
          hanhDong={
            <Button variant="secondary" type="button" onClick={() => navigate('/questions')}>
              ← Quay lại
            </Button>
          }
        />

        <div className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <Select
            label="Môn học * (áp dụng cho tất cả câu hỏi import)"
            placeholder="-- Chọn môn --"
            value={maMonHoc}
            onChange={(e) => setMaMonHoc(e.target.value)}
            options={monHocs
              .filter((m) => m.laHoatDong)
              .map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              File câu hỏi (.docx, .pdf) *
            </label>
            <input
              type="file"
              accept=".doc,.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-gray-400">
              Hệ thống chỉ trích xuất các câu hỏi đã có sẵn trong file, không tự tạo câu hỏi mới.
              Kết quả sẽ hiển thị để bạn kiểm tra trước khi lưu.
            </p>
          </div>

          {dangPhanTich ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Spinner />
              <span>Đang phân tích file bằng AI, vui lòng đợi…</span>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button type="button" onClick={phanTich} disabled={!file}>
                Phân tích file
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Bước 2: xem trước & chỉnh sửa =====
  return (
    <div>
      <PageHeader
        tieuDe={`Xem trước ${cauHois.length} câu hỏi`}
        moTa="Chỉnh sửa nếu cần rồi bấm Lưu tất cả. Dữ liệu chỉ được ghi vào hệ thống sau khi bạn xác nhận."
        hanhDong={
          <Button
            variant="secondary"
            type="button"
            onClick={() => setCauHois([])}
            disabled={dangLuu}
          >
            ← Chọn file khác
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="min-w-[16rem] flex-1">
          <Select
            label="Môn học * (áp dụng cho tất cả)"
            placeholder="-- Chọn môn --"
            value={maMonHoc}
            onChange={(e) => setMaMonHoc(e.target.value)}
            options={monHocs
              .filter((m) => m.laHoatDong)
              .map((m) => ({ value: m.maMonHoc, label: m.tenMonHoc }))}
          />
        </div>
        <Button type="button" dangTai={dangLuu} onClick={luuTatCa}>
          Lưu tất cả ({cauHois.length})
        </Button>
      </div>

      <div className="space-y-4">
        {cauHois.map((c, i) => {
          const motDapAn = c.loaiCauHoi === LoaiCauHoi.MOT_DAP_AN;
          return (
            <div key={c.key} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="mt-2 shrink-0 text-sm font-semibold text-gray-400">
                  Câu {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => xoaCau(c.key)}
                  className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                  title="Xóa câu hỏi này"
                >
                  🗑️ Xóa câu
                </button>
              </div>

              <textarea
                rows={2}
                className="input-base resize-none"
                value={c.noiDung}
                onChange={(e) => capNhatCau(c.key, { noiDung: e.target.value })}
                placeholder="Nội dung câu hỏi..."
              />
              {c.noiDung.includes('$') && (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
                  <span className="mr-2 text-xs text-gray-400">Xem trước:</span>
                  <MathText className="text-gray-900">{c.noiDung}</MathText>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Độ khó"
                  value={c.doKho}
                  onChange={(e) => capNhatCau(c.key, { doKho: e.target.value as DoKho })}
                  options={Object.values(DoKho).map((v) => ({ value: v, label: NHAN_DO_KHO[v] }))}
                />
                <Select
                  label="Loại câu hỏi"
                  value={c.loaiCauHoi}
                  onChange={(e) => doiLoai(c.key, e.target.value as LoaiCauHoi)}
                  options={Object.values(LoaiCauHoi).map((v) => ({
                    value: v,
                    label: NHAN_LOAI_CAU_HOI[v],
                  }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Lựa chọn ({motDapAn ? 'chọn 1 đáp án đúng' : 'chọn ≥ 2 đáp án đúng'})
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-3 !py-1.5"
                    onClick={() => themLuaChon(c.key)}
                  >
                    + Thêm lựa chọn
                  </Button>
                </div>

                {c.luaChons.map((lc, j) => (
                  <div key={lc.key} className="flex items-center gap-3">
                    <input
                      type={motDapAn ? 'radio' : 'checkbox'}
                      name={`dapAn-${c.key}`}
                      checked={lc.laDapAnDung}
                      onChange={() => doiDapAnDung(c.key, lc.key)}
                      className="h-5 w-5 shrink-0 accent-primary"
                      title="Đáp án đúng"
                    />
                    <Input
                      className="flex-1"
                      value={lc.noiDung}
                      onChange={(e) => doiNoiDungLuaChon(c.key, lc.key, e.target.value)}
                      placeholder={`Lựa chọn ${j + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => xoaLuaChon(c.key, lc.key)}
                      disabled={c.luaChons.length <= 2}
                      className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      title="Xóa lựa chọn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={() => navigate('/questions')} disabled={dangLuu}>
          Hủy
        </Button>
        <Button type="button" dangTai={dangLuu} onClick={luuTatCa}>
          Lưu tất cả ({cauHois.length})
        </Button>
      </div>
    </div>
  );
}
