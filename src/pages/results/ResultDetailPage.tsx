import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
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

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [kq, setKq] = useState<KetQuaChiTiet | null>(null);
  const [dangTai, setDangTai] = useState(true);

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      setKq(await resultsApi.getResultById(+id));
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

      {/* Tổng quan điểm */}
      <div className="mb-5 flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-center">
          <p className="text-xs text-gray-500">Điểm số</p>
          <p className="text-3xl font-bold text-primary">{formatScore(kq.diemSo)}/10</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Số câu đúng</p>
          <p className="text-2xl font-semibold text-gray-800">
            {kq.soCauDung}/{kq.tongSoCau}
          </p>
        </div>
      </div>

      {/* Từng câu hỏi */}
      <div className="space-y-3">
        {kq.cauHois.map((c, i) => (
          <div key={c.maCauHoi} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                {i + 1}
              </span>
              <p className="flex-1 font-medium text-gray-900">{c.noiDung}</p>
              {c.dung ? (
                <StatusBadge mau="green">✔ Đúng</StatusBadge>
              ) : (
                <StatusBadge mau="red">✘ Sai</StatusBadge>
              )}
            </div>
            {c.hinhAnh && (
              <img
                src={c.hinhAnh}
                alt="Hình minh họa"
                className="mb-3 ml-9 max-h-48 rounded-lg border border-gray-200 object-contain"
              />
            )}
            <ul className="ml-9 space-y-1.5">
              {c.luaChons.map((lc, j) => (
                <li
                  key={lc.maLuaChon}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${lopLuaChon(lc)}`}
                >
                  <span className="font-medium text-gray-500">{String.fromCharCode(65 + j)}.</span>
                  <span className="flex-1 text-gray-800">{lc.noiDung}</span>
                  {lc.daChon && <span className="text-xs text-gray-500">Đã chọn</span>}
                  {lc.laDapAnDung && <span className="text-xs font-medium text-green-600">Đáp án đúng</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
