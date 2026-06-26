interface Props {
  page: number;
  limit: number;
  total: number;
  onChangePage: (page: number) => void;
}

// Phân trang khớp query ?page=&limit= ở Backend.
export default function Pagination({ page, limit, total, onChangePage }: Props) {
  const tongTrang = Math.max(1, Math.ceil(total / limit));
  if (total === 0) return null;

  const tu = (page - 1) * limit + 1;
  const den = Math.min(page * limit, total);

  // Tạo dải số trang gọn quanh trang hiện tại.
  const cacTrang: number[] = [];
  const batDau = Math.max(1, page - 2);
  const ketThuc = Math.min(tongTrang, page + 2);
  for (let i = batDau; i <= ketThuc; i++) cacTrang.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 py-3 text-sm sm:flex-row">
      <p className="text-gray-500">
        Hiển thị <span className="font-medium text-gray-700">{tu}</span>–
        <span className="font-medium text-gray-700">{den}</span> trên{' '}
        <span className="font-medium text-gray-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChangePage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>
        {batDau > 1 && (
          <>
            <PageBtn so={1} hienTai={page} onClick={onChangePage} />
            {batDau > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {cacTrang.map((so) => (
          <PageBtn key={so} so={so} hienTai={page} onClick={onChangePage} />
        ))}
        {ketThuc < tongTrang && (
          <>
            {ketThuc < tongTrang - 1 && <span className="px-1 text-gray-400">…</span>}
            <PageBtn so={tongTrang} hienTai={page} onClick={onChangePage} />
          </>
        )}
        <button
          onClick={() => onChangePage(page + 1)}
          disabled={page >= tongTrang}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function PageBtn({
  so,
  hienTai,
  onClick,
}: {
  so: number;
  hienTai: number;
  onClick: (p: number) => void;
}) {
  const active = so === hienTai;
  return (
    <button
      onClick={() => onClick(so)}
      className={`min-w-[2.25rem] rounded-lg border px-3 py-1.5 transition ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {so}
    </button>
  );
}
