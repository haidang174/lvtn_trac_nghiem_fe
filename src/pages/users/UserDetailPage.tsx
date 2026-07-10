import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Table, { type ColumnDef } from '@/components/common/Table';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { usersApi } from '@/api/users.api';
import { resultsApi } from '@/api/results.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { NHAN_VAI_TRO, VaiTro } from '@/enums/vaiTro';
import { TrangThaiBaiLam, NHAN_TRANG_THAI_BAI_LAM } from '@/enums/trangThaiBaiLam';
import { formatScore } from '@/utils/formatScore';
import { formatDateTime } from '@/utils/formatDate';
import { gomTheoMon, xuatBangDiemExcel } from '@/utils/bangDiemHocSinh';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import type { KetQuaCuaToi } from '@/types/ket-qua.type';

const mauTrangThai: Record<TrangThaiBaiLam, MauBadge> = {
  dang_lam: 'amber',
  da_nop: 'green',
  het_thoi_gian: 'red',
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<NguoiDung | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [xacNhan, setXacNhan] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [dsKetQua, setDsKetQua] = useState<KetQuaCuaToi[]>([]);
  const [dangTaiDiem, setDangTaiDiem] = useState(false);
  const toast = useToast();

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      setUser(await usersApi.getUserById(+id));
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [id, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Chỉ tải bảng điểm khi người dùng đang xem là Học sinh.
  useEffect(() => {
    if (!user || user.vaiTro !== VaiTro.HOC_SINH) {
      setDsKetQua([]);
      return;
    }
    setDangTaiDiem(true);
    resultsApi
      .getStudentResults(user.maNguoiDung)
      .then(setDsKetQua)
      .catch((err) => toast.error(chuanHoaLoi(err).message))
      .finally(() => setDangTaiDiem(false));
  }, [user, toast]);

  const nhomMon = useMemo(() => gomTheoMon(dsKetQua), [dsKetQua]);

  const xacNhanDoiTrangThai = async () => {
    if (!user) return;
    setDangXuLy(true);
    try {
      const moi = await usersApi.updateUserStatus(user.maNguoiDung, !user.laHoatDong);
      setUser(moi);
      toast.success(user.laHoatDong ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setXacNhan(false);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangXuLy(false);
    }
  };

  const columns: ColumnDef<KetQuaCuaToi>[] = [
    {
      tieuDe: 'Phòng thi',
      render: (r) => <span className="font-semibold text-gray-900">{r.tenPhongThi}</span>,
    },
    { tieuDe: 'Đề thi', render: (r) => r.tieuDe ?? '—' },
    {
      tieuDe: 'Điểm',
      className: 'text-center',
      render: (r) =>
        r.daThi ? (
          <span className="font-bold text-primary">{formatScore(r.diemSo)}/10</span>
        ) : (
          '—'
        ),
    },
    {
      tieuDe: 'Đúng/Tổng',
      className: 'text-center',
      render: (r) => (r.daThi ? `${r.soCauDung}/${r.tongSoCau}` : '—'),
    },
    {
      tieuDe: 'Nộp lúc',
      render: (r) => (r.daThi && r.thoiGianNop ? formatDateTime(r.thoiGianNop) : '—'),
    },
    {
      tieuDe: 'Trạng thái',
      render: (r) =>
        r.daThi && r.trangThaiBaiLam ? (
          <StatusBadge mau={mauTrangThai[r.trangThaiBaiLam] ?? 'gray'}>
            {NHAN_TRANG_THAI_BAI_LAM[r.trangThaiBaiLam] ?? r.trangThaiBaiLam}
          </StatusBadge>
        ) : (
          <StatusBadge mau="gray">Không tham gia</StatusBadge>
        ),
    },
    {
      tieuDe: '',
      className: 'text-right',
      // Admin luôn xem được chi tiết (không khóa như phía học sinh).
      render: (r) =>
        r.daThi && r.maKetQua != null ? (
          <Button
            variant="ghost"
            type="button"
            className="!px-2 !py-1"
            onClick={() => navigate(`/results/${r.maKetQua}`)}
          >
            Xem chi tiết
          </Button>
        ) : null,
    },
  ];

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy người dùng.{' '}
        <Link to="/users" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        tieuDe="Chi tiết người dùng"
        hanhDong={
          <>
            <Link to="/users">
              <Button variant="secondary" type="button">
                ← Quay lại
              </Button>
            </Link>
            <Button
              variant={user.laHoatDong ? 'outline' : 'primary'}
              type="button"
              onClick={() => setXacNhan(true)}
            >
              {user.laHoatDong ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </Button>
          </>
        }
      />

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.tenNguoiDung.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.tenNguoiDung}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Mã người dùng</dt>
            <dd className="font-medium text-gray-800">#{user.maNguoiDung}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Vai trò</dt>
            <dd className="font-medium text-gray-800">{NHAN_VAI_TRO[user.vaiTro]}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Trạng thái</dt>
            <dd>
              {user.laHoatDong ? (
                <StatusBadge mau="green">Hoạt động</StatusBadge>
              ) : (
                <StatusBadge mau="red">Đã khóa</StatusBadge>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {user.vaiTro === VaiTro.HOC_SINH && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bảng điểm các môn</h3>
            <Button
              variant="outline"
              type="button"
              disabled={dangTaiDiem || nhomMon.length === 0}
              onClick={() => xuatBangDiemExcel(user, nhomMon)}
            >
              Xuất Excel
            </Button>
          </div>
          {dangTaiDiem ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : nhomMon.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-gray-500">
              Học sinh chưa có kết quả thi nào.
            </div>
          ) : (
            <div className="space-y-6">
              {nhomMon.map((mon) => (
                <div
                  key={mon.maMonHoc}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {mon.tenMonHoc ?? 'Môn học'}
                    </h4>
                    <span className="text-sm text-gray-600">
                      Điểm TB:{' '}
                      {mon.diemTB != null ? (
                        <span className="font-bold text-primary">
                          {formatScore(mon.diemTB)}/10
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <Table
                    columns={columns}
                    data={mon.danhSach}
                    rowKey={(r) => r.maPhongThi}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        moRa={xacNhan}
        tieuDe={user.laHoatDong ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        noiDung={
          user.laHoatDong
            ? `Khóa tài khoản "${user.tenNguoiDung}"? Người dùng sẽ không thể đăng nhập.`
            : `Mở khóa tài khoản "${user.tenNguoiDung}"?`
        }
        nhanXacNhan={user.laHoatDong ? 'Khóa' : 'Mở khóa'}
        nguyHiem={user.laHoatDong}
        dangXuLy={dangXuLy}
        onXacNhan={xacNhanDoiTrangThai}
        onHuy={() => setXacNhan(false)}
      />
    </div>
  );
}
