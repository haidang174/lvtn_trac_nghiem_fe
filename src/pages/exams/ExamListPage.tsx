import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import { examsApi } from '@/api/exams.api';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';

export default function ExamListPage() {
  const { page, limit, setPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  // Chỉ giáo viên mới được tạo/sửa/xóa (admin chỉ xem).
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [items, setItems] = useState<BaiThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [tenMon, setTenMon] = useState<Record<number, string>>({});

  const [chonXoa, setChonXoa] = useState<BaiThi | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

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
      const data = await examsApi.getExams({ page, limit });
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

  const doiTrangThai = async (bt: BaiThi) => {
    const moi =
      bt.trangThai === TrangThaiBaiThi.CONG_KHAI
        ? TrangThaiBaiThi.NHAP
        : TrangThaiBaiThi.CONG_KHAI;
    try {
      await examsApi.updateExamStatus(bt.maBaiThi, moi);
      toast.success(moi === TrangThaiBaiThi.CONG_KHAI ? 'Đã công khai đề thi' : 'Đã chuyển về nháp');
      taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    }
  };

  const xacNhanXoa = async () => {
    if (!chonXoa) return;
    setDangXoa(true);
    try {
      await examsApi.deleteExam(chonXoa.maBaiThi);
      toast.success('Đã xóa đề thi');
      setChonXoa(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else taiDuLieu();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXoa(false);
    }
  };

  const columns: ColumnDef<BaiThi>[] = [
    {
      tieuDe: 'Tiêu đề',
      render: (bt) => (
        <button
          onClick={() => navigate(`/exams/${bt.maBaiThi}`)}
          className="text-left font-medium text-primary hover:underline"
        >
          {bt.tieuDe}
        </button>
      ),
    },
    { tieuDe: 'Môn học', render: (bt) => tenMon[bt.maMonHoc] ?? `#${bt.maMonHoc}` },
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
      className: 'text-right whitespace-nowrap',
      render: (bt) =>
        laGiaoVien ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              className="!px-2 !py-1"
              onClick={() => navigate(`/exams/${bt.maBaiThi}/edit`)}
            >
              ✏️ Sửa
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="!px-2 !py-1"
              onClick={() => doiTrangThai(bt)}
            >
              {bt.trangThai === TrangThaiBaiThi.CONG_KHAI ? '🔒 Ẩn' : '📢 Công khai'}
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="!px-2 !py-1 text-red-600 hover:bg-red-50"
              onClick={() => setChonXoa(bt)}
            >
              🗑️ Xóa
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/exams/${bt.maBaiThi}`)}
          >
            Xem
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe="Quản lý đề thi"
        moTa="Tạo đề thi từ ngân hàng câu hỏi"
        hanhDong={
          laGiaoVien && (
            <Button type="button" onClick={() => navigate('/exams/new')}>
              + Tạo đề thi
            </Button>
          )
        }
      />

      <Table
        columns={columns}
        data={items}
        rowKey={(bt) => bt.maBaiThi}
        dangTai={dangTai}
        rong="Chưa có đề thi nào"
      />

      <Pagination page={page} limit={limit} total={total} onChangePage={setPage} />

      <ConfirmDialog
        moRa={!!chonXoa}
        tieuDe="Xóa đề thi"
        noiDung={`Xóa đề thi "${chonXoa?.tieuDe}"? Không thể xóa khi còn phòng thi đang hoạt động.`}
        nhanXacNhan="Xóa"
        nguyHiem
        dangXuLy={dangXoa}
        onXacNhan={xacNhanXoa}
        onHuy={() => setChonXoa(null)}
      />
    </div>
  );
}
