import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, isSharedEvent, reservationStatusForEvent, roomById,
} from '../../lib/domain/selectors';
import { HOUR_H, hhmm, minutesToY, timeRangeLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { EventHoverCard } from './EventHoverCard';
import { useMediaQuery } from '../../lib/useMediaQuery';
import type { CalendarEvent } from '../../lib/domain/types';

/** Kart, kısa geçişlerde titremesin diye gecikmeyle açılır. */
const HOVER_DELAY_MS = 400;
/** İmleç bloktan karta geçerken aradaki boşlukta kart kapanmasın. */
const CLOSE_DELAY_MS = 160;

interface Props {
  event: CalendarEvent;
  columnIndex: number;
  columnCount: number;
}

/** Canonical M3.1 etkinlik bloğu: 20px renk şeridi + gövde; 30 dk ve altı kompakt. */
export function EventBlock({ event, columnIndex, columnCount }: Props) {
  const state = useAppState();
  const dispatch = useDispatch();
  const ref = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  // Dokunmatik cihazda hover kartı hiç render edilmez (ST-DIS-03).
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const cal = calendarById(state, event.calendarId);
  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);
  const shared = isSharedEvent(state, event);
  const color = cal?.color ?? 'var(--text-tertiary)';

  const top = minutesToY(event.start);
  const height = ((event.end - event.start) / 60) * HOUR_H - 4;
  const left = 3 + columnIndex * (columnCount > 1 ? 15 : 0);
  const compact = event.end - event.start <= 30;

  const closePreview = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    setAnchor(null);
  }, []);

  const cancelClose = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const scheduleClose = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setAnchor(null), CLOSE_DELAY_MS);
  }, []);

  const openPreview = () => {
    if (!canHover) return;
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(
      () => setAnchor(ref.current?.getBoundingClientRect() ?? null), HOVER_DELAY_MS);
  };

  // Kaydırma veya pencere boyutu değişince konum bayatlar; kartı kapat.
  useEffect(() => {
    if (!anchor) return;
    window.addEventListener('scroll', closePreview, true);
    window.addEventListener('resize', closePreview);
    return () => {
      window.removeEventListener('scroll', closePreview, true);
      window.removeEventListener('resize', closePreview);
    };
  }, [anchor, closePreview]);

  useEffect(() => () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

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
      <>
        <button className={`event event--compact${columnIndex > 0 ? ' is-offset' : ''}`}
          style={{ top, height: height + 4, left, right: 3, background: color, zIndex: 2 + columnIndex }}
          onClick={open} aria-label={aria}
          ref={ref}
          onMouseEnter={openPreview} onMouseLeave={scheduleClose}
          onFocus={openPreview} onBlur={scheduleClose}>
          <span className="event__title">{event.title}</span>
          <span className="event__ctime">{hhmm(event.start)}</span>
        </button>
        {anchor && (
          <EventHoverCard event={event} anchor={anchor}
            onEnter={cancelClose} onLeave={scheduleClose} onAction={closePreview} />
        )}
      </>
    );
  }

  return (
    <>
      <button className={`event${columnIndex > 0 ? ' is-offset' : ''}`}
        style={{ top, height, left, right: 3, zIndex: 2 + columnIndex }}
        onClick={open} aria-label={aria}
        ref={ref}
        onMouseEnter={openPreview} onMouseLeave={scheduleClose}
        onFocus={openPreview} onBlur={scheduleClose}>
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
      {anchor && (
          <EventHoverCard event={event} anchor={anchor}
            onEnter={cancelClose} onLeave={scheduleClose} onAction={closePreview} />
        )}
    </>
  );
}
