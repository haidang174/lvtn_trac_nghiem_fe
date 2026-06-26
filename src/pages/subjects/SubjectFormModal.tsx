import { useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { subjectsApi } from '@/api/subjects.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import type { MonHoc } from '@/types/mon-hoc.type';

interface Props {
  moRa: boolean;
  // Có giá trị → chế độ sửa; null → chế độ tạo mới.
  monHoc: MonHoc | null;
  onDong: () => void;
  onLuuXong: () => void;
}

export default function SubjectFormModal({ moRa, monHoc, onDong, onLuuXong }: Props) {
  const laSua = !!monHoc;
  const [tenMonHoc, setTenMonHoc] = useState('');
  const [maDinhDanhMon, setMaDinhDanhMon] = useState('');
  const [moTa, setMoTa] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const toast = useToast();

  // Nạp lại dữ liệu mỗi khi mở modal (tạo mới = rỗng, sửa = giá trị cũ).
  useEffect(() => {
    if (moRa) {
      setTenMonHoc(monHoc?.tenMonHoc ?? '');
      setMaDinhDanhMon(monHoc?.maDinhDanhMon ?? '');
      setMoTa(monHoc?.moTa ?? '');
    }
  }, [moRa, monHoc]);

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    setDangLuu(true);
    try {
      const payload = {
        tenMonHoc: tenMonHoc.trim(),
        maDinhDanhMon: maDinhDanhMon.trim() || undefined,
        moTa: moTa.trim() || undefined,
      };
      if (laSua) {
        await subjectsApi.updateSubject(monHoc!.maMonHoc, payload);
        toast.success('Cập nhật môn học thành công');
      } else {
        await subjectsApi.createSubject(payload);
        toast.success('Tạo môn học thành công');
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
      tieuDe={laSua ? 'Sửa môn học' : 'Thêm môn học'}
      chanDuoi={
        <>
          <Button variant="secondary" type="button" onClick={onDong} disabled={dangLuu}>
            Hủy
          </Button>
          <Button type="submit" form="subject-form" dangTai={dangLuu}>
            {laSua ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={xuLyLuu} className="space-y-4">
        <Input
          label="Tên môn học *"
          name="tenMonHoc"
          required
          maxLength={100}
          value={tenMonHoc}
          onChange={(e) => setTenMonHoc(e.target.value)}
          placeholder="VD: Lập trình Web"
        />
        <Input
          label="Mã định danh môn"
          name="maDinhDanhMon"
          maxLength={20}
          value={maDinhDanhMon}
          onChange={(e) => setMaDinhDanhMon(e.target.value)}
          placeholder="VD: IT4409"
        />
        <div className="space-y-1">
          <label htmlFor="moTa" className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            id="moTa"
            name="moTa"
            rows={3}
            className="input-base resize-none"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            placeholder="Mô tả ngắn về môn học..."
          />
        </div>
      </form>
    </Modal>
  );
}
