import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { calendarById, decidableRequests, searchEvents, userById } from '../../lib/domain/selectors';
import { hhmm, longDateLabel, stepLabel, viewRangeLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import { Button } from '../primitives/Button';
import { NotificationBell } from '../shell/NotificationBell';
import type { CalendarViewMode } from '../../lib/domain/types';

/** Zaman ekseni. */
const timeModes: { id: CalendarViewMode; label: string }[] = [
  { id: 'day', label: 'Gün' },
  { id: 'week', label: 'Hafta' },
  { id: 'month', label: 'Ay' },
];
/** Kaynak ekseni — zaman ekseniyle aynı listede sunulmaz (BR-SHELL-30, `UX-11`). */
const resourceModes: { id: CalendarViewMode; label: string }[] = [
  { id: 'byRoom', label: 'Odalara göre' },
];

export function TopBar() {
  const state = useAppState();
  const dispatch = useDispatch();
  const results = searchEvents(state, state.ui.searchQuery);

  return (
    <header className="topbar">
      <span className="topbar__range">
        {viewRangeLabel(state.ui.anchorDate, state.ui.viewMode)}
      </span>
      <div className="topbar__nav">
        <IconButton icon="chevronLeft" label={`Önceki ${stepLabel(state.ui.viewMode)}`}
          onClick={() => dispatch({ type: 'shiftView', delta: -1 })} />
        <IconButton icon="chevronRight" label={`Sonraki ${stepLabel(state.ui.viewMode)}`}
          onClick={() => dispatch({ type: 'shiftView', delta: 1 })} />
      </div>
      <span className="spacer" />

      <div className="segmented" role="tablist" aria-label="Görünüm">
        <span className="segmented__group" role="none" aria-label="Zaman ekseni">
          {timeModes.map((m) => (
            <button key={m.id} role="tab" aria-selected={state.ui.viewMode === m.id}
              className={state.ui.viewMode === m.id ? 'is-active' : undefined}
              onClick={() => dispatch({ type: 'setViewMode', mode: m.id })}>
              {m.label}
            </button>
          ))}
        </span>
        <span className="segmented__divider" aria-hidden="true" />
        <span className="segmented__group" role="none" aria-label="Kaynak ekseni">
          {resourceModes.map((m) => (
            <button key={m.id} role="tab" aria-selected={state.ui.viewMode === m.id}
              className={state.ui.viewMode === m.id ? 'is-active' : undefined}
              onClick={() => dispatch({ type: 'setViewMode', mode: m.id })}>
              {m.label}
            </button>
          ))}
        </span>
      </div>

      <div className="topsearch">
        <Icon name="search" size={15} />
        <input value={state.ui.searchQuery} placeholder="Etkinlik ara" aria-label="Etkinlik ara"
          onChange={(e) => dispatch({ type: 'setSearch', query: e.target.value })} />
        {state.ui.searchQuery.trim() && (
          <div className="searchresults" role="listbox" aria-label="Arama sonuçları">
            <div className="searchresults__meta">
              {results.length ? `${results.length} sonuç` : 'Sonuç bulunamadı'}
            </div>
            {results.map((e) => {
              const cal = calendarById(state, e.calendarId);
              const shared = cal && cal.ownerId !== state.currentUserId;
              const owner = cal ? userById(state, cal.ownerId) : undefined;
              return (
                <button key={e.id} role="option" aria-selected={false}
                  onClick={() => {
                    dispatch({ type: 'setAnchorDate', date: e.date });
                    dispatch({ type: 'setSearch', query: '' });
                    dispatch(shared
                      ? { type: 'openReadOnlyEvent', eventId: e.id }
                      : { type: 'openEventEdit', eventId: e.id });
                  }}>
                  <span className="searchresults__title">{e.title}</span>
                  <span className="searchresults__sub">
                    {longDateLabel(e.date)} · {hhmm(e.start)} · {cal?.name}
                    {shared && owner ? ` · ${owner.name}'ın takvimi` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Karar bekleyen iş, bildirimden ayrıdır: okunsa da kaybolmaz. */}
      {decidableRequests(state).length > 0 && (
        <button className="pendingbadge"
          onClick={() => dispatch({ type: 'navigate', route: 'requests' })}
          aria-label={`${decidableRequests(state).length} talep onayınızı bekliyor`}>
          <Icon name="clock" size={14} />
          {decidableRequests(state).length} talep
        </button>
      )}

      <NotificationBell />

      <Button variant="primary" onClick={() => dispatch({ type: 'openEventCreate' })}>
        <Icon name="plusBold" size={15} color="#fff" />Yeni etkinlik
      </Button>
    </header>
  );
}
