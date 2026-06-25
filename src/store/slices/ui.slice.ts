import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type LoaiToast = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  loai: LoaiToast;
  noiDung: string;
}

interface UiState {
  dangTai: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  dangTai: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    datDangTai: (state, action: PayloadAction<boolean>) => {
      state.dangTai = action.payload;
    },
    themToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.toasts.push(action.payload);
      },
      prepare: (loai: LoaiToast, noiDung: string) => ({
        payload: { id: nanoid(), loai, noiDung },
      }),
    },
    xoaToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { datDangTai, themToast, xoaToast } = uiSlice.actions;
export default uiSlice.reducer;
