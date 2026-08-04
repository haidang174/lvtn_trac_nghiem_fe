import { resultsApi } from '@/api/results.api';
import type { BaiLamIn } from '@/components/common/BaiLamInAn';
import type { BangDiemPhongItem } from '@/types/ket-qua.type';

// Số request chi tiết chạy song song — phòng ~50 em không bắn hết cùng lúc.
const SO_LUONG_SONG_SONG = 4;

// Ảnh hỏng/chậm không được treo nút xuất.
const CHO_ANH_TOI_DA = 8000;

/**
 * Tải chi tiết bài làm của các học sinh ĐÃ THI trong danh sách bảng điểm.
 * Dòng nào lỗi thì bỏ qua (vẫn in được các em còn lại).
 */
export async function taiChiTietBaiLam(
  items: BangDiemPhongItem[],
  onTienDo?: (xong: number, tong: number) => void,
): Promise<BaiLamIn[]> {
  const daThi = items.filter((r) => r.daThi && r.maKetQua != null);
  const ketQua: BaiLamIn[] = [];
  let xong = 0;

  for (let i = 0; i < daThi.length; i += SO_LUONG_SONG_SONG) {
    const lo = daThi.slice(i, i + SO_LUONG_SONG_SONG);
    const chiTiets = await Promise.all(
      lo.map((hs) =>
        resultsApi
          .getResultById(hs.maKetQua as number)
          .then((ct) => ({ hocSinh: hs, chiTiet: ct }))
          .catch(() => null),
      ),
    );
    for (const bl of chiTiets) if (bl) ketQua.push(bl);
    xong += lo.length;
    onTienDo?.(xong, daThi.length);
  }

  return ketQua;
}

// Chờ React vẽ xong portal (2 khung hình cho chắc) trước khi đo/đợi ảnh.
function choVeXong(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

// Chờ mọi ảnh trong vùng in tải xong, quá hạn thì in luôn phần đã có.
function choAnhTaiXong(vung: HTMLElement): Promise<void> {
  const anhs = Array.from(vung.querySelectorAll('img'));
  const chuaXong = anhs.filter((img) => !img.complete);
  if (chuaXong.length === 0) return Promise.resolve();

  const tatCa = Promise.all(
    chuaXong.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);

  const hetGio = new Promise<void>((resolve) =>
    setTimeout(resolve, CHO_ANH_TOI_DA),
  );
  return Promise.race([tatCa, hetGio]);
}

/**
 * Mở hộp thoại in cho vùng `#vung-in-bai-lam` (người dùng chọn "Lưu thành PDF").
 * `tenFile` được gán tạm vào document.title vì trình duyệt lấy title làm tên
 * file PDF mặc định.
 */
export async function inVungBaiLam(tenFile: string): Promise<void> {
  await choVeXong();

  const vung = document.getElementById('vung-in-bai-lam');
  if (!vung) return;
  await choAnhTaiXong(vung);

  const tieuDeCu = document.title;
  document.title = tenFile;

  // Hầu hết trình duyệt chặn luồng tới khi đóng hộp thoại in, nhưng vẫn chờ
  // thêm sự kiện `afterprint` để nơi gọi không gỡ vùng in quá sớm.
  await new Promise<void>((resolve) => {
    let xongRoi = false;
    const ketThuc = () => {
      if (xongRoi) return;
      xongRoi = true;
      window.removeEventListener('afterprint', ketThuc);
      document.title = tieuDeCu;
      resolve();
    };
    window.addEventListener('afterprint', ketThuc);
    try {
      window.print();
    } finally {
      // Trình duyệt không bắn `afterprint` -> tự khôi phục sau một nhịp ngắn.
      setTimeout(ketThuc, 500);
    }
  });
}
