import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  children: ReactNode;
  style?: React.CSSProperties;
  label: string;
}

/** Basit hafif menü — dışarı tıklama ve Esc ile kapanır. */
export function Menu({ onClose, children, style, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    // tıklama yayılımı bittikten sonra bağla — açan tıklamayı yakalamasın
    const id = window.setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="menu" role="menu" aria-label={label} style={style}>
      {children}
    </div>
  );
}
