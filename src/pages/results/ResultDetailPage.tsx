import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { resultsApi } from '@/api/results.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { formatScore } from '@/utils/formatScore';
import type { KetQuaChiTiet, LuaChonKetQua } from '@/types/ket-qua.type';

// Màu nền cho lựa chọn theo trạng thái đúng/sai/đã chọn.
function lopLuaChon(lc: LuaChonKetQua): string {
  if (lc.laDapAnDung) return 'border-green-300 bg-green-50';
  if (lc.daChon) return 'border-red-300 bg-red-50';
  return 'border-gray-200';
}

// Màu ô số ở lưới câu hỏi: xanh nếu đúng, đỏ nếu sai.
function oLuoiClass(dung: boolean, dangChon: boolean): string {
  const base =
    'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition';
  const mau = dung
    ? 'border-green-300 bg-green-100 text-green-700'
    : 'border-red-300 bg-red-100 text-red-700';
  const nhanManh = dangChon ? 'ring-2 ring-primary ring-offset-1' : '';
  return `${base} ${mau} ${nhanManh}`;
}

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [kq, setKq] = useState<KetQuaChiTiet | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [chiSo, setChiSo] = useState(0);

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      const dl = await resultsApi.getResultById(+id);
      setKq(dl);
      setChiSo(0);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [id, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!kq) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy kết quả.{' '}
        <Link to="/results/me" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  const tongCau = kq.cauHois.length;
  const cauHienTai = kq.cauHois[Math.min(chiSo, tongCau - 1)];
  const daTraLoi = cauHienTai?.luaChons.some((lc) => lc.daChon);

  return (
    <div>
      <PageHeader
        tieuDe="Chi tiết kết quả"
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        {/* Cột trái: tổng quan điểm + lưới câu hỏi */}
        <div className="self-start lg:sticky lg:top-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {/* Tổng quan điểm */}
            <div className="mb-4 flex items-center justify-around gap-3 rounded-lg bg-gray-50 py-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Điểm số</p>
                <p className="text-2xl font-bold text-primary">{formatScore(kq.diemSo)}/10</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Số câu đúng</p>
                <p className="text-xl font-semibold text-gray-800">
                  {kq.soCauDung}/{kq.tongSoCau}
                </p>
              </div>
            </div>

            {/* Lưới câu hỏi */}
            <div className="grid grid-cols-5 gap-2">
              {kq.cauHois.map((c, i) => (
                <button
                  key={c.maCauHoi}
                  type="button"
                  onClick={() => setChiSo(i)}
                  className={oLuoiClass(c.dung, i === chiSo)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Chú thích màu */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-green-300 bg-green-100" />
                Đúng
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-red-300 bg-red-100" />
                Sai
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: nội dung câu đang chọn */}
        {cauHienTai && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                Câu {chiSo + 1}/{tongCau}
              </h3>
              {cauHienTai.dung ? (
                <StatusBadge mau="green">✔ Đúng</StatusBadge>
              ) : (
                <StatusBadge mau="red">✘ Sai</StatusBadge>
              )}
            </div>

            <p className="font-medium text-gray-900">
              <MathText>{cauHienTai.noiDung}</MathText>
            </p>

            {cauHienTai.hinhAnh && (
              <img
                src={cauHienTai.hinhAnh}
                alt="Hình minh họa"
                className="mt-3 max-h-64 rounded-lg border border-gray-200 object-contain"
              />
            )}

            {!daTraLoi && (
              <p className="mt-3 text-sm italic text-amber-600">Bạn không trả lời câu này.</p>
            )}

            <ul className="mt-4 space-y-2">
              {cauHienTai.luaChons.map((lc, j) => (
                <li
                  key={lc.maLuaChon}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${lopLuaChon(lc)}`}
                >
                  <span className="font-medium text-gray-500">{String.fromCharCode(65 + j)}.</span>
                  <span className="flex-1 text-gray-800">
                    <MathText>{lc.noiDung}</MathText>
                  </span>
                  {lc.daChon && <span className="text-xs text-gray-500">Đã chọn</span>}
                  {lc.laDapAnDung && (
                    <span className="text-xs font-medium text-green-600">Đáp án đúng</span>
                  )}
                </li>
              ))}
            </ul>

            {/* Điều hướng câu trước/sau */}
            <div className="mt-5 flex justify-between border-t border-gray-100 pt-4">
              <Button
                variant="secondary"
                type="button"
                disabled={chiSo === 0}
                onClick={() => setChiSo((n) => Math.max(0, n - 1))}
              >
                ← Câu trước
              </Button>
              <Button
                variant="secondary"
                type="button"
                disabled={chiSo >= tongCau - 1}
                onClick={() => setChiSo((n) => Math.min(tongCau - 1, n + 1))}
              >
                Câu sau →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
