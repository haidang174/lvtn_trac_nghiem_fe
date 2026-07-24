import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { questionsApi } from '@/api/questions.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { DoKho, NHAN_DO_KHO } from '@/enums/doKho';
import { NHAN_LOAI_CAU_HOI } from '@/enums/loaiCauHoi';
import type { CauHoi } from '@/types/cau-hoi.type';

const mauDoKho: Record<DoKho, MauBadge> = { de: 'green', trung_binh: 'amber', kho: 'red' };

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [ch, setCh] = useState<CauHoi | null>(null);
  const [tenMon, setTenMon] = useState<string>('');
  const [dangTai, setDangTai] = useState(true);

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      const data = await questionsApi.getQuestionById(+id);
      setCh(data);
      try {
        const mh = await subjectsApi.getSubjectById(data.maMonHoc);
        setTenMon(mh.tenMonHoc);
      } catch {
        setTenMon(`#${data.maMonHoc}`);
      }
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

  if (!ch) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy câu hỏi.{' '}
        <Link to="/questions" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  // BE chưa trả cờ đáp án đúng → nếu mọi lựa chọn đều không có cờ thì ẩn phần đánh dấu.
  const coDanhDauDapAn = ch.luaChons.some((lc) => lc.laDapAnDung);

  return (
    <div>
      <PageHeader
        tieuDe="Chi tiết câu hỏi"
        hanhDong={
          <>
            <Button variant="secondary" type="button" onClick={() => navigate('/questions')}>
              ← Quay lại
            </Button>
            {laGiaoVien && (
              <Button type="button" onClick={() => navigate(`/questions/${ch.maCauHoi}/edit`)}>
                Sửa
              </Button>
            )}
          </>
        }
      />

      <div className="max-w-3xl space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge mau="blue">{tenMon}</StatusBadge>
          <StatusBadge mau={mauDoKho[ch.doKho]}>{NHAN_DO_KHO[ch.doKho]}</StatusBadge>
          <StatusBadge mau="purple">{NHAN_LOAI_CAU_HOI[ch.loaiCauHoi]}</StatusBadge>
        </div>

        {!laGiaoVien && (
          <p className="text-sm text-gray-500">
            Người tạo: <span className="font-medium text-gray-700">{ch.nguoiTao?.tenNguoiDung ?? `#${ch.taoBoi}`}</span>
          </p>
        )}

        <p className="whitespace-pre-wrap text-lg font-medium text-gray-900">
          <MathText>{ch.noiDung}</MathText>
        </p>

        {ch.hinhAnh && (
          <img
            src={ch.hinhAnh}
            alt="Hình minh họa"
            className="max-h-72 rounded-lg border border-gray-200 object-contain"
          />
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Các lựa chọn</h3>
          {!coDanhDauDapAn && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              API chi tiết hiện chưa trả về đáp án đúng nên không thể đánh dấu ở đây.
            </p>
          )}
          <ul className="space-y-2">
            {ch.luaChons.map((lc, i) => (
              <li
                key={lc.maLuaChon}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  lc.laDapAnDung ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-gray-800">
                  <MathText>{lc.noiDung}</MathText>
                </span>
                {lc.laDapAnDung && <span className="text-green-600">✔ Đúng</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
