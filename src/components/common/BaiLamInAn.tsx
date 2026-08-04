import { createPortal } from 'react-dom';
import MathText from '@/components/common/MathText';
import { formatDateTime } from '@/utils/formatDate';
import { formatScore } from '@/utils/formatScore';
import { mssvTuEmail } from '@/utils/bangDiemPhongThi';
import type { BangDiemPhongItem, KetQuaChiTiet } from '@/types/ket-qua.type';
import type { PhongThi } from '@/types/phong-thi.type';

// Một bài làm cần in: dòng bảng điểm (thông tin HS + điểm) ghép với chi tiết
// từng câu lấy từ GET /results/:id.
export interface BaiLamIn {
  hocSinh: BangDiemPhongItem;
  chiTiet: KetQuaChiTiet;
}

interface Props {
  phong: PhongThi;
  dsBaiLam: BaiLamIn[];
}

/**
 * Khung in bài làm học sinh — gắn portal vào <body> với id `vung-in-bai-lam`.
 * Trên màn hình luôn ẩn (CSS ở index.css), chỉ hiện khi trình duyệt in.
 *
 * CỐ Ý không hiển thị đáp án đúng (dù BE có gửi `laDapAnDung` cho GV/Admin):
 * file này để lưu hồ sơ/phúc khảo, không được lộ ngân hàng đề.
 */
export default function BaiLamInAn({ phong, dsBaiLam }: Props) {
  const mhhk = phong.monHocHocKy;
  const tenMon = [mhhk?.monHoc?.tenMonHoc, mhhk?.hocKy?.tenHocKy, mhhk?.hocKy?.namHoc]
    .filter(Boolean)
    .join(' · ');

  return createPortal(
    <div id="vung-in-bai-lam" className="bg-white text-black">
      {dsBaiLam.map((bl, i) => (
        // Bọc mỗi bài làm trong <table>: trình duyệt lặp lại thead/tfoot ở MỌI
        // trang, nên hai dải trống dưới đây chính là lề trên/dưới của từng
        // trang. Cần vậy vì @page margin phải = 0 để bỏ tiêu đề/URL/số trang
        // do trình duyệt tự chèn, mà padding thường chỉ có ở trang đầu/cuối.
        <table key={bl.chiTiet.maKetQua} className={i > 0 ? 'w-full break-before-page' : 'w-full'}>
          <thead>
            <tr>
              <td>
                <div className="h-[12mm]" />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <BaiLamMotEm baiLam={bl} phong={phong} tenMon={tenMon} />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <div className="h-[12mm]" />
              </td>
            </tr>
          </tfoot>
        </table>
      ))}
    </div>,
    document.body,
  );
}

function BaiLamMotEm({
  baiLam,
  phong,
  tenMon,
}: {
  baiLam: BaiLamIn;
  phong: PhongThi;
  tenMon: string;
}) {
  const { hocSinh: hs, chiTiet: ct } = baiLam;

  return (
    <div className="text-[12pt] leading-normal">
      {/* Đầu trang */}
      <div className="text-center">
        <p className="font-bold uppercase">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</p>
        <p className="mt-3 text-[14pt] font-bold uppercase">Bài làm của học sinh</p>
      </div>

      {/* Thông tin bài làm */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 border-y border-black py-2">
        <Dong nhan="Họ và tên" giaTri={hs.tenNguoiDung ?? `#${hs.maNguoiDung}`} />
        <Dong nhan="MSSV" giaTri={mssvTuEmail(hs.email)} />
        <Dong nhan="Email" giaTri={hs.email ?? ''} />
        <Dong nhan="Môn học" giaTri={tenMon} />
        <Dong nhan="Phòng thi" giaTri={phong.tenPhongThi} />
        <Dong nhan="Đề thi" giaTri={hs.tieuDe ?? ''} />
        <Dong nhan="Nộp lúc" giaTri={hs.thoiGianNop ? formatDateTime(hs.thoiGianNop) : ''} />
        <Dong nhan="Số câu đúng" giaTri={`${ct.soCauDung}/${ct.tongSoCau}`} />
        <Dong nhan="Điểm" giaTri={`${formatScore(ct.diemSo)}/10`} />
      </div>

      {/* Danh sách câu hỏi */}
      <div className="mt-4 space-y-4">
        {ct.cauHois.map((c, i) => {
          const daTraLoi = c.luaChons.some((lc) => lc.daChon);
          return (
            <div key={c.maCauHoi} className="break-inside-avoid">
              <p className="font-semibold">
                Câu {i + 1}. <MathText>{c.noiDung}</MathText>
              </p>

              {c.hinhAnh && (
                <img
                  src={c.hinhAnh}
                  alt="Hình minh họa"
                  className="mt-2 max-h-[60mm] border border-black object-contain"
                />
              )}

              {!daTraLoi && (
                <p className="mt-1 italic">Học sinh không trả lời câu này.</p>
              )}

              <ul className="mt-1 space-y-1">
                {c.luaChons.map((lc, j) => (
                  <li
                    key={lc.maLuaChon}
                    // Máy in mặc định không in màu nền -> đánh dấu câu đã chọn
                    // bằng viền + chữ đậm để bản in giấy vẫn thấy rõ.
                    className={
                      lc.daChon
                        ? 'flex gap-2 rounded border border-black px-2 py-1 font-bold'
                        : 'flex gap-2 px-2 py-1'
                    }
                  >
                    <span>{String.fromCharCode(65 + j)}.</span>
                    <span className="flex-1">
                      <MathText>{lc.noiDung}</MathText>
                    </span>
                    {lc.daChon && <span className="whitespace-nowrap">Đã chọn</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dong({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <p>
      <span className="font-semibold">{nhan}:</span> {giaTri || '—'}
    </p>
  );
}
