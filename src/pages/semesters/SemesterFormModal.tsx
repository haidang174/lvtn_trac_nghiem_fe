import { useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { semestersApi } from '@/api/semesters.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import type { HocKy } from '@/types/hoc-ky.type';

interface Props {
  moRa: boolean;
  hocKy: HocKy | null;
  onDong: () => void;
  onLuuXong: () => void;
}

export default function SemesterFormModal({ moRa, hocKy, onDong, onLuuXong }: Props) {
  const laSua = !!hocKy;
  const [tenHocKy, setTenHocKy] = useState('');
  const [namHoc, setNamHoc] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (moRa) {
      setTenHocKy(hocKy?.tenHocKy ?? '');
      setNamHoc(hocKy?.namHoc ?? '');
      setNgayBatDau(hocKy?.ngayBatDau?.slice(0, 10) ?? '');
      setNgayKetThuc(hocKy?.ngayKetThuc?.slice(0, 10) ?? '');
    }
  }, [moRa, hocKy]);

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenHocKy.trim() || !namHoc.trim())
      return toast.error('Vui lòng nhập tên học kỳ và năm học');
    setDangLuu(true);
    try {
      const payload = {
        tenHocKy: tenHocKy.trim(),
        namHoc: namHoc.trim(),
        ngayBatDau: ngayBatDau || undefined,
        ngayKetThuc: ngayKetThuc || undefined,
      };
      if (laSua) {
        await semestersApi.updateSemester(hocKy!.maHocKy, payload);
        toast.success('Cập nhật học kỳ thành công');
      } else {
        await semestersApi.createSemester(payload);
        toast.success('Tạo học kỳ thành công');
      }
      onLuuXong();
      onDong();
    } catch (err) {
      toast.error(chuanHoaLoi(err).message);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Modal
      moRa={moRa}
      onDong={onDong}
      tieuDe={laSua ? 'Sửa học kỳ' : 'Thêm học kỳ'}
      chanDuoi={
        <>
          <Button variant="secondary" type="button" onClick={onDong} disabled={dangLuu}>
            Hủy
          </Button>
          <Button type="submit" form="semester-form" dangTai={dangLuu}>
            {laSua ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <form id="semester-form" onSubmit={xuLyLuu} className="space-y-4">
        <Input
          label="Tên học kỳ *"
          required
          maxLength={100}
          value={tenHocKy}
          onChange={(e) => setTenHocKy(e.target.value)}
          placeholder="VD: Học kỳ 1"
        />
        <Input
          label="Năm học *"
          required
          maxLength={20}
          value={namHoc}
          onChange={(e) => setNamHoc(e.target.value)}
          placeholder="VD: 2025-2026"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu"
            type="date"
            value={ngayBatDau}
            onChange={(e) => setNgayBatDau(e.target.value)}
          />
          <Input
            label="Ngày kết thúc"
            type="date"
            value={ngayKetThuc}
            onChange={(e) => setNgayKetThuc(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
