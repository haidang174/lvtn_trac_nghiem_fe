import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  loi?: string;
  options: SelectOption[];
  // Placeholder hiển thị như một option rỗng ở đầu (vd "-- Tất cả --").
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, loi, options, placeholder, className = '', id, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`input-base bg-white ${loi ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loi && <p className="text-xs text-red-500">{loi}</p>}
    </div>
  );
});

export default Select;
