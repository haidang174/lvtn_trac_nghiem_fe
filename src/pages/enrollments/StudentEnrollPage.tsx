import { useEffect, useState, useCallback } from 'react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { enrollmentsApi, type MonKhaDung } from '@/api/enrollments.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';

export default function StudentEnrollPage() {
  const toast = useToast();

  const [mons, setMons] = useState<MonKhaDung[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState<number | null>(null);
  const [tuKhoa, setTuKhoa] = useState('');

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const data = await enrollmentsApi.getAvailable();
      setMons(data);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const dangKy = async (m: MonKhaDung) => {
    setDangXuLy(m.maMonHocHocKy);
    try {
      await enrollmentsApi.register(m.maMonHocHocKy);
      toast.success('Đăng ký môn học thành công');
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuLy(null);
    }
  };

  const huyDangKy = async (m: MonKhaDung) => {
    setDangXuLy(m.maMonHocHocKy);
    try {
      await enrollmentsApi.unregister(m.maMonHocHocKy);
      toast.success('Đã hủy đăng ký môn học');
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuLy(null);
    }
  };

  const q = tuKhoa.trim().toLowerCase();
  const danhSach = q
    ? mons.filter((m) =>
        (m.monHoc?.tenMonHoc ?? '').toLowerCase().includes(q),
      )
    : mons;

  return (
    <div>
      <PageHeader
        tieuDe="Đăng ký môn học"
        moTa="Đăng ký các môn đang mở trong học kỳ hiện tại"
        hanhDong={
          <Button variant="ghost" type="button" onClick={taiDuLieu}>
            🔄 Làm mới
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Tìm môn học..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
      </div>

      {dangTai ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : danhSach.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Không có môn học nào đang mở đăng ký.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {danhSach.map((m) => (
            <div
              key={m.maMonHocHocKy}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800">
                  {m.monHoc?.tenMonHoc ?? `Môn #${m.maMonHoc}`}
                </h3>
                {m.daDangKy && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Đã đăng ký
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-gray-500">
                {m.hocKy ? `${m.hocKy.tenHocKy} — ${m.hocKy.namHoc}` : ''}
              </p>
              {m.daDangKy ? (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  className="mt-auto"
                  dangTai={dangXuLy === m.maMonHocHocKy}
                  onClick={() => huyDangKy(m)}
                >
                  Hủy đăng ký
                </Button>
              ) : (
                <Button
                  type="button"
                  fullWidth
                  className="mt-auto"
                  dangTai={dangXuLy === m.maMonHocHocKy}
                  onClick={() => dangKy(m)}
                >
                  Đăng ký
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
