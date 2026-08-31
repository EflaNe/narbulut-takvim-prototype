import { useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { calendarById, userById } from '../../lib/domain/selectors';
import { shareTargetState } from '../../lib/domain/rules';
import { Drawer } from '../overlay/Drawer';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { Avatar } from '../primitives/Avatar';
import type { UserId } from '../../lib/domain/types';

/**
 * 08 · Takvim Paylaşımı — Takvimlerim → ⋯ → Paylaş ile açılan 520px drawer.
 * Tek paylaşım seviyesi olduğu için izin seçici yoktur (BR-CAL-26).
 */
export function ShareDrawer() {
  const state = useAppState();
  const dispatch = useDispatch();
  const calendarId = state.ui.shareCalendarId!;
  const cal = calendarById(state, calendarId)!;
  const [query, setQuery] = useState('');

  const shared = state.shares
    .filter((s) => s.calendarId === calendarId)
    .map((s) => ({ share: s, user: userById(state, s.granteeId)! }))
    .filter((x) => !!x.user);

  const candidates = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return [];
    return state.users
      .filter((u) => shareTargetState(cal, u, state.shares, 'narbulut') === 'ok')
      .filter((u) => u.name.toLocaleLowerCase('tr-TR').includes(q)
        || u.email.toLocaleLowerCase('tr-TR').includes(q))
      .slice(0, 6);
  }, [query, state.users, state.shares, cal]);

  return (
    <Drawer width={520} eyebrow="Takvimi paylaş"
      onClose={() => dispatch({ type: 'closeShareDrawer' })}
      footer={(
        <>
          <span className="shd__foot">Değişiklikler anında uygulanır</span>
          <span className="spacer" />
          <Button variant="primary" onClick={() => dispatch({ type: 'closeShareDrawer' })}>Bitti</Button>
        </>
      )}>
      <div className="shd__title">{cal.name}</div>
      <div className="shd__owner">senin takvimin</div>

      {/* BR-CAL-38 — zorunlu açıklama */}
      <div className="banner banner--info shd__note">
        <Icon name="info" size={14} />
        <span>
          Bu takvimdeki <strong>mevcut ve gelecekteki</strong> etkinlik detayları paylaştığınız
          kişiler tarafından görülebilir.
          {cal.isDefault && (
            <> Bu sizin <strong>varsayılan takviminizdir</strong>; takvim seçmeden oluşturduğunuz
              yeni etkinlikler de burada yer alır.</>
          )}
        </span>
      </div>

      <div className="shd__section">
        <div className="sectionlabel">Kişi ekle</div>
        <div className="psearch">
          <div className="searchfield" style={{ marginTop: 12 }}>
            <Icon name="search" size={15} color="var(--text-muted)" />
            <input value={query} placeholder="İsim veya e-posta ara" aria-label="Kişi ara"
              onChange={(e) => setQuery(e.target.value)} />
          </div>
          {candidates.length > 0 && (
            <div className="psearch__results" style={{ top: 58 }}>
              {candidates.map((u) => (
                <button key={u.id} onClick={() => {
                  dispatch({ type: 'addShare', calendarId, userId: u.id as UserId });
                  setQuery('');
                }}>
                  <span className="avatar avatar--sm">{u.initials}</span>
                  <span className="n">{u.name}</span>
                  <span className="t">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="shd__hint">Yalnızca kurumunuzdaki kullanıcılar</div>
      </div>

      <div className="shd__section" style={{ paddingBottom: 8 }}>
        <div className="evd__sectionhead">
          <div className="sectionlabel">Paylaşılan kişiler</div>
          <span className="evd__count">{shared.length}</span>
        </div>
        {shared.length === 0 ? (
          <div className="shd__hint" style={{ marginTop: 12 }}>
            Bu takvim henüz kimseyle paylaşılmadı.
          </div>
        ) : shared.map(({ user }) => (
          <div className="shrow" key={user.id}>
            <Avatar user={user} />
            <div style={{ minWidth: 0 }}>
              <div className="shrow__name">{user.name}</div>
              <div className="shrow__mail">{user.email}</div>
            </div>
            <span className="shrow__perm">Etkinlik detaylarını görebilir</span>
            <button className="shrow__remove"
              onClick={() => dispatch({
                type: 'askConfirm',
                confirm: {
                  title: `${user.name} erişimi kaldırılsın mı?`,
                  body: `${cal.name} takvimi bu andan itibaren ${user.name} tarafından görülemez.`,
                  confirmLabel: 'Kaldır', tone: 'destructive',
                  action: { type: 'removeShare', calendarId, userId: user.id },
                },
              })}>Kaldır</button>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
