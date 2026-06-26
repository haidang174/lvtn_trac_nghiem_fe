// Format ngày giờ từ Backend (DATETIME ISO) sang hiển thị tiếng Việt.
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Chuyển giá trị input datetime-local ("YYYY-MM-DDTHH:mm") sang ISO string.
export function localToISO(value: string): string {
  return new Date(value).toISOString();
}

// Chuyển ISO sang định dạng cho input datetime-local (theo giờ địa phương).
export function isoToLocalInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}
