import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import { questionsApi } from '@/api/questions.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { DoKho, NHAN_DO_KHO } from '@/enums/doKho';
import { NHAN_LOAI_CAU_HOI } from '@/enums/loaiCauHoi';
import type { CauHoi } from '@/types/cau-hoi.type';

const mauDoKho: Record<DoKho, MauBadge> = {
  de: 'green',
  trung_binh: 'amber',
  kho: 'red',
};

export default function QuestionListPage() {
  const { page, limit, setPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<CauHoi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [tenMon, setTenMon] = useState<Record<number, string>>({});

  const [chonXoa, setChonXoa] = useState<CauHoi | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  // Nạp map mã môn → tên môn để hiển thị (BE không join môn vào câu hỏi).
  useEffect(() => {
    subjectsApi
      .getSubjects({ page: 1, limit: 1000 })
      .then((d) => {
        const map: Record<number, string> = {};
        d.items.forEach((m) => (map[m.maMonHoc] = m.tenMonHoc));
        setTenMon(map);
      })
      .catch(() => undefined);
  }, []);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const data = await questionsApi.getQuestions({ page, limit });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const xacNhanXoa = async () => {
    if (!chonXoa) return;
    setDangXoa(true);
    try {
      await questionsApi.deleteQuestion(chonXoa.maCauHoi);
      toast.success('Đã xóa câu hỏi');
      setChonXoa(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXoa(false);
    }
  };

  const columns: ColumnDef<CauHoi>[] = [
    {
      tieuDe: 'Nội dung',
      render: (q) => (
        <button
          onClick={() => navigate(`/questions/${q.maCauHoi}`)}
          className="line-clamp-2 max-w-md text-left font-medium text-primary hover:underline"
        >
          {q.noiDung}
        </button>
      ),
    },
    { tieuDe: 'Môn học', render: (q) => tenMon[q.maMonHoc] ?? `#${q.maMonHoc}` },
    {
      tieuDe: 'Độ khó',
      render: (q) => <StatusBadge mau={mauDoKho[q.doKho]}>{NHAN_DO_KHO[q.doKho]}</StatusBadge>,
    },
    { tieuDe: 'Loại', render: (q) => NHAN_LOAI_CAU_HOI[q.loaiCauHoi] },
    { tieuDe: 'Số lựa chọn', className: 'text-center', render: (q) => q.luaChons?.length ?? 0 },
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (q) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/questions/${q.maCauHoi}/edit`)}
          >
            ✏️ Sửa
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1 text-red-600 hover:bg-red-50"
            onClick={() => setChonXoa(q)}
          >
            🗑️ Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Ngân hàng câu hỏi"
        moTa="Quản lý câu hỏi trắc nghiệm theo môn học"
        hanhDong={
          <Button type="button" onClick={() => navigate('/questions/new')}>
            + Thêm câu hỏi
          </Button>
        }
      />

      <Table
        columns={columns}
        data={items}
        rowKey={(q) => q.maCauHoi}
        dangTai={dangTai}
        rong="Chưa có câu hỏi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />

      <ConfirmDialog
        moRa={!!chonXoa}
        tieuDe="Xóa câu hỏi"
        noiDung="Xóa câu hỏi này? Câu hỏi đã thuộc đề thi đã công khai sẽ không xóa được."
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={xacNhanXoa}
        onHuy={() => setChonXoa(null)}
      />
    </div>
  );
}
