import { useState } from 'react';
import { useAppState, useDispatch, useCurrentUser } from '../../lib/state/StoreContext';
import { userById } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { Menu } from '../primitives/Menu';
import { PERSONAS } from './personas';

/**
 * Sol rail'in altındaki persona satırı.
 * ⚠️ Ürün arayüzünün parçası değildir — DEMO etiketiyle açıkça ayrılmıştır.
 * Persona değişimi **demo verisini korur**, böylece onay akışı uçtan uca test edilebilir.
 */
export function PersonaSwitcher() {
  const state = useAppState();
  const dispatch = useDispatch();
  const me = useCurrentUser();
  const [open, setOpen] = useState(false);
  const color = PERSONAS.find((p) => p.id === me.id)?.color ?? 'var(--text-secondary)';

  return (
    <div className="personarow">
      <div className="personarow__tag">DEMO</div>
      <button className="personarow__btn" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <span className="personarow__av" style={{ background: color }}>{me.initials}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="personarow__name" style={{ display: 'block' }}>{me.name}</span>
          <span className="personarow__role" style={{ display: 'block' }}>{me.title}</span>
        </span>
        <span style={{ color: 'var(--text-faint)', display: 'flex' }}>
          <Icon name="chevronDown" size={14} />
        </span>
      </button>

      {open && (
        <Menu label="Persona değiştir" style={{ bottom: 46, left: 8, right: 8 }}
          onClose={() => setOpen(false)}>
          <div className="menu__hint">Veriler korunur — persona değişince kaybolmaz.</div>
          {PERSONAS.map((p) => {
            const u = userById(state, p.id);
            if (!u) return null;
            return (
              <button key={p.id} onClick={() => { dispatch({ type: 'setPersona', userId: p.id }); setOpen(false); }}>
                <span className="personarow__av" style={{ background: p.color, width: 22, height: 22, fontSize: 9 }}>
                  {u.initials}
                </span>
                {u.name}
                {u.id === me.id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--brand)', display: 'flex' }}>
                    <Icon name="check" size={13} />
                  </span>
                )}
              </button>
            );
          })}
          <div className="menu__sep" />
          <button onClick={() => { dispatch({ type: 'signOut' }); setOpen(false); }}>
            <Icon name="arrowRight" size={14} />Giriş ekranına dön
          </button>
        </Menu>
      )}
    </div>
  );
}
