import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { subjectsApi } from '@/api/subjects.api';
import { examsApi } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import type { MonHoc } from '@/types/mon-hoc.type';
import type { BaiThi } from '@/types/bai-thi.type';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const maMonHoc = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { page, limit, setPage } = usePagination();

  const [monHoc, setMonHoc] = useState<MonHoc | null>(null);
  const [dangTaiMon, setDangTaiMon] = useState(true);

  const [deThis, setDeThis] = useState<BaiThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTaiDe, setDangTaiDe] = useState(false);

  // Nạp thông tin môn học.
  useEffect(() => {
    if (!id) return;
    subjectsApi
      .getSubjectById(maMonHoc)
      .then(setMonHoc)
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTaiMon(false));
  }, [id, maMonHoc, toast]);

  // Nạp danh sách đề thi của môn (lọc server-side theo maMonHoc).
  const taiDeThi = useCallback(async () => {
    if (!id) return;
    setDangTaiDe(true);
    try {
      const data = await examsApi.getExams({ page, limit, maMonHoc });
      setDeThis(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTaiDe(false);
    }
  }, [id, maMonHoc, page, limit, toast]);

  useEffect(() => {
    taiDeThi();
  }, [taiDeThi]);

  const columns: ColumnDef<BaiThi>[] = [
    {
      tieuDe: 'Tiêu đề đề thi',
      render: (bt) => (
        <button
          onClick={() => navigate(`/exams/${bt.maBaiThi}`)}
          className="text-left font-medium text-primary hover:underline"
        >
          {bt.tieuDe}
        </button>
      ),
    },
    {
      tieuDe: 'Thời gian',
      className: 'text-center',
      render: (bt) => `${bt.thoiGianLamBai} phút`,
    },
    {
      tieuDe: 'Trạng thái',
      render: (bt) =>
        bt.trangThai === TrangThaiBaiThi.CONG_KHAI ? (
          <StatusBadge mau="green">{NHAN_TRANG_THAI_BAI_THI.cong_khai}</StatusBadge>
        ) : (
          <StatusBadge mau="gray">{NHAN_TRANG_THAI_BAI_THI.nhap}</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      render: (bt) => (
        <Button
          variant="ghost"
          type="button"
          className="!px-2 !py-1"
          onClick={() => navigate(`/exams/${bt.maBaiThi}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

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

      {/* Thông tin môn học */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Trạng thái: </span>
            {monHoc.laHoatDong ? (
              <StatusBadge mau="green">Hoạt động</StatusBadge>
            ) : (
              <StatusBadge mau="gray">Đã khóa</StatusBadge>
            )}
          </div>
          <div>
            <span className="text-gray-500">Số đề thi: </span>
            <span className="font-medium text-gray-800">{total}</span>
          </div>
        </div>
        {monHoc.moTa && <p className="mt-3 text-sm text-gray-600">{monHoc.moTa}</p>}
      </div>

      <h2 className="mb-3 font-semibold text-gray-800">Đề thi thuộc môn này</h2>
      <Table
        columns={columns}
        data={deThis}
        rowKey={(bt) => bt.maBaiThi}
        dangTai={dangTaiDe}
        rong="Môn học này chưa có đề thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />
    </div>
  );
}
