import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

function KhungLoi({ ma, tieuDe }: { ma: string; tieuDe: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-primary">{ma}</p>
      <p className="text-lg text-gray-600">{tieuDe}</p>
      <Link to="/">
        <Button variant="outline">Về trang chủ</Button>
      </Link>
    </div>
  );
}

export function ForbiddenPage() {
  return <KhungLoi ma="403" tieuDe="Bạn không có quyền truy cập trang này" />;
}

export function NotFoundPage() {
  return <KhungLoi ma="404" tieuDe="Không tìm thấy trang" />;
}
