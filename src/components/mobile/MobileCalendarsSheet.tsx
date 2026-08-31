import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { isCalendarVisible, myCalendars, mySharedCalendars, userById } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import type { CalendarId } from '../../lib/domain/types';

/** 07-A · Takvimler sheet — Takvimlerim / Benimle paylaşılanlar ayrımı. */
export function MobileCalendarsSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [removing, setRemoving] = useState<CalendarId | null>(null);
  const owned = myCalendars(state);
  const shared = mySharedCalendars(state);
  const close = () => dispatch({ type: 'setMobileSheet', sheet: 'none' });

  if (removing) {
    const cal = state.calendars.find((c) => c.id === removing)!;
    const owner = userById(state, cal.ownerId);
    return (
      <>
        <div className="sheet__scrim" onClick={() => setRemoving(null)} />
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Takvimi kaldır">
          <div className="sheet__grabber" />
          <div className="sheet__head">
            <span className="sheet__title">{cal.name}</span>
            <span className="spacer" />
            <IconButton icon="close" label="Kapat" onClick={() => setRemoving(null)} />
          </div>
          <div className="sheet__body">
            <p style={{ margin: '0 0 16px', font: '400 13px/1.55 var(--font)', color: 'var(--text-secondary)' }}>
              {owner?.name} tarafından paylaşıldı. Kaldırırsanız bu takvim listenizden çıkar.
            </p>
            <button className="actionsheet__btn is-destructive"
              onClick={() => { dispatch({ type: 'removeSharedCalendar', calendarId: removing }); setRemoving(null); }}>
              <Icon name="trash" size={15} />Takvimi kaldır
            </button>
            <button className="actionsheet__btn" onClick={() => setRemoving(null)}>Vazgeç</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sheet__scrim" onClick={close} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Takvimler">
        <div className="sheet__grabber" />
        <div className="sheet__head">
          <span className="sheet__title">Takvimler</span>
          <span className="spacer" />
          <IconButton icon="close" label="Kapat" onClick={close} />
        </div>
        <div className="sheet__body">
          <div className="mobsheet__group">Takvimlerim</div>
          {owned.map((cal) => {
            const on = isCalendarVisible(state, cal.id);
            return (
              <button className="mobsheet__row" key={cal.id} aria-pressed={on}
                onClick={() => dispatch({ type: 'toggleCalendar', calendarId: cal.id })}>
                <span className={`calrow__check${on ? ' is-on' : ''}`}
                  style={on ? { background: cal.color } : undefined}>
                  {on && <Icon name="check" size={11} color="#fff" />}
                </span>
                <span className="calrow__dot" style={{ background: on ? cal.color : 'var(--text-off)' }} />
                <span className="mobsheet__name">{cal.name}</span>
              </button>
            );
          })}

          {shared.length > 0 && (
            <>
              <div className="mobsheet__group">Benimle paylaşılanlar</div>
              {shared.map(({ calendar, share }) => {
                const owner = userById(state, calendar.ownerId);
                const on = share.visibleForGrantee;
                return (
                  <div className="mobsheet__row" key={calendar.id}>
                    <button className={`calrow__check${on ? ' is-on' : ''}`} aria-pressed={on}
                      aria-label={`${calendar.name} görünürlüğü`}
                      style={on ? { background: calendar.color } : undefined}
                      onClick={() => dispatch({ type: 'toggleSharedVisibility', calendarId: calendar.id })}>
                      {on && <Icon name="check" size={11} color="#fff" />}
                    </button>
                    <span className="calrow__dot"
                      style={{ background: on ? calendar.color : 'var(--text-off)' }} />
                    <span className="mobsheet__name">{calendar.name}</span>
                    <span className="mobsheet__owner">{owner?.name}</span>
                    <span className="spacer" />
                    <IconButton icon="dots" label={`${calendar.name} seçenekleri`} tone="sm"
                      onClick={() => setRemoving(calendar.id)} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
