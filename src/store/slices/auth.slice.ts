import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/api/auth.api';
import type { NguoiDung } from '@/types/nguoi-dung.type';
import { tokenStorage } from '@/utils/token';

interface AuthState {
  user: NguoiDung | null;
  // Đang khôi phục phiên (gọi /auth/me lúc mở app) → tránh redirect sớm.
  dangKhoiPhuc: boolean;
  daXacThuc: boolean;
}

const initialState: AuthState = {
  user: null,
  dangKhoiPhuc: true,
  daXacThuc: false,
};

// Khôi phục phiên đăng nhập khi tải lại trang: nếu có token thì lấy /auth/me.
export const khoiPhucPhien = createAsyncThunk('auth/khoiPhucPhien', async () => {
  if (!tokenStorage.getAccessToken()) {
    throw new Error('Chưa đăng nhập');
  }
  return authApi.getMe();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Gọi sau khi login/register thành công (token đã được lưu trước đó).
    datUser: (state, action: PayloadAction<NguoiDung>) => {
      state.user = action.payload;
      state.daXacThuc = true;
      state.dangKhoiPhuc = false;
    },
    dangXuat: (state) => {
      tokenStorage.clear();
      state.user = null;
      state.daXacThuc = false;
      state.dangKhoiPhuc = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(khoiPhucPhien.fulfilled, (state, action) => {
        state.user = action.payload;
        state.daXacThuc = true;
        state.dangKhoiPhuc = false;
      })
      .addCase(khoiPhucPhien.rejected, (state) => {
        tokenStorage.clear();
        state.user = null;
        state.daXacThuc = false;
        state.dangKhoiPhuc = false;
      });
  },
});

export const { datUser, dangXuat } = authSlice.actions;
export default authSlice.reducer;
