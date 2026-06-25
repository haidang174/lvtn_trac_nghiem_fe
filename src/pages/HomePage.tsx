import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { NHAN_VAI_TRO } from '@/enums/vaiTro';

// Trang chủ tạm thời (giai đoạn nền tảng) — xác nhận luồng đăng nhập hoạt động.
export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Xin chào, {user?.tenNguoiDung} 👋</h1>
        <dl className="mt-4 space-y-2 text-sm text-gray-700">
          <div className="flex gap-2">
            <dt className="w-28 text-gray-500">Email:</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 text-gray-500">Vai trò:</dt>
            <dd>{user ? NHAN_VAI_TRO[user.vaiTro] : ''}</dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-3">
          {user?.coMatKhau && (
            <Link to="/change-password">
              <Button variant="outline" type="button">
                Đổi mật khẩu
              </Button>
            </Link>
          )}
          <Button variant="secondary" type="button" onClick={logout}>
            Đăng xuất
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Nền tảng + Auth đã sẵn sàng. Các module nghiệp vụ (môn học, câu hỏi, đề thi, phòng
          thi, làm bài, kết quả) sẽ được bổ sung tiếp.
        </p>
      </div>
    </div>
  );
}
