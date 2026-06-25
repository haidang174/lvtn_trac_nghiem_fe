import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  loi?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, loi, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input-base ${loi ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
        {...rest}
      />
      {loi && <p className="text-xs text-red-500">{loi}</p>}
    </div>
  );
});

export default Input;
