import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, eventsForDate, isCalendarVisible, isSharedEvent, myCalendars,
  mySharedCalendars, pendingRequests, reservationStatusForEvent, roomById, userById,
} from '../../lib/domain/selectors';
import {
  DAY_NAMES_LONG, DAY_NAMES_MINI, MONTH_NAMES, addDays, dayOfMonth, fromIso, isWeekend,
  timeRangeLabel, weekDates, weekdayIndex,
} from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import { MobileCalendarsSheet } from './MobileCalendarsSheet';
import { MobileEventSheet } from './MobileEventSheet';

/** 07 · Mobil — agenda/day. Masaüstü hafta ızgarası küçültülmez. */
export function MobileApp() {
  const state = useAppState();
  const dispatch = useDispatch();
  const date = state.ui.mobileDate;
  const d = fromIso(date);
  const days = weekDates(date);
  const events = eventsForDate(state, date);
  const pending = pendingRequests(state).filter((r) => r.requesterId === state.currentUserId);
  const nextDate = addDays(date, 1);
  const nextCount = eventsForDate(state, nextDate).length;

  return (
    <div className="mob">
      <div className="mob__top">
        <div className="mob__hero">
          <span className="blob" aria-hidden="true" />
          <div className="mob__dow">{DAY_NAMES_LONG[weekdayIndex(date)]}</div>
          <div className="mob__dayrow">
            <span className="mob__day">{d.getDate()}</span>
            <span className="mob__month">{MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</span>
          </div>
          <div className="mob__heroactions">
            <button className="mob__today" onClick={() => dispatch({ type: 'goToday' })}>Bugün</button>
            <span className="spacer" />
            <button className="mob__calbtn"
              onClick={() => dispatch({ type: 'setMobileSheet', sheet: 'calendars' })}>
              <Icon name="list" size={14} />Takvimler
            </button>
            <IconButton icon="chevronLeft" label="Önceki gün" tone="onBrand"
              onClick={() => dispatch({ type: 'setMobileDate', date: addDays(date, -1) })} />
            <IconButton icon="chevronRight" label="Sonraki gün" tone="onBrand"
              onClick={() => dispatch({ type: 'setMobileDate', date: addDays(date, 1) })} />
          </div>
        </div>

        <div className="mob__strip">
          {days.map((dt) => (
            <button key={dt}
              className={`mob__stripday${dt === date ? ' is-active' : ''}${isWeekend(dt) ? ' is-weekend' : ''}`}
              aria-pressed={dt === date} aria-label={dt}
              onClick={() => dispatch({ type: 'setMobileDate', date: dt })}>
              <span className="mob__stripdow">{DAY_NAMES_MINI[weekdayIndex(dt)]}</span>
              <span className="mob__stripnum">{dayOfMonth(dt)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mob__list">
        {pending.length > 0 && (
          <button className="mob__banner"
            onClick={() => dispatch({ type: 'navigate', route: 'requests' })}>
            <Icon name="clock" size={16} color="var(--warning)" />
            <span>{pending.length} talebiniz onay bekliyor</span>
            <span className="spacer" />
            <Icon name="chevronRight" size={14} color="var(--warning)" />
          </button>
        )}

        {events.length === 0 && (
          <div className="mob__empty">Bu gün için etkinlik yok.</div>
        )}

        {events.map((e) => {
          const cal = calendarById(state, e.calendarId);
          const room = roomById(state, e.roomId);
          const status = reservationStatusForEvent(state, e.id);
          const shared = isSharedEvent(state, e);
          const owner = shared && cal ? userById(state, cal.ownerId) : undefined;
          const sub = [
            room ? room.name : 'Oda yok',
            status === 'pending' ? 'onay bekliyor' : '',
            owner ? owner.name : '',
          ].filter(Boolean).join(' · ');
          return (
            <button className="mob__card" key={e.id}
              onClick={() => dispatch(shared
                ? { type: 'openReadOnlyEvent', eventId: e.id }
                : { type: 'openEventEdit', eventId: e.id })}>
              <div className="mob__cardstrip" style={{ background: cal?.color }}>
                {timeRangeLabel(e.start, e.end)}
                <span className="spacer" />
                {status === 'pending' && <Icon name="clock" size={14} color="rgba(255,255,255,.95)" />}
              </div>
              <div className="mob__cardbody">
                <div className="mob__cardtitle">{e.title}</div>
                <div className="mob__cardsub">{sub}</div>
              </div>
            </button>
          );
        })}

        <div className="mob__nextday">
          <b>{DAY_NAMES_LONG[weekdayIndex(nextDate)]} {dayOfMonth(nextDate)}</b>
          <span className="spacer" />
          <span>{nextCount ? `${nextCount} etkinlik` : 'Etkinlik yok'}</span>
        </div>
      </div>

      <div className="mob__bottom">
        <button className="mob__bigbtn mob__bigbtn--primary"
          onClick={() => dispatch({ type: 'openEventCreate', date })}>
          <Icon name="plusBold" size={16} color="#fff" />Yeni etkinlik
        </button>
        <button className="mob__bigbtn mob__bigbtn--secondary"
          onClick={() => dispatch({ type: 'navigate', route: 'rooms' })}>
          <Icon name="building" size={16} />Odalar
        </button>
      </div>

      {state.ui.mobileSheet === 'calendars' && <MobileCalendarsSheet />}
      {(state.ui.draft || state.ui.readOnlyEventId) && <MobileEventSheet />}
    </div>
  );
}

export function useMobileVisibleCalendars() {
  const state = useAppState();
  return {
    owned: myCalendars(state),
    shared: mySharedCalendars(state),
    isVisible: (id: string) => isCalendarVisible(state, id as never),
  };
}
