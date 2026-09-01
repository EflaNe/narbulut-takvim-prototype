import { createPortal } from 'react-dom';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, isSharedEvent, reservationStatusForEvent, roomById, userById,
} from '../../lib/domain/selectors';
import { canEditEvent } from '../../lib/domain/rules';
import { overlaps, timeRangeLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { Avatar } from '../primitives/Avatar';
import type { CalendarEvent } from '../../lib/domain/types';

const CARD_W = 292;
const GAP = 10;
const MAX_PEOPLE = 4;

/**
 * Izgara üstünde etkinlik önizlemesi (PC-02, U-05).
 * ⚠️ Bilgiyi hover'a hapsetmez: aynı içerik bloğa tıklanınca açılan drawer'da da vardır
 * (`11` ST-DIS-03, tasarım brief'i madde 2–3). Dokunmatik cihazlarda hiç render edilmez.
 *
 * Tek aksiyonu silmedir (BR-SHELL-45): onay diyaloğundan geçer, paylaşılan salt okunur
 * etkinlikte hiç gösterilmez (`12` BR-CAL-27) ve drawer'daki silme yolunun yerini almaz.
 */
export function EventHoverCard({ event, anchor, onEnter, onLeave, onAction }: {
  event: CalendarEvent;
  anchor: DOMRect;
  onEnter: () => void;
  onLeave: () => void;
  onAction: () => void;
}) {
  const state = useAppState();
  const dispatch = useDispatch();
  const cal = calendarById(state, event.calendarId);
  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);
  const shared = isSharedEvent(state, event);
  const owner = cal ? userById(state, cal.ownerId) : undefined;

  const organizer = userById(state, event.organizerId);
  const people = [
    ...(organizer ? [{ user: organizer, role: 'Organizatör' }] : []),
    ...event.participantIds
      .map((id) => userById(state, id))
      .filter((u): u is NonNullable<typeof u> => !!u)
      .map((user) => ({ user, role: user.title })),
  ];
  const shown = people.slice(0, MAX_PEOPLE);

  /* Free/busy yalnız müsait/meşgul döner — çakışan etkinliğin detayı gösterilmez (BR-PRM-11). */
  const busyState = (userId: string): 'busy' | 'free' | 'unknown' => {
    const u = userById(state, userId as never);
    if (!u || u.orgId !== 'narbulut') return 'unknown';
    const clash = state.events.some(
      (e) => e.id !== event.id && e.date === event.date
        && overlaps(event.start, event.end, e.start, e.end)
        && (e.organizerId === u.id || e.participantIds.includes(u.id)));
    return clash ? 'busy' : 'free';
  };

  /* Yerleşim: bloğun sağına; sığmazsa soluna. Dikeyde görünüm alanına sıkıştırılır. */
  const spaceRight = window.innerWidth - anchor.right;
  const left = spaceRight >= CARD_W + GAP + 8
    ? anchor.right + GAP
    : Math.max(8, anchor.left - CARD_W - GAP);
  const top = Math.min(
    Math.max(8, anchor.top - 4),
    Math.max(8, window.innerHeight - 340),
  );

  const duration = event.end - event.start;
  const durationLabel = `${Math.floor(duration / 60) ? `${Math.floor(duration / 60)} sa ` : ''}${duration % 60 ? `${duration % 60} dk` : ''}`.trim();

  const canDelete = canEditEvent(event, state.calendars, state.currentUserId);
  const hasReservation = status !== 'none';

  const askDelete = () => {
    onAction();
    dispatch({
      type: 'askConfirm',
      confirm: {
        title: `“${event.title}” silinsin mi?`,
        body: hasReservation
          ? `Bu işlem geri alınamaz. ${room?.name ?? 'Oda'} rezervasyonu da iptal edilecek; talep kaydı geçmişte kalır.`
          : 'Bu işlem geri alınamaz.',
        confirmLabel: 'Sil',
        tone: 'destructive',
        action: { type: 'deleteEvent', eventId: event.id },
      },
    });
  };

  return createPortal(
    <div className="ehc" style={{ left, top }} role="group" aria-label={`${event.title} önizleme`}
      onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="ehc__strip" style={{ background: cal?.color }} />
      <div className="ehc__body">
        <div className="ehc__cal">
          <span className="ehc__caldot" style={{ background: cal?.color }} />
          {cal?.name}
        </div>
        <div className="ehc__title">{event.title}</div>
        <div className="ehc__time">
          {timeRangeLabel(event.start, event.end)} · {durationLabel}
        </div>

        <div className="ehc__row">
          <Icon name={room ? 'door' : 'info'} size={14} color="var(--text-tertiary)" />
          {room ? (
            <span>{room.name} <span className="ehc__muted">· {room.capacity} kişilik</span></span>
          ) : (
            <span className="ehc__muted">Oda yok</span>
          )}
        </div>

        {status !== 'none' && (
          <div className="ehc__row">
            {status === 'pending' ? (
              <span className="badge badge--pending">
                <Icon name="clock" size={14} />Onay bekliyor
              </span>
            ) : (
              <span className="badge badge--reserved">
                <Icon name="checkCircle" size={14} />Oda rezerve
              </span>
            )}
          </div>
        )}

        {event.recurrence.kind !== 'none' && (
          <div className="ehc__row">
            <Icon name="recurrence" size={14} color="var(--text-tertiary)" />
            <span className="ehc__muted">{event.recurrence.count} tekrarlı seri</span>
          </div>
        )}

        <div className="ehc__sep" />

        <div className="ehc__people">
          <div className="ehc__peoplehead">Kimler var · {people.length} kişi</div>
          {shown.map(({ user, role }) => {
            const s = busyState(user.id);
            return (
              <div className="ehc__person" key={user.id}>
                {user.orgId === 'narbulut' ? <Avatar user={user} small /> : (
                  <span className="avatar avatar--sm" style={{ background: '#F5F7F9' }} aria-hidden="true">
                    <Icon name="person" size={12} color="var(--text-muted)" />
                  </span>
                )}
                <span className="ehc__pname">
                  {user.orgId === 'narbulut' ? user.name : user.email}
                </span>
                <span className={`ehc__pstate ehc__pstate--${s}`}>
                  {s === 'busy' && <><span className="ehc__pdot" />Meşgul</>}
                  {s === 'free' && <><Icon name="check" size={12} />Müsait</>}
                  {s === 'unknown' && <>Bilinmiyor</>}
                </span>
                <span className="sr-only">{role}</span>
              </div>
            );
          })}
          {people.length > MAX_PEOPLE && (
            <div className="ehc__more">+{people.length - MAX_PEOPLE} kişi daha</div>
          )}
        </div>

        {shared && owner && (
          <div className="ehc__owner">
            <Icon name="share" size={13} />
            {owner.name}’ın paylaştığı takvim · salt okunur
          </div>
        )}

        {/* BR-CAL-27 — paylaşılan takvim etkinliğinde silme hiç gösterilmez. */}
        {canDelete && (
          <div className="ehc__actions">
            <button className="ehc__delete" onClick={askDelete}
              aria-label={`${event.title} etkinliğini sil`}>
              <Icon name="trash" size={14} />Sil
            </button>
            {hasReservation && <span className="ehc__hint">oda da düşer</span>}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
