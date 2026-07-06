import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import type { MonHoc } from '@/types/mon-hoc.type';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const maMonHoc = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [monHoc, setMonHoc] = useState<MonHoc | null>(null);
  const [dangTaiMon, setDangTaiMon] = useState(true);

  useEffect(() => {
    if (!id) return;
    subjectsApi
      .getSubjectById(maMonHoc)
      .then(setMonHoc)
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTaiMon(false));
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

      <p className="text-sm text-gray-500">
        Đề thi được quản lý theo <b>môn học của học kỳ</b>. Vào mục Học kỳ để mở môn,
        phân công giáo viên và ghi danh học sinh.
      </p>
    </div>
  );
}
