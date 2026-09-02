import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { myNotifications, unreadNotificationCount } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { Menu } from '../primitives/Menu';
import type { NotificationKind } from '../../lib/domain/types';

/** Bildirim kodunun ait olduğu aile — `19-notifications-spec.md` gruplaması. */
const family: Record<string, { label: string; color: string }> = {
  'N-EVT': { label: 'Etkinlik', color: 'var(--cal-ekip)' },
  'N-SER': { label: 'Seri', color: 'var(--cal-proje)' },
  'N-CAL': { label: 'Paylaşım', color: 'var(--cal-urun)' },
  'N-RES': { label: 'Rezervasyon', color: 'var(--warning)' },
};

const familyOf = (k: NotificationKind) => family[k.slice(0, 5)] ?? family['N-EVT'];

/**
 * Uygulama içi bildirim yüzeyi.
 * ⚠️ `19-notifications-spec.md` bu yüzeyi **platform bileşeni** sayıp kapsam dışı bırakmıştı;
 * prototipte üretilen olayların doğrulanabilmesi için minimum karşılığı burada duruyor
 * (SR-NOT-09). Yeni bildirim türü üretmez — yalnız reducer'ın ürettiklerini gösterir.
 */
export function NotificationBell() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const items = myNotifications(state);
  const unread = unreadNotificationCount(state);

  // Dispatch, setState güncelleyicisinin dışında olmalı — aksi hâlde
  // başka bir bileşen render edilirken durum güncellenmiş olur.
  const toggle = () => {
    if (!open && unread > 0) dispatch({ type: 'markNotificationsRead' });
    setOpen((o) => !o);
  };

  return (
    <div className="bell">
      <button className="bell__btn" aria-haspopup="menu" aria-expanded={open}
        aria-label={unread ? `Bildirimler — ${unread} okunmamış` : 'Bildirimler'}
        onClick={toggle}>
        <Icon name="bell" size={16} />
        {unread > 0 && <span className="bell__dot">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <Menu label="Bildirimler" style={{ top: 42, right: 0, width: 340, padding: 0 }}
          onClose={() => setOpen(false)}>
          <div className="bell__head">Bildirimler</div>
          {items.length === 0 ? (
            <div className="bell__empty">
              Henüz bildiriminiz yok.<br />
              Bir takvim paylaşıldığında veya rezervasyon kararı verildiğinde burada görünür.
            </div>
          ) : (
            <div className="bell__list">
              {items.map((n) => {
                const f = familyOf(n.kind);
                return (
                  <div className="bell__item" key={n.id}>
                    <span className="bell__kind" style={{ background: f.color }} aria-hidden="true" />
                    <span style={{ minWidth: 0 }}>
                      <span className="bell__title">{n.title}</span>
                      <span className="bell__body">{n.body}</span>
                      <span className="bell__meta">{f.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Menu>
      )}
    </div>
  );
}
