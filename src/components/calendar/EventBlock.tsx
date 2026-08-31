import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, isSharedEvent, reservationStatusForEvent, roomById,
} from '../../lib/domain/selectors';
import { HOUR_H, hhmm, minutesToY, timeRangeLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import type { CalendarEvent } from '../../lib/domain/types';

interface Props {
  event: CalendarEvent;
  columnIndex: number;
  columnCount: number;
}

/** Canonical M3.1 etkinlik bloğu: 20px renk şeridi + gövde; 30 dk ve altı kompakt. */
export function EventBlock({ event, columnIndex, columnCount }: Props) {
  const state = useAppState();
  const dispatch = useDispatch();
  const cal = calendarById(state, event.calendarId);
  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);
  const shared = isSharedEvent(state, event);
  const color = cal?.color ?? 'var(--text-tertiary)';

  const top = minutesToY(event.start);
  const height = ((event.end - event.start) / 60) * HOUR_H - 4;
  const left = 3 + columnIndex * (columnCount > 1 ? 15 : 0);
  const compact = event.end - event.start <= 30;

  const open = () => dispatch(
    shared
      ? { type: 'openReadOnlyEvent', eventId: event.id }
      : { type: 'openEventEdit', eventId: event.id },
  );

  const aria = [
    event.title,
    timeRangeLabel(event.start, event.end),
    room ? room.name : 'oda yok',
    status === 'pending' ? 'onay bekliyor' : '',
    shared ? `${cal?.name} · paylaşılan takvim, salt okunur` : '',
  ].filter(Boolean).join(', ');

  if (compact) {
    return (
      <button className={`event event--compact${columnIndex > 0 ? ' is-offset' : ''}`}
        style={{ top, height: height + 4, left, right: 3, background: color, zIndex: 2 + columnIndex }}
        onClick={open} aria-label={aria}>
        <span className="event__title">{event.title}</span>
        <span className="event__ctime">{hhmm(event.start)}</span>
      </button>
    );
  }

  return (
    <button className={`event${columnIndex > 0 ? ' is-offset' : ''}`}
      style={{ top, height, left, right: 3, zIndex: 2 + columnIndex }}
      onClick={open} aria-label={aria}>
      <div className="event__strip" style={{ background: color }}>
        <span className="event__time">{timeRangeLabel(event.start, event.end)}</span>
        <span className="spacer" style={{ minWidth: 6 }} />
        {room && <span className="event__room">{room.name}</span>}
        {status === 'pending' && (
          <Icon name="clock" size={11} color="rgba(255,255,255,.95)" />
        )}
        {status !== 'pending' && event.recurrence.kind !== 'none' && (
          <Icon name="recurrence" size={11} color="rgba(255,255,255,.95)" />
        )}
      </div>
      <div className="event__body" style={{ height: height - 20 }}>
        <span className="event__title">{event.title}</span>
      </div>
    </button>
  );
}
