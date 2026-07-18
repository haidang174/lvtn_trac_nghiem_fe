// Bỏ dấu tiếng Việt + thay khoảng trắng bằng '-' để làm tên file an toàn.
export function slugTen(ten: string): string {
  return ten
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
