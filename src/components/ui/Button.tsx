import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  dangTai?: boolean;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

export default function Button({
  variant = 'primary',
  dangTai = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || dangTai}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${
        variantClass[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {dangTai && <Spinner size={16} className="border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
