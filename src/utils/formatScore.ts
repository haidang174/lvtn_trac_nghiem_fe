// Format điểm số (Float, có thể về dạng string từ raw query) để hiển thị.
export function formatScore(value: number | string | null | undefined): string {
  const n = Number(value);
  if (Number.isNaN(n)) return '0';
  // Bỏ số 0 thừa: 8 -> "8", 8.50 -> "8.5", 8.25 -> "8.25"
  return String(Math.round(n * 100) / 100);
}
