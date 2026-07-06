import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import MathText from '@/components/common/MathText';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { examsApi } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [bt, setBt] = useState<BaiThi | null>(null);
  const [tenMon, setTenMon] = useState('');
  const [dangTai, setDangTai] = useState(true);

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      const data = await examsApi.getExamById(+id);
      setBt(data);
      const mh = data.monHocHocKy;
      setTenMon(
        mh
          ? `${mh.monHoc?.tenMonHoc ?? ''} — ${mh.hocKy?.tenHocKy ?? ''} ${mh.hocKy?.namHoc ?? ''}`
          : `#${data.maMonHocHocKy}`,
      );
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

  if (!bt) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy đề thi.{' '}
        <Link to="/exams" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  const cauHois = (bt.cauHoiBaiThis ?? []).slice().sort((a, b) => a.thuTu - b.thuTu);

  return (
    <div>
      <PageHeader
        tieuDe={bt.tieuDe}
        hanhDong={
          <>
            <Button variant="secondary" type="button" onClick={() => navigate('/exams')}>
              ← Quay lại
            </Button>
            {laGiaoVien && (
              <Button type="button" onClick={() => navigate(`/exams/${bt.maBaiThi}/edit`)}>
                ✏️ Sửa
              </Button>
            )}
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4 text-sm">
        <div>
          <span className="text-gray-500">Môn học: </span>
          <span className="font-medium">{tenMon}</span>
        </div>
        <div>
          <span className="text-gray-500">Thời gian: </span>
          <span className="font-medium">{bt.thoiGianLamBai} phút</span>
        </div>
        <div>
          <span className="text-gray-500">Số câu: </span>
          <span className="font-medium">{cauHois.length}</span>
        </div>
        <div>
          <span className="text-gray-500">Trạng thái: </span>
          {bt.trangThai === TrangThaiBaiThi.CONG_KHAI ? (
            <StatusBadge mau="green">{NHAN_TRANG_THAI_BAI_THI.cong_khai}</StatusBadge>
          ) : (
            <StatusBadge mau="gray">{NHAN_TRANG_THAI_BAI_THI.nhap}</StatusBadge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {cauHois.map((c, i) => (
          <div key={c.maCauHoiBaiThi} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <p className="flex-1 font-medium text-gray-900">
                <MathText>{c.cauHoi?.noiDung ?? `Câu #${c.maCauHoi}`}</MathText>
              </p>
            </div>
            {c.cauHoi?.luaChons && (
              <ul className="ml-9 space-y-1 text-sm text-gray-600">
                {c.cauHoi.luaChons.map((lc, j) => (
                  <li key={lc.maLuaChon}>
                    {String.fromCharCode(65 + j)}. <MathText>{lc.noiDung}</MathText>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
