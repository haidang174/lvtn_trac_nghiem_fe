import { useState } from 'react';
import MathText from './MathText';

/**
 * Một ký hiệu / mẫu công thức.
 * - `nhan`: LaTeX dùng để hiển thị trên nút bấm (render bằng KaTeX).
 * - `chen`: LaTeX sẽ chèn vào nội dung (KHÔNG kèm dấu $, form tự bọc lại).
 *           Ký tự `|` (nếu có) đánh dấu vị trí con trỏ sau khi chèn.
 * - `ten`: chú thích tiếng Việt (tooltip).
 */
export interface KyHieu {
  nhan: string;
  chen: string;
  ten?: string;
}

interface NhomKyHieu {
  ten: string;
  kyHieus: KyHieu[];
}

// `k` = ký hiệu đơn (nhãn trùng nội dung chèn). `t` = mẫu có vị trí con trỏ `|`.
const k = (nhan: string, ten?: string): KyHieu => ({ nhan, chen: nhan, ten });
const t = (nhan: string, chen: string, ten?: string): KyHieu => ({ nhan, chen, ten });

const NHOM_KY_HIEU: NhomKyHieu[] = [
  {
    ten: 'Hy Lạp',
    kyHieus: [
      k('\\alpha', 'alpha'),
      k('\\beta', 'beta'),
      k('\\gamma', 'gamma'),
      k('\\delta', 'delta'),
      k('\\varepsilon', 'epsilon'),
      k('\\theta', 'theta'),
      k('\\lambda', 'lambda'),
      k('\\mu', 'mu'),
      k('\\pi', 'pi'),
      k('\\rho', 'rho'),
      k('\\sigma', 'sigma'),
      k('\\tau', 'tau'),
      k('\\varphi', 'phi'),
      k('\\omega', 'omega'),
      k('\\Delta', 'Delta hoa'),
      k('\\Sigma', 'Sigma hoa'),
      k('\\Omega', 'Omega hoa'),
      k('\\Phi', 'Phi hoa'),
    ],
  },
  {
    ten: 'Toán tử & quan hệ',
    kyHieus: [
      k('\\le', 'nhỏ hơn hoặc bằng'),
      k('\\ge', 'lớn hơn hoặc bằng'),
      k('\\ne', 'khác'),
      k('\\approx', 'xấp xỉ'),
      k('\\equiv', 'đồng dư / tương đương'),
      k('\\pm', 'cộng trừ'),
      k('\\mp', 'trừ cộng'),
      k('\\times', 'nhân'),
      k('\\div', 'chia'),
      k('\\cdot', 'nhân chấm'),
      k('\\propto', 'tỉ lệ với'),
      k('\\infty', 'vô cực'),
      k('\\in', 'thuộc'),
      k('\\notin', 'không thuộc'),
      k('\\subset', 'tập con'),
      k('\\cup', 'hợp'),
      k('\\cap', 'giao'),
      k('\\forall', 'với mọi'),
      k('\\exists', 'tồn tại'),
      k('\\to', 'mũi tên'),
      k('\\Rightarrow', 'suy ra'),
      k('\\Leftrightarrow', 'tương đương'),
    ],
  },
  {
    ten: 'Cấu trúc',
    kyHieus: [
      t('x^{2}', 'x^{|}', 'lũy thừa'),
      t('x_{i}', 'x_{|}', 'chỉ số dưới'),
      t('\\frac{a}{b}', '\\frac{|}{}', 'phân số'),
      t('\\sqrt{x}', '\\sqrt{|}', 'căn bậc hai'),
      t('\\sqrt[n]{x}', '\\sqrt[|]{}', 'căn bậc n'),
      t('\\vec{a}', '\\vec{|}', 'vector'),
      t('\\overline{x}', '\\overline{|}', 'gạch trên'),
      t('\\hat{x}', '\\hat{|}', 'mũ ^'),
      t('\\left| x \\right|', '\\left|  |  \\right|', 'giá trị tuyệt đối'),
      t('\\binom{n}{k}', '\\binom{|}{}', 'tổ hợp'),
    ],
  },
  {
    ten: 'Giải tích',
    kyHieus: [
      t('\\sum_{i=1}^{n}', '\\sum_{|}^{}', 'tổng sigma'),
      t('\\prod_{i=1}^{n}', '\\prod_{|}^{}', 'tích'),
      t('\\int_{a}^{b}', '\\int_{|}^{}', 'tích phân'),
      k('\\oint', 'tích phân đường'),
      t('\\lim_{x \\to 0}', '\\lim_{|}', 'giới hạn'),
      t('\\frac{d}{dx}', '\\frac{d}{d|}', 'đạo hàm'),
      k('\\partial', 'đạo hàm riêng'),
      k('\\nabla', 'nabla'),
    ],
  },
  {
    ten: 'Vật lý & Hóa',
    kyHieus: [
      t('^{\\circ}', '^{\\circ}|', 'độ (góc/nhiệt)'),
      t('\\Delta x', '\\Delta |', 'biến thiên'),
      t('\\frac{\\Delta v}{\\Delta t}', '\\frac{\\Delta |}{\\Delta }', 'tỉ lệ biến thiên'),
      t('v_{0}', 'v_{|}', 'vận tốc đầu'),
      t('\\text{m/s}^2', '\\text{m/s}^2|', 'gia tốc'),
      t('\\vec{F}', '\\vec{|}', 'lực'),
      t('H_{2}O', 'H_{2}O|', 'nước'),
      t('CO_{2}', 'CO_{2}|', 'cacbonic'),
      k('\\rightleftharpoons', 'phản ứng thuận nghịch'),
      t('x \\cdot 10^{n}', '10^{|}', 'lũy thừa 10'),
    ],
  },
];

interface Props {
  // Được gọi với LaTeX cần chèn (chưa bọc $), giữ nguyên ký tự con trỏ `|` nếu có.
  onChon: (chen: string) => void;
}

/** Bảng chọn ký hiệu Toán / Lý / Hóa, bấm vào sẽ chèn LaTeX tương ứng. */
export default function MathSymbolPicker({ onChon }: Props) {
  const [nhomIdx, setNhomIdx] = useState(0);
  const nhom = NHOM_KY_HIEU[nhomIdx];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {NHOM_KY_HIEU.map((n, i) => (
          <button
            key={n.ten}
            type="button"
            onClick={() => setNhomIdx(i)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              i === nhomIdx
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {n.ten}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {nhom.kyHieus.map((ky) => (
          <button
            key={ky.nhan}
            type="button"
            title={ky.ten}
            onClick={() => onChon(ky.chen)}
            className="flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-800 transition hover:border-primary hover:bg-primary/10"
          >
            <MathText>{`$${ky.nhan}$`}</MathText>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Bấm để chèn vào ô vừa chọn (nội dung câu hỏi hoặc lựa chọn). Mỗi ký hiệu được bọc trong{' '}
        <code>$…$</code>.
      </p>
    </div>
  );
}
