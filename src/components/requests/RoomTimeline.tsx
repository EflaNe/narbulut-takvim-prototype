import { useAppState } from '../../lib/state/StoreContext';
import { hhmm } from '../../lib/domain/time';
import type { IsoDate, Minutes, RoomId } from '../../lib/domain/types';

const FROM = 9 * 60;
const TO = 18 * 60;

interface Props {
  roomId: RoomId;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  excludeReservationId?: string;
}

/** Karar için gereken bağlam: odanın o günkü doluluğu ve talebin yeri. */
export function RoomTimeline({ roomId, date, start, end, excludeReservationId }: Props) {
  const state = useAppState();
  const span = TO - FROM;
  const pct = (m: Minutes) => `${((Math.min(Math.max(m, FROM), TO) - FROM) / span) * 100}%`;
  const width = (a: Minutes, b: Minutes) =>
    `${((Math.min(b, TO) - Math.max(a, FROM)) / span) * 100}%`;

  const others = state.reservations.filter(
    (r) => r.roomId === roomId && r.date === date && r.id !== excludeReservationId
      && (r.status === 'reserved' || r.status === 'pending') && r.end > FROM && r.start < TO);

  return (
    <div className="timeline">
      <div className="timeline__hours" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i}>{String(9 + i).padStart(2, '0')}</span>
        ))}
      </div>
      <div className="timeline__track" role="img"
        aria-label={`${date} tarihinde odanın doluluğu ve talebin yeri ${hhmm(start)} – ${hhmm(end)}`}>
        {others.map((r) => (
          <div key={r.id} className={`timeline__block timeline__block--${r.status}`}
            style={{ left: pct(r.start), width: width(r.start, r.end) }}>
            {r.status === 'pending' ? 'Onay bekliyor' : 'Rezerve'}
          </div>
        ))}
        <div className="timeline__block timeline__block--request"
          style={{ left: pct(start), width: width(start, end) }}>
          {hhmm(start)} – {hhmm(end)}
        </div>
      </div>
      <div className="timeline__legend">
        <span className="timeline__key">
          <span className="timeline__swatch" style={{ background: 'var(--brand)' }} />Bu talep
        </span>
        <span className="timeline__key">
          <span className="timeline__swatch" style={{ background: '#E4EAF0' }} />Rezerve
        </span>
        <span className="timeline__key">
          <span className="timeline__swatch" style={{ background: '#FBF3E2' }} />Onay bekleyen
        </span>
      </div>
    </div>
  );
}
