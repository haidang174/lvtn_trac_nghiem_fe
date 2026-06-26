import type { ReactNode } from 'react';

export type MauBadge = 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'purple';

interface Props {
  mau: MauBadge;
  children: ReactNode;
}

const lopMau: Record<MauBadge, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
};

// Nhãn trạng thái, đổi màu theo enum trạng thái (dùng cùng các map ở từng module).
export default function StatusBadge({ mau, children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${lopMau[mau]}`}
    >
      {children}
    </span>
  );
}
