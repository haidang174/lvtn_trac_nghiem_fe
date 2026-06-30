import { useMemo } from 'react';
import katex from 'katex';

// Một đoạn nội dung sau khi tách: chữ thường, công thức inline ($...$) hoặc khối ($$...$$).
type Phan = { loai: 'text' | 'inline' | 'block'; noiDung: string };

// Tách chuỗi thành các đoạn chữ và công thức LaTeX bọc trong $...$ hoặc $$...$$.
function phanTichLatex(input: string): Phan[] {
  const ket: Phan[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    if (m.index > last) ket.push({ loai: 'text', noiDung: input.slice(last, m.index) });
    if (m[1] !== undefined) ket.push({ loai: 'block', noiDung: m[1] });
    else ket.push({ loai: 'inline', noiDung: m[2] });
    last = re.lastIndex;
  }
  if (last < input.length) ket.push({ loai: 'text', noiDung: input.slice(last) });
  return ket;
}

// Render an toàn: lỗi cú pháp LaTeX không làm vỡ trang, chỉ hiển thị màu đỏ tại chỗ.
function renderKatex(tex: string, block: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: block,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    return tex;
  }
}

interface Props {
  // Nội dung có thể lẫn chữ và công thức LaTeX trong $...$ / $$...$$.
  children: string;
  className?: string;
}

/**
 * Hiển thị một đoạn văn bản có lẫn công thức LaTeX (KaTeX).
 * Phần chữ giữ nguyên (kể cả xuống dòng nếu cha có `whitespace-pre-wrap`).
 */
export default function MathText({ children, className }: Props) {
  const phans = useMemo(() => phanTichLatex(children ?? ''), [children]);
  return (
    <span className={className}>
      {phans.map((p, i) =>
        p.loai === 'text' ? (
          <span key={i}>{p.noiDung}</span>
        ) : (
          <span
            key={i}
            // KaTeX trả về HTML đã được nó tự escape phần text bên trong công thức.
            dangerouslySetInnerHTML={{ __html: renderKatex(p.noiDung, p.loai === 'block') }}
          />
        ),
      )}
    </span>
  );
}
