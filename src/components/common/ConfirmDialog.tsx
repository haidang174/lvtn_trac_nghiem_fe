import type { ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Props {
  moRa: boolean;
  tieuDe: string;
  noiDung: ReactNode;
  nhanXacNhan?: string;
  nhanHuy?: string;
  // Kiểu nguy hiểm tô đỏ nút xác nhận (xóa/khóa...).
  nguyHiem?: boolean;
  dangXuLy?: boolean;
  onXacNhan: () => void;
  onHuy: () => void;
}

// Hộp thoại xác nhận dùng chung (xóa, khóa tài khoản, đóng phòng...).
export default function ConfirmDialog({
  moRa,
  tieuDe,
  noiDung,
  nhanXacNhan = 'Xác nhận',
  nhanHuy = 'Hủy',
  nguyHiem = false,
  dangXuLy = false,
  onXacNhan,
  onHuy,
}: Props) {
  return (
    <Modal
      moRa={moRa}
      onDong={onHuy}
      tieuDe={tieuDe}
      kichThuoc="sm"
      chanDuoi={
        <>
          <Button variant="secondary" type="button" onClick={onHuy} disabled={dangXuLy}>
            {nhanHuy}
          </Button>
          <Button
            type="button"
            dangTai={dangXuLy}
            onClick={onXacNhan}
            className={nguyHiem ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400' : ''}
          >
            {nhanXacNhan}
          </Button>
        </>
      }
    >
      <div className="text-sm text-gray-600">{noiDung}</div>
    </Modal>
  );
}
