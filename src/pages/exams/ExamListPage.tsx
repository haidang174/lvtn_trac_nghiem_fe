import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { examsApi, type QueryExamParams } from '@/api/exams.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { VaiTro } from '@/enums/vaiTro';
import { TrangThaiBaiThi, NHAN_TRANG_THAI_BAI_THI } from '@/enums/trangThaiBaiThi';
import type { BaiThi } from '@/types/bai-thi.type';

export default function ExamListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  // Chỉ giáo viên mới được tạo/sửa/xóa (admin chỉ xem).
  const laGiaoVien = user?.vaiTro === VaiTro.GIAO_VIEN;

  const [tuKhoa, setTuKhoa] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const tuKhoaDebounce = useDebounce(tuKhoa);

  const [items, setItems] = useState<BaiThi[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(false);

  const [chonXoa, setChonXoa] = useState<BaiThi | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params: QueryExamParams = { page, limit };
      if (tuKhoaDebounce) params.search = tuKhoaDebounce;
      if (locTrangThai) params.trangThai = locTrangThai as TrangThaiBaiThi;
      const data = await examsApi.getExams(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [page, limit, tuKhoaDebounce, locTrangThai, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Đổi từ khóa/bộ lọc → quay về trang 1.
  useEffect(() => {
    resetPage();
  }, [tuKhoaDebounce, locTrangThai, resetPage]);

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
    {
      tieuDe: 'Môn học (học kỳ)',
      render: (bt) =>
        bt.monHocHocKy
          ? `${bt.monHocHocKy.monHoc?.tenMonHoc ?? ''} — ${bt.monHocHocKy.hocKy?.tenHocKy ?? ''} ${bt.monHocHocKy.hocKy?.namHoc ?? ''}`
          : `#${bt.maMonHocHocKy}`,
    },
    {
      tieuDe: 'Thời gian',
      className: 'text-center',
      render: (bt) => `${bt.thoiGianLamBai} phút`,
    },
    {
      tieuDe: 'Trạng thái',
      render: (bt) =>
        bt.trangThai === TrangThaiBaiThi.DA_SU_DUNG ? (
          <StatusBadge mau="blue">{NHAN_TRANG_THAI_BAI_THI.da_su_dung}</StatusBadge>
        ) : bt.trangThai === TrangThaiBaiThi.CONG_KHAI ? (
          <StatusBadge mau="green">{NHAN_TRANG_THAI_BAI_THI.cong_khai}</StatusBadge>
        ) : (
          <StatusBadge mau="gray">{NHAN_TRANG_THAI_BAI_THI.nhap}</StatusBadge>
        ),
    },
    ...(!laGiaoVien
      ? [
          {
            tieuDe: 'Người tạo',
            render: (bt: BaiThi) => bt.nguoiTao?.tenNguoiDung ?? `#${bt.taoBoi}`,
          } as ColumnDef<BaiThi>,
        ]
      : []),
    {
      tieuDe: '',
      className: 'text-right whitespace-nowrap',
      render: (bt) =>
        laGiaoVien ? (
          <div className="flex justify-end gap-2">
            {bt.trangThai !== TrangThaiBaiThi.DA_SU_DUNG && (
              <Button
                variant="ghost"
                type="button"
                className="!px-2 !py-1"
                onClick={() => navigate(`/exams/${bt.maBaiThi}/edit`)}
              >
                ✏️ Sửa
              </Button>
            )}
            {bt.trangThai !== TrangThaiBaiThi.DA_SU_DUNG && (
              <Button
                variant="ghost"
                type="button"
                className="!px-2 !py-1"
                onClick={() => doiTrangThai(bt)}
              >
                {bt.trangThai === TrangThaiBaiThi.CONG_KHAI ? '🔒 Ẩn' : '📢 Công khai'}
              </Button>
            )}
            {bt.trangThai !== TrangThaiBaiThi.DA_SU_DUNG ? (
              <Button
                variant="ghost"
                type="button"
                className="!px-2 !py-1 text-red-600 hover:bg-red-50"
                onClick={() => setChonXoa(bt)}
              >
                🗑️ Xóa
              </Button>
            ) : (
              <Button
                variant="ghost"
                type="button"
                className="!px-2 !py-1"
                onClick={() => navigate(`/exams/${bt.maBaiThi}`)}
              >
                Xem
              </Button>
            )}
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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchInput
          placeholder="Tìm theo tiêu đề đề thi..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <Select
          placeholder="-- Tất cả trạng thái --"
          value={locTrangThai}
          onChange={(e) => setLocTrangThai(e.target.value)}
          options={[
            { value: TrangThaiBaiThi.NHAP, label: NHAN_TRANG_THAI_BAI_THI.nhap },
            { value: TrangThaiBaiThi.CONG_KHAI, label: NHAN_TRANG_THAI_BAI_THI.cong_khai },
            { value: TrangThaiBaiThi.DA_SU_DUNG, label: NHAN_TRANG_THAI_BAI_THI.da_su_dung },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={items}
        rowKey={(bt) => bt.maBaiThi}
        dangTai={dangTai}
        rong="Không tìm thấy đề thi nào"
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
