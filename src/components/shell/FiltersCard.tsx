import { useState } from 'react';
import { Icon } from '../primitives/Icon';

/** Filtreler kartı — canonical 01'de görsel durum; prototipte açılır/kapanır. */
export function FiltersCard() {
  const [open, setOpen] = useState(true);
  return (
    <section className="filters" aria-label="Filtreler">
      <button className="filters__head" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <span className="callist__title">Filtreler</span>
        <span className="spacer" />
        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={15} />
        </span>
      </button>
      {open && (
        <>
          <div className="filters__row">
            <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
              <Icon name="plusCircle" size={14} />
            </span>
            <span className="filters__label">Etkinlik türü</span>
            <span className="spacer" />
            <span className="filters__value">Tümü</span>
            <span style={{ color: 'var(--text-faint)', display: 'flex' }}>
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
          <div className="filters__row">
            <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
              <Icon name="person" size={14} />
            </span>
            <span className="filters__label">Katılımcı</span>
            <span className="spacer" />
            <span className="filters__value">Tümü</span>
            <span style={{ color: 'var(--text-faint)', display: 'flex' }}>
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
        </>
      )}
    </section>
  );
}
