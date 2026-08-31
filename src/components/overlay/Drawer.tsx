import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { IconButton } from '../primitives/IconButton';

interface Props {
  width: number;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  headExtra?: ReactNode;
  labelledBy?: string;
  dimmed?: boolean;
}

export function Drawer({ width, eyebrow, onClose, children, footer, headExtra, labelledBy, dimmed }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {!dimmed && <div className="scrim" onClick={onClose} />}
      <aside className={`drawer${dimmed ? ' is-behind' : ''}`} style={{ width }}
        aria-hidden={dimmed || undefined} role="dialog" aria-modal="true"
        aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : eyebrow}>
        <div className="drawer__head">
          <span className="drawer__eyebrow">{eyebrow}</span>
          <span className="spacer" />
          {headExtra}
          <IconButton icon="close" label="Kapat" onClick={onClose} />
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </>
  );
}
