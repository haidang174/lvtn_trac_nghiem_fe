import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { authApi } from '@/api/auth.api';
import { chuanHoaLoi } from '@/api/axiosClient';
import { useAppDispatch } from '@/store/hooks';
import { datUser } from '@/store/slices/auth.slice';
import { themToast } from '@/store/slices/ui.slice';
import { tokenStorage } from '@/utils/token';
import { VaiTro } from '@/enums/vaiTro';

/**
 * Trang nhận kết quả đăng nhập Google.
 *
 * Backend (GET /auth/google/callback) cần REDIRECT về trang này kèm query:
 *   - Đăng nhập được luôn: ?accessToken=...&refreshToken=...
 *   - User mới cần chọn vai trò: ?needSelectRole=true&tempToken=...
 * Nếu Backend đang trả JSON trực tiếp, cần bổ sung bước redirect đó.
 */
export default function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const tempToken = params.get('tempToken');
  const needSelectRole = params.get('needSelectRole') === 'true';

  const [dangXuLy, setDangXuLy] = useState(true);
  const [vaiTro, setVaiTro] = useState<VaiTro>(VaiTro.HOC_SINH);
  const [dangXacNhan, setDangXacNhan] = useState(false);
  const daChay = useRef(false);

  // Trường hợp đăng nhập trực tiếp: lưu token + lấy /auth/me.
  useEffect(() => {
    if (daChay.current) return;
    daChay.current = true;

    (async () => {
      if (accessToken && refreshToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
        try {
          const me = await authApi.getMe();
          dispatch(datUser(me));
          dispatch(themToast('success', 'Đăng nhập Google thành công'));
          navigate('/', { replace: true });
          return;
        } catch (err) {
          dispatch(themToast('error', chuanHoaLoi(err).message));
          navigate('/login', { replace: true });
          return;
        }
      }

      if (!needSelectRole || !tempToken) {
        dispatch(themToast('error', 'Phản hồi đăng nhập Google không hợp lệ'));
        navigate('/login', { replace: true });
        return;
      }

      // Cần chọn vai trò → dừng lại hiển thị form.
      setDangXuLy(false);
    })();
  }, [accessToken, refreshToken, needSelectRole, tempToken, dispatch, navigate]);

  const xuLyChonVaiTro = async () => {
    if (!tempToken) return;
    setDangXacNhan(true);
    try {
      const res = await authApi.confirmRoleGoogle(tempToken, vaiTro);
      if (res.accessToken && res.refreshToken) {
        tokenStorage.setTokens(res.accessToken, res.refreshToken);
      }
      const me = await authApi.getMe();
      dispatch(datUser(me));
      dispatch(themToast('success', 'Đăng nhập Google thành công'));
      navigate('/', { replace: true });
    } catch (err) {
      dispatch(themToast('error', chuanHoaLoi(err).message));
    } finally {
      setDangXacNhan(false);
    }
  };

  if (dangXuLy) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-gray-500">Đang xử lý đăng nhập Google…</p>
      </div>
    );
  }

  return (
    <AuthLayout tieuDe="Chọn vai trò" moTa="Hoàn tất đăng ký bằng Google">
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="vaiTro" className="block text-sm font-medium text-gray-700">
            Bạn là
          </label>
          <select
            id="vaiTro"
            value={vaiTro}
            onChange={(e) => setVaiTro(e.target.value as VaiTro)}
            className="input-base"
          >
            <option value={VaiTro.HOC_SINH}>Học sinh</option>
            <option value={VaiTro.GIAO_VIEN}>Giáo viên</option>
          </select>
        </div>
        <Button fullWidth dangTai={dangXacNhan} onClick={xuLyChonVaiTro}>
          Hoàn tất
        </Button>
      </div>
    </AuthLayout>
  );
}
