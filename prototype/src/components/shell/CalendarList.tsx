import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { isCalendarVisible, myCalendars, mySharedCalendars, userById } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { Menu } from '../primitives/Menu';
import type { Calendar, CalendarId } from '../../lib/domain/types';

/** Takvimlerim — sahip olunan takvimler + "Reddedilenler" görünürlük anahtarı. */
export function OwnedCalendarList() {
  const state = useAppState();
  const dispatch = useDispatch();
  const cals = myCalendars(state);
  const menuId = state.ui.calendarMenuId;

  return (
    <section className="callist" aria-label="Takvimlerim">
      <div className="callist__head">
        <span className="callist__title">Takvimlerim</span>
        <span className="spacer" />
        <button className="callist__add" aria-label="Takvim ekle" title="Takvim ekle"
          onClick={() => dispatch({ type: 'openCalendarForm', mode: 'create' })}>
          <Icon name="plus" size={14} />
        </button>
      </div>

      {cals.map((cal) => (
        <CalendarRow key={cal.id} cal={cal} menuOpen={menuId === cal.id} />
      ))}

      {/* Reddedilen rezervasyonları göster/gizle — pseudo takvim satırı */}
      <div className="calrow">
        <button className={`calrow__check${state.ui.showRejected ? ' is-on' : ''}`}
          style={state.ui.showRejected ? { background: 'var(--text-off)' } : undefined}
          role="switch" aria-checked={state.ui.showRejected} aria-label="Reddedilenler"
          onClick={() => dispatch({ type: 'toggleRejected' })}>
          {state.ui.showRejected && <Icon name="check" size={11} color="#fff" />}
        </button>
        <span className="calrow__dot" style={{ background: 'var(--text-off)' }} aria-hidden="true" />
        <span className="calrow__name is-off">Reddedilenler</span>
        <span className="spacer" />
      </div>
    </section>
  );
}

function CalendarRow({ cal, menuOpen }: { cal: Calendar; menuOpen: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const visible = isCalendarVisible(state, cal.id);
  // BR-CAL-41 — paylaşılmış takvim satırda görünür bir iz taşır ve paylaşım yüzeyine götürür.
  const shareCount = state.shares.filter((s) => s.calendarId === cal.id).length;

  return (
    <div className="calrow" style={{ position: 'relative' }}>
      <button className={`calrow__check${visible ? ' is-on' : ''}`}
        style={visible ? { background: cal.color } : undefined}
        role="switch" aria-checked={visible} aria-label={`${cal.name} görünürlüğü`}
        onClick={() => dispatch({ type: 'toggleCalendar', calendarId: cal.id })}>
        {visible && <Icon name="check" size={11} color="#fff" />}
      </button>
      <span className="calrow__dot" style={{ background: visible ? cal.color : 'var(--text-off)' }} aria-hidden="true" />
      <span className={`calrow__name${visible ? '' : ' is-off'}`}>{cal.name}</span>
      {shareCount > 0 && (
        <button className="calrow__shared" title={`${shareCount} kişiyle paylaşıldı — paylaşımı yönet`}
          aria-label={`${cal.name}: ${shareCount} kişiyle paylaşıldı, paylaşımı yönet`}
          onClick={() => dispatch({ type: 'openShareDrawer', calendarId: cal.id })}>
          <Icon name="share" size={11} />{shareCount}
        </button>
      )}
      <span className="spacer" />
      <button className="calrow__dots" aria-label={`${cal.name} seçenekleri`} aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => dispatch({ type: 'setCalendarMenu', calendarId: menuOpen ? null : cal.id })}>
        <Icon name="dots" size={14} />
      </button>

      {menuOpen && (
        <Menu label={`${cal.name} seçenekleri`} style={{ top: 30, right: 4 }}
          onClose={() => dispatch({ type: 'setCalendarMenu', calendarId: null })}>
          <button onClick={() => dispatch({
            type: 'openCalendarForm', mode: 'edit', calendarId: cal.id, focus: 'name',
          })}>
            <Icon name="pencil" size={14} />Yeniden adlandır
          </button>
          <button onClick={() => dispatch({
            type: 'openCalendarForm', mode: 'edit', calendarId: cal.id, focus: 'color',
          })}>
            <Icon name="palette" size={14} />Rengi değiştir
          </button>
          <button onClick={() => dispatch({ type: 'openShareDrawer', calendarId: cal.id })}>
            <Icon name="share" size={14} />Paylaş
          </button>
          <div className="menu__sep" />
          <button className="is-destructive" disabled={cal.isDefault}
            onClick={() => dispatch({ type: 'askDeleteCalendar', calendarId: cal.id })}>
            <Icon name="trash" size={14} />Sil
          </button>
          {cal.isDefault && <div className="menu__hint">Varsayılan takvim silinemez.</div>}
        </Menu>
      )}
    </div>
  );
}

/** Benimle paylaşılanlar — BR-CAL-30/32/34. */
export function SharedCalendarList() {
  const state = useAppState();
  const dispatch = useDispatch();
  const shared = mySharedCalendars(state);
  if (!shared.length) return null;

  return (
    <section className="callist" aria-label="Benimle paylaşılanlar">
      <div className="callist__head">
        <span className="callist__title">Benimle paylaşılanlar</span>
        <span className="spacer" />
        <span className="callist__count">{shared.length}</span>
      </div>
      {shared.map(({ calendar, share }) => {
        const owner = userById(state, calendar.ownerId);
        const visible = share.visibleForGrantee && isCalendarVisible(state, calendar.id);
        const menuOpen = state.ui.sharedMenuId === calendar.id;
        return (
          <div className="calrow" key={calendar.id} style={{ position: 'relative' }}>
            <button className={`calrow__check${visible ? ' is-on' : ''}`}
              style={visible ? { background: calendar.color } : undefined}
              role="switch" aria-checked={visible} aria-label={`${calendar.name} görünürlüğü`}
              onClick={() => dispatch({ type: 'toggleSharedVisibility', calendarId: calendar.id })}>
              {visible && <Icon name="check" size={11} color="#fff" />}
            </button>
            <span className="calrow__dot"
              style={{ background: visible ? calendar.color : 'var(--text-off)' }} aria-hidden="true" />
            <span className={`calrow__name${visible ? '' : ' is-off'}`}>{calendar.name}</span>
            <span className={`calrow__owner${visible ? '' : ' is-off'}`}>{owner?.name}</span>
            <span className="spacer" />
            <button className="calrow__dots calrow__dots--hover" aria-label={`${calendar.name} seçenekleri`}
              aria-haspopup="menu" aria-expanded={menuOpen}
              onClick={() => dispatch({ type: 'setSharedMenu', calendarId: menuOpen ? null : calendar.id })}>
              <Icon name="dots" size={14} />
            </button>
            {menuOpen && (
              <Menu label={`${calendar.name} seçenekleri`} style={{ top: 30, right: 4 }}
                onClose={() => dispatch({ type: 'setSharedMenu', calendarId: null })}>
                <button className="is-destructive" onClick={() => dispatch({
                  type: 'askConfirm',
                  confirm: {
                    title: 'Takvimi kaldır',
                    body: `${calendar.name} takvimi sol menünüzden kaldırılacak. ${owner?.name} yeniden paylaşana kadar bu takvimi göremezsiniz.`,
                    confirmLabel: 'Kaldır', tone: 'destructive',
                    action: { type: 'removeSharedCalendar', calendarId: calendar.id as CalendarId },
                  },
                })}>
                  <Icon name="trash" size={14} />Takvimi kaldır
                </button>
              </Menu>
            )}
          </div>
        );
      })}
    </section>
  );
}
