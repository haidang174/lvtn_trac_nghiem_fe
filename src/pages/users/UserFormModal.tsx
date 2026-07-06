import { useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { usersApi } from '@/api/users.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useToast } from '@/hooks/useToast';
import { VaiTro, NHAN_VAI_TRO } from '@/enums/vaiTro';
import type { NguoiDung } from '@/types/nguoi-dung.type';

interface Props {
  moRa: boolean;
  nguoiDung: NguoiDung | null;
  onDong: () => void;
  onLuuXong: () => void;
}

export default function UserFormModal({ moRa, nguoiDung, onDong, onLuuXong }: Props) {
  const laSua = !!nguoiDung;
  const [tenNguoiDung, setTenNguoiDung] = useState('');
  const [email, setEmail] = useState('');
  const [vaiTro, setVaiTro] = useState<VaiTro>(VaiTro.HOC_SINH);
  const [matKhau, setMatKhau] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (moRa) {
      setTenNguoiDung(nguoiDung?.tenNguoiDung ?? '');
      setEmail(nguoiDung?.email ?? '');
      setVaiTro(nguoiDung?.vaiTro ?? VaiTro.HOC_SINH);
      setMatKhau('');
    }
  }, [moRa, nguoiDung]);

  const xuLyLuu = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenNguoiDung.trim()) return toast.error('Vui lòng nhập tên');
    if (!laSua && !email.trim()) return toast.error('Vui lòng nhập email');
    setDangLuu(true);
    try {
      if (laSua) {
        await usersApi.updateUser(nguoiDung!.maNguoiDung, {
          tenNguoiDung: tenNguoiDung.trim(),
          vaiTro,
        });
        toast.success('Cập nhật người dùng thành công');
      } else {
        await usersApi.createUser({
          tenNguoiDung: tenNguoiDung.trim(),
          email: email.trim(),
          vaiTro,
          matKhau: matKhau.trim() || undefined,
        });
        toast.success('Tạo người dùng thành công (mật khẩu mặc định: 123456)');
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
      tieuDe={laSua ? 'Sửa người dùng' : 'Thêm người dùng'}
      chanDuoi={
        <>
          <Button variant="secondary" type="button" onClick={onDong} disabled={dangLuu}>
            Hủy
          </Button>
          <Button type="submit" form="user-form" dangTai={dangLuu}>
            {laSua ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={xuLyLuu} className="space-y-4">
        <Input
          label="Họ tên *"
          required
          maxLength={100}
          value={tenNguoiDung}
          onChange={(e) => setTenNguoiDung(e.target.value)}
        />
        <Input
          label="Email *"
          type="email"
          required
          disabled={laSua}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@demo.com"
        />
        <Select
          label="Vai trò *"
          value={vaiTro}
          onChange={(e) => setVaiTro(e.target.value as VaiTro)}
          options={Object.values(VaiTro).map((v) => ({
            value: v,
            label: NHAN_VAI_TRO[v],
          }))}
        />
        {!laSua && (
          <Input
            label="Mật khẩu khởi tạo"
            type="text"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            placeholder="Bỏ trống = 123456"
          />
        )}
      </form>
    </Modal>
  );
}
