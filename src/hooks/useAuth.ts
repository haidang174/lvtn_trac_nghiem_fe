import { useCallback } from 'react';
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth.api';
import { datUser, dangXuat as dangXuatAction } from '@/store/slices/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { tokenStorage } from '@/utils/token';

// Hook tiện ích cho luồng xác thực: trạng thái user + login/register/logout.
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, daXacThuc, dangKhoiPhuc } = useAppSelector((s) => s.auth);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      const me = await authApi.getMe();
      dispatch(datUser(me));
      return me;
    },
    [dispatch],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authApi.register(payload);
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      const me = await authApi.getMe();
      dispatch(datUser(me));
      return me;
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất; vẫn xóa phiên phía client.
    }
    dispatch(dangXuatAction());
  }, [dispatch]);

  return { user, daXacThuc, dangKhoiPhuc, login, register, logout };
}
