import type { ReactNode } from 'react';

/**
 * Üç yönetim ekranının ortak kabuğu — D-074.
 *
 * Başlık 88px ve **sabit**: yuvalar boş kalsa da yükseklik ekranlar arası zıplamaz.
 * Alt çubuk **koşulludur**: yalnız kaydedilecek bir taslak varsa render edilir
 * (Odalar·Ayarlar ve İzinler). Karar ekranlarında karar satır içindedir, alt çubuk yoktur.
 */
export function AdminHeader({ title, meta, status, actions }: {
  title: ReactNode;
  /** Başlığın altındaki `·` ile ayrılmış parçalar */
  meta?: ReactNode[];
  /** Sağda okunur durum göstergesi — nokta + etiket (değiştirme formdadır) */
  status?: { label: string; tone: 'active' | 'passive' };
  actions?: ReactNode;
}) {
  const parts = (meta ?? []).filter(Boolean);
  return (
    <header className="ahead">
      <div className="ahead__main">
        <h1 className="ahead__title">{title}</h1>
        {parts.length > 0 && (
          <div className="ahead__meta">
            {parts.map((p, i) => (
              <span key={i} className={i === 0 ? 'ahead__meta1' : undefined}>
                {i > 0 && <span className="ahead__sep" aria-hidden="true">·</span>}
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="spacer" />
      {status && (
        <span className={`ahead__status ahead__status--${status.tone}`}>
          <i aria-hidden="true" />{status.label}
        </span>
      )}
      {actions}
    </header>
  );
}

export function AdminTabs({ tabs, value, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="atabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id}
          className={value === t.id ? 'is-active' : undefined}
          onClick={() => onChange(t.id)}>
          {t.label}
          {!!t.count && <span className="atabs__count">{t.count} bekleyen</span>}
        </button>
      ))}
    </div>
  );
}

/** ⚠️ Yalnız kaydedilecek taslak varsa render edilmelidir (P3). */
export function AdminFooter({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <div className="afoot">
      <span className="afoot__info">{summary}</span>
      <span className="spacer" />
      {children}
    </div>
  );
}
