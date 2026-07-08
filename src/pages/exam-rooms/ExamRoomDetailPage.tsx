import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Table, { type ColumnDef } from '@/components/common/Table';
import StatusBadge, { type MauBadge } from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { examRoomsApi } from '@/api/examRooms.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/formatDate';
import { NHAN_CHE_DO_CAU_HOI } from '@/enums/cheDoCauHoi';
import { TrangThaiPhongThi, NHAN_TRANG_THAI_PHONG_THI } from '@/enums/trangThaiPhongThi';
import { TrangThaiThanhVien, NHAN_TRANG_THAI_THANH_VIEN } from '@/enums/trangThaiThanhVien';
import { mauTrangThaiPhong } from './ExamRoomListPage';
import type { PhongThi, ThanhVienPhong } from '@/types/phong-thi.type';

// Các bước chuyển trạng thái hợp lệ (khớp service Backend).
const CHUYEN_TRANG_THAI: Record<TrangThaiPhongThi, TrangThaiPhongThi[]> = {
  dang_cho: [TrangThaiPhongThi.DANG_DIEN_RA, TrangThaiPhongThi.DA_DONG],
  dang_dien_ra: [TrangThaiPhongThi.DA_DONG],
  da_dong: [],
};

const mauThanhVien: Record<TrangThaiThanhVien, MauBadge> = {
  da_tham_gia: 'blue',
  da_nop_bai: 'green',
  bi_loai: 'red',
};

export default function ExamRoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [phong, setPhong] = useState<PhongThi | null>(null);
  const [thanhViens, setThanhViens] = useState<ThanhVienPhong[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangDoi, setDangDoi] = useState(false);

  const taiDuLieu = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    try {
      const [pt, tv] = await Promise.all([
        examRoomsApi.getExamRoomById(+id),
        examRoomsApi.getExamRoomMembers(+id),
      ]);
      setPhong(pt);
      setThanhViens(tv);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangTai(false);
    }
  }, [id, toast]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const doiTrangThai = async (moi: TrangThaiPhongThi) => {
    if (!phong) return;
    setDangDoi(true);
    try {
      const pt = await examRoomsApi.updateExamRoomStatus(phong.maPhongThi, moi);
      setPhong({ ...phong, trangThai: pt.trangThai, moLuc: pt.moLuc, dongLuc: pt.dongLuc });
      toast.success(`Đã chuyển phòng sang "${NHAN_TRANG_THAI_PHONG_THI[moi]}"`);
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangDoi(false);
    }
  };

  if (dangTai) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!phong) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không tìm thấy phòng thi.{' '}
        <Link to="/exam-rooms" className="text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    );
  }

  const buocTiep = CHUYEN_TRANG_THAI[phong.trangThai];
  const dsDe = phong.phongThiBaiThis ?? [];
  const dsHs = phong.phongThiHocSinhs ?? [];
  const tenMonKy = phong.monHocHocKy
    ? `${phong.monHocHocKy.monHoc?.tenMonHoc ?? ''} — ${phong.monHocHocKy.hocKy?.tenHocKy ?? ''} ${phong.monHocHocKy.hocKy?.namHoc ?? ''}`
    : '—';

  const cotThanhVien: ColumnDef<ThanhVienPhong>[] = [
    { tieuDe: '#', className: 'w-12', render: (_t, i) => i + 1 },
    {
      tieuDe: 'Học sinh',
      render: (t) => (
        <span className="font-medium text-gray-800">
          {t.nguoiDung?.tenNguoiDung ?? `#${t.maNguoiDung}`}
        </span>
      ),
    },
    {
      tieuDe: 'Email',
      render: (t) => <span className="text-gray-600">{t.nguoiDung?.email ?? '—'}</span>,
    },
    {
      tieuDe: 'Trạng thái',
      render: (t) => (
        <StatusBadge mau={mauThanhVien[t.trangThai]}>
          {NHAN_TRANG_THAI_THANH_VIEN[t.trangThai]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        tieuDe={phong.tenPhongThi}
        hanhDong={
          <div className="flex gap-2">
            {phong.trangThai === TrangThaiPhongThi.DANG_CHO && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(`/exam-rooms/${phong.maPhongThi}/edit`)}
              >
                ✏️ Sửa
              </Button>
            )}
            <Button variant="secondary" type="button" onClick={() => navigate('/exam-rooms')}>
              ← Quay lại
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Danh sách đề trong phòng */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-2 font-medium text-gray-800">
            Đề thi trong phòng ({dsDe.length})
          </h3>
          <p className="mb-2 text-xs text-gray-500">
            Mỗi học sinh được bốc ngẫu nhiên 1 đề khi vào thi.
          </p>
          {dsDe.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có đề nào.</p>
          ) : (
            <ul className="space-y-1.5">
              {dsDe.map((d) => (
                <li
                  key={d.maPhongThiBaiThi}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                >
                  {d.baiThi?.tieuDe ?? `Đề #${d.maBaiThi}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Học sinh được gán vào phòng */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-2 font-medium text-gray-800">
            Học sinh trong phòng ({dsHs.length})
          </h3>
          <p className="mb-2 text-xs text-gray-500">
            Chỉ những học sinh này thấy và vào được phòng.
          </p>
          {dsHs.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa gán học sinh nào.</p>
          ) : (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {dsHs.map((h) => (
                <li
                  key={h.maPhongThiHocSinh}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                >
                  {h.hocSinh?.tenNguoiDung ?? `#${h.maHocSinh}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thông tin phòng */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Info nhan="Môn học (học kỳ)" giaTri={tenMonKy} />
            <Info
              nhan="Chế độ câu hỏi"
              giaTri={NHAN_CHE_DO_CAU_HOI[phong.cheDoCauHoi] ?? phong.cheDoCauHoi}
            />
            <Info nhan="Thời lượng" giaTri={`${phong.thoiGianLamBai} phút`} />
            <Info nhan="Mở lúc" giaTri={formatDateTime(phong.moLuc)} />
            <Info nhan="Đóng lúc" giaTri={formatDateTime(phong.dongLuc)} />
            <div>
              <dt className="text-gray-500">Trạng thái</dt>
              <dd className="mt-1">
                <StatusBadge mau={mauTrangThaiPhong[phong.trangThai]}>
                  {NHAN_TRANG_THAI_PHONG_THI[phong.trangThai]}
                </StatusBadge>
              </dd>
            </div>
          </dl>

          {buocTiep.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <span className="self-center text-sm text-gray-500">Chuyển trạng thái:</span>
              {buocTiep.map((tt) => (
                <Button
                  key={tt}
                  type="button"
                  variant={tt === TrangThaiPhongThi.DA_DONG ? 'outline' : 'primary'}
                  dangTai={dangDoi}
                  onClick={() => doiTrangThai(tt)}
                >
                  {NHAN_TRANG_THAI_PHONG_THI[tt]}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Thành viên ({thanhViens.length})</h2>
        <Button variant="ghost" type="button" className="!px-2 !py-1" onClick={taiDuLieu}>
          🔄 Làm mới
        </Button>
      </div>
      <Table
        columns={cotThanhVien}
        data={thanhViens}
        rowKey={(t) => t.maThanhVien}
        rong="Chưa có thí sinh nào tham gia"
      />
    </div>
  );
}

function Info({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <div>
      <dt className="text-gray-500">{nhan}</dt>
      <dd className="mt-0.5 font-medium text-gray-800">{giaTri}</dd>
    </div>
  );
}
