import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// Hook typed thay cho useDispatch/useSelector mặc định.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
