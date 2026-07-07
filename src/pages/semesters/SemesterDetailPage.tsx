import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { semestersApi } from '@/api/semesters.api';
import { subjectsApi } from '@/api/subjects.api';
import { subjectOfferingsApi } from '@/api/subjectOfferings.api';
import { teachingAssignmentsApi } from '@/api/teachingAssignments.api';
import { enrollmentsApi } from '@/api/enrollments.api';
import { usersApi } from '@/api/users.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { VaiTro } from '@/enums/vaiTro';
import type { HocKy } from '@/types/hoc-ky.type';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import type { PhanCongGiangDay } from '@/types/phan-cong.type';
import type { GhiDanh } from '@/types/ghi-danh.type';

export default function SemesterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const maHocKy = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [hocKy, setHocKy] = useState<HocKy | null>(null);
  const [offerings, setOfferings] = useState<MonHocHocKy[]>([]);
  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [giaoViens, setGiaoViens] = useState<NguoiDung[]>([]);
  const [hocSinhs, setHocSinhs] = useState<NguoiDung[]>([]);
  const [dangTai, setDangTai] = useState(true);

  // Môn để mở thêm.
  const [monThem, setMonThem] = useState('');

  // Offering đang chọn để quản lý phân công/ghi danh.
  const [chon, setChon] = useState<MonHocHocKy | null>(null);
  const [phanCongs, setPhanCongs] = useState<PhanCongGiangDay[]>([]);
  const [ghiDanhs, setGhiDanhs] = useState<GhiDanh[]>([]);
  const [gvThem, setGvThem] = useState('');
  const [hsThem, setHsThem] = useState('');

  const taiNen = useCallback(async () => {
    setDangTai(true);
    try {
      const [hk, off, mh, gv, hs] = await Promise.all([
        semestersApi.getSemesterById(maHocKy),
        subjectOfferingsApi.getOfferings({
          page: 1,
          limit: 1000,
          maHocKy,
          laHoatDong: true,
        }),
        subjectsApi.getSubjects({ page: 1, limit: 1000, laHoatDong: true }),
        usersApi.getUsers({ page: 1, limit: 1000, vaiTro: VaiTro.GIAO_VIEN }),
        usersApi.getUsers({ page: 1, limit: 1000, vaiTro: VaiTro.HOC_SINH }),
      ]);
      setHocKy(hk);
      setOfferings(off.items);
      setMonHocs(mh.items);
      setGiaoViens(gv.items);
      setHocSinhs(hs.items);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [maHocKy, toast]);

  useEffect(() => {
    taiNen();
  }, [taiNen]);

  // Nạp phân công + ghi danh của offering đang chọn.
  const taiChiTietOffering = useCallback(
    async (mhhk: MonHocHocKy) => {
      try {
        const [pc, gd] = await Promise.all([
          teachingAssignmentsApi.getAssignments({ maMonHocHocKy: mhhk.maMonHocHocKy }),
          enrollmentsApi.getEnrollments({ maMonHocHocKy: mhhk.maMonHocHocKy }),
        ]);
        setPhanCongs(pc);
        setGhiDanhs(gd);
      } catch (err) {
        toast.error(chuanHoaLoi(err).message);
      }
    },
    [toast],
  );

  const chonOffering = (mhhk: MonHocHocKy) => {
    setChon(mhhk);
    setGvThem('');
    setHsThem('');
    taiChiTietOffering(mhhk);
  };

  const themMon = async () => {
    if (!monThem) return toast.error('Chọn môn học để mở');
    try {
      await subjectOfferingsApi.createOffering({
        maMonHoc: Number(monThem),
        maHocKy,
      });
      toast.success('Đã mở môn cho học kỳ');
      setMonThem('');
      taiNen();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const xoaMon = async (mhhk: MonHocHocKy) => {
    try {
      await subjectOfferingsApi.deleteOffering(mhhk.maMonHocHocKy);
      toast.success('Đã gỡ môn khỏi học kỳ');
      if (chon?.maMonHocHocKy === mhhk.maMonHocHocKy) setChon(null);
      taiNen();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const themGv = async () => {
    if (!chon || !gvThem) return;
    try {
      await teachingAssignmentsApi.createAssignment({
        maMonHocHocKy: chon.maMonHocHocKy,
        maGiaoVien: Number(gvThem),
      });
      setGvThem('');
      taiChiTietOffering(chon);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const xoaGv = async (maPhanCong: number) => {
    if (!chon) return;
    try {
      await teachingAssignmentsApi.deleteAssignment(maPhanCong);
      taiChiTietOffering(chon);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const themHs = async () => {
    if (!chon || !hsThem) return;
    try {
      await enrollmentsApi.createEnrollment({
        maMonHocHocKy: chon.maMonHocHocKy,
        maHocSinh: Number(hsThem),
      });
      setHsThem('');
      taiChiTietOffering(chon);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const xoaHs = async (maGhiDanh: number) => {
    if (!chon) return;
    try {
      await enrollmentsApi.deleteEnrollment(maGhiDanh);
      taiChiTietOffering(chon);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!hocKy) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy học kỳ.{' '}
        <Link to="/semesters" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  // Môn chưa mở trong học kỳ này (để đưa vào select thêm).
  const daMo = new Set(offerings.map((o) => o.maMonHoc));
  const monChuaMo = monHocs.filter((m) => !daMo.has(m.maMonHoc));

  const gvDaPhan = new Set(phanCongs.map((p) => p.maGiaoVien));
  const hsDaGhi = new Set(ghiDanhs.map((g) => g.maHocSinh));

  // Học kỳ đã kết thúc → chỉ xem, không mở/gỡ môn, không phân công/ghi danh.
  const daKetThuc = hocKy.daKetThuc;

  return (
    <div>
      <PageHeader
        tieuDe={`${hocKy.tenHocKy} — ${hocKy.namHoc}`}
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/semesters')}>
            ← Quay lại
          </Button>
        }
      />

      {daKetThuc && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Học kỳ đã kết thúc — chỉ xem lại, không thể mở/gỡ môn học hay thay đổi phân công, ghi danh.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Cột trái: mở môn */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-gray-800">Môn học của học kỳ</h3>

          {!daKetThuc && (
            <div className="mb-3 flex gap-2">
              <Select
                placeholder="-- Chọn môn để mở --"
                value={monThem}
                onChange={(e) => setMonThem(e.target.value)}
                options={monChuaMo.map((m) => ({
                  value: m.maMonHoc,
                  label: m.tenMonHoc,
                }))}
              />
              <Button type="button" onClick={themMon}>
                + Mở môn
              </Button>
            </div>
          )}

          {offerings.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              Chưa mở môn nào cho học kỳ này.
            </p>
          ) : (
            <ul className="space-y-2">
              {offerings.map((o) => (
                <li
                  key={o.maMonHocHocKy}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                    chon?.maMonHocHocKy === o.maMonHocHocKy
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <button
                    className="flex-1 text-left text-sm font-medium text-gray-700"
                    onClick={() => chonOffering(o)}
                  >
                    {o.monHoc?.tenMonHoc ?? `Môn #${o.maMonHoc}`}
                  </button>
                  {!daKetThuc && (
                    <Button
                      variant="ghost"
                      type="button"
                      className="!px-2 !py-1 text-red-600 hover:bg-red-50"
                      onClick={() => xoaMon(o)}
                    >
                      Gỡ
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cột phải: phân công + ghi danh cho offering đang chọn */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {!chon ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Chọn một môn học bên trái để phân công giáo viên & ghi danh học sinh.
            </p>
          ) : (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800">
                {chon.monHoc?.tenMonHoc ?? `Môn #${chon.maMonHoc}`}
              </h3>

              {/* Phân công GV */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Giáo viên phụ trách ({phanCongs.length})
                </h4>
                {!daKetThuc && (
                  <div className="mb-2 flex gap-2">
                    <Select
                      placeholder="-- Chọn giáo viên --"
                      value={gvThem}
                      onChange={(e) => setGvThem(e.target.value)}
                      options={giaoViens
                        .filter((g) => !gvDaPhan.has(g.maNguoiDung))
                        .map((g) => ({
                          value: g.maNguoiDung,
                          label: `${g.tenNguoiDung} (${g.email})`,
                        }))}
                    />
                    <Button type="button" onClick={themGv}>
                      + Thêm
                    </Button>
                  </div>
                )}
                <ul className="space-y-1">
                  {phanCongs.map((p) => (
                    <li
                      key={p.maPhanCong}
                      className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-sm"
                    >
                      <span>{p.giaoVien?.tenNguoiDung ?? `#${p.maGiaoVien}`}</span>
                      {!daKetThuc && (
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => xoaGv(p.maPhanCong)}
                        >
                          Hủy
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ghi danh HS */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Học sinh ghi danh ({ghiDanhs.length})
                </h4>
                {!daKetThuc && (
                  <div className="mb-2 flex gap-2">
                    <Select
                      placeholder="-- Chọn học sinh --"
                      value={hsThem}
                      onChange={(e) => setHsThem(e.target.value)}
                      options={hocSinhs
                        .filter((h) => !hsDaGhi.has(h.maNguoiDung))
                        .map((h) => ({
                          value: h.maNguoiDung,
                          label: `${h.tenNguoiDung} (${h.email})`,
                        }))}
                    />
                    <Button type="button" onClick={themHs}>
                      + Ghi danh
                    </Button>
                  </div>
                )}
                <ul className="max-h-60 space-y-1 overflow-y-auto">
                  {ghiDanhs.map((g) => (
                    <li
                      key={g.maGhiDanh}
                      className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-sm"
                    >
                      <span>{g.hocSinh?.tenNguoiDung ?? `#${g.maHocSinh}`}</span>
                      {!daKetThuc && (
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => xoaHs(g.maGhiDanh)}
                        >
                          Hủy
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
