import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { subjectsApi } from '@/api/subjects.api';
import { subjectOfferingsApi } from '@/api/subjectOfferings.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { MonHocHocKy } from '@/types/mon-hoc-hoc-ky.type';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const maMonHoc = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [monHoc, setMonHoc] = useState<MonHoc | null>(null);
  const [dangTaiMon, setDangTaiMon] = useState(true);
  const [offerings, setOfferings] = useState<MonHocHocKy[]>([]);
  const [dangTaiHK, setDangTaiHK] = useState(true);

  useEffect(() => {
    if (!id) return;
    subjectsApi
      .getSubjectById(maMonHoc)
      .then(setMonHoc)
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTaiMon(false));
  }, [id, maMonHoc, toast]);

  // Các học kỳ mà môn này còn đang được mở — chỉ lấy offering đang hoạt động (laHoatDong=true).
  useEffect(() => {
    if (!id) return;
    subjectOfferingsApi
      .getOfferings({ page: 1, limit: 1000, maMonHoc, laHoatDong: true })
      .then((res) => setOfferings(res.items))
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTaiHK(false));
  }, [id, maMonHoc, toast]);

  if (dangTaiMon) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!monHoc) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy môn học.{' '}
        <Link to="/subjects" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        tieuDe={monHoc.tenMonHoc}
        hanhDong={
          <Button variant="secondary" type="button" onClick={() => navigate('/subjects')}>
            ← Quay lại
          </Button>
        }
      />

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {monHoc.maMon && (
            <div>
              <span className="text-gray-500">Mã môn: </span>
              <span className="font-medium text-gray-800">{monHoc.maMon}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Trạng thái: </span>
            {monHoc.laHoatDong ? (
              <StatusBadge mau="green">Hoạt động</StatusBadge>
            ) : (
              <StatusBadge mau="gray">Đã khóa</StatusBadge>
            )}
          </div>
        </div>
        {monHoc.moTa && <p className="mt-3 text-sm text-gray-600">{monHoc.moTa}</p>}
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 font-semibold text-gray-800">
          Học kỳ đã mở môn này{!dangTaiHK && ` (${offerings.length})`}
        </h3>

        {dangTaiHK ? (
          <p className="py-2 text-sm text-gray-400">Đang tải…</p>
        ) : offerings.length === 0 ? (
          <p className="py-2 text-sm text-gray-400">
            Môn học chưa được mở trong học kỳ nào.
          </p>
        ) : (
          <ul className="space-y-2">
            {offerings.map((o) => (
              <li
                key={o.maMonHocHocKy}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2"
              >
                <Link
                  to={`/semesters/${o.maHocKy}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {o.hocKy
                    ? `${o.hocKy.tenHocKy} — ${o.hocKy.namHoc}`
                    : `HK #${o.maHocKy}`}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
