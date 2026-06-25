interface Props {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 24, className = '' }: Props) {
  return (
    <span
      role="status"
      aria-label="Đang tải"
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-primary ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
