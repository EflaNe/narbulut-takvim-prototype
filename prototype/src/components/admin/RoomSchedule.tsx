import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { canDecide, readableCalendarIds, userById } from '../../lib/domain/selectors';
import { canCancelReservation, competingPendingCount, isRoomApprover } from '../../lib/domain/rules';
import {
  DAY_NAMES_SHORT, addMonths, dayOfMonth, hhmm, isWeekend, monthLabel, monthMatrix,
  sameMonth, shortDateLabel, timeRangeLabel,
} from '../../lib/domain/time';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import type { Reservation, Room } from '../../lib/domain/types';

/**
 * "Bu odanın takvimi" — D-073 / D-074.
 *
 * Solda odanın kendi ay takvimi (*hangi günler dolu*), sağda karar taşıyan liste
 * (*kim, ne zaman, ne yapmam gerekiyor*).
 *
 * ⚠️ Doluluk **rezervasyonlardan** okunur, etkinliklerden değil: oda sorumlusu okuma izni
 * olmayan bir takvimdeki etkinliği görmez ama odanın dolu olduğunu görmelidir
 * (`10` BR-PRM-06, `18` BR-APR-25d). Detay ayrıca maskelenir (BR-APR-25b).
 */
export function RoomSchedule({ room }: { room: Room }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const readable = new Set(readableCalendarIds(state));
  const [reason, setReason] = useState('');
  const [cursor, setCursor] = useState(state.today);
  const isApprover = isRoomApprover(room, state.currentUserId, state.groups);

  const all = state.reservations.filter((r) => r.roomId === room.id
    && (r.status === 'pending' || r.status === 'reserved'));

  const byDay = new Map<string, Reservation[]>();
  for (const r of all) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r]);

  const weeks = monthMatrix(cursor);
  const inMonth = all.filter((r) => sameMonth(r.date, cursor));
  const upcoming = all
    .filter((r) => r.date >= state.today)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start));
  const decidableCount = upcoming.filter((r) => {
    const q = state.requests.find((x) => x.reservationId === r.id);
    return q ? canDecide(state, q.id) : false;
  }).length;

  /** Satırın detayını görebilir mi (BR-APR-25b) — yoksa yalnız doluluk okunur. */
  const detailOf = (r: Reservation) => {
    const event = state.events.find((e) => e.id === r.eventId);
    const show = isApprover || (event ? readable.has(event.calendarId) : false);
    return { event, show, requester: userById(state, r.requesterId) };
  };

  return (
    <section className="rsched" aria-label="Bu odanın takvimi">
      <div className="rsched__cols">
        {/* ── sol: odanın kendi ay takvimi ───────────────────────────────── */}
        <div className="rmonth">
          <div className="rmonth__head">
            <IconButton icon="chevronLeft" label="Önceki ay" tone="sm" size={15}
              onClick={() => setCursor(addMonths(`${cursor.slice(0, 8)}01`, -1))} />
            <span className="rmonth__label">{monthLabel(cursor)}</span>
            <IconButton icon="chevronRight" label="Sonraki ay" tone="sm" size={15}
              onClick={() => setCursor(addMonths(`${cursor.slice(0, 8)}01`, 1))} />
            <Button variant="quiet" onClick={() => setCursor(state.today)}>Bugün</Button>
            <span className="spacer" />
            <span className="rmonth__legend">
              <i className="rmonth__key rmonth__key--res" />Rezerve
              <i className="rmonth__key rmonth__key--pend" />Onay bekliyor
            </span>
          </div>

          <div className="rmonth__dow" aria-hidden="true">
            {DAY_NAMES_SHORT.map((d) => <span key={d}>{d}</span>)}
          </div>

          {weeks.map((week) => (
            <div className="rmonth__week" key={week[0]}>
              {week.map((date) => {
                const items = byDay.get(date) ?? [];
                const out = !sameMonth(date, cursor);
                const cls = ['rmonth__cell', out ? 'is-out' : isWeekend(date) ? 'is-weekend' : '',
                  date === state.today ? 'is-today' : ''].filter(Boolean).join(' ');
                return (
                  <div className={cls} key={date}>
                    <span className="rmonth__num">{dayOfMonth(date)}</span>
                    {items.slice(0, 2).map((r) => {
                      const { event, show } = detailOf(r);
                      return (
                        <span key={r.id} className={`rmonth__chip rmonth__chip--${r.status}`}
                          title={show && event ? event.title : 'Dolu'}>
                          <b>{hhmm(r.start)}</b>
                          {show && event ? event.title : r.status === 'pending' ? 'Onay bekliyor' : 'Rezerve'}
                        </span>
                      );
                    })}
                    {items.length > 2 && (
                      <span className="rmonth__more">+{items.length - 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── sağ: karar taşıyan liste ───────────────────────────────────── */}
        <div className="rupc">
          <div className="rupc__head">
            <span className="rupc__title">Yaklaşan kayıtlar</span>
            <span className="spacer" />
            {decidableCount > 0 && (
              <span className="rupc__badge">{decidableCount} karar bekliyor</span>
            )}
          </div>
          <div className="rupc__sub">
            Bu ay {inMonth.filter((r) => r.status === 'reserved').length} rezervasyon ·{' '}
            {inMonth.filter((r) => r.status === 'pending').length} bekleyen talep
          </div>

          {upcoming.length === 0 && (
            <div className="rupc__empty">Bugünden itibaren bu oda için kayıt yok.</div>
          )}

          {upcoming.map((r) => {
            const { event, show, requester } = detailOf(r);
            const req = state.requests.find((q) => q.reservationId === r.id);
            const decidable = req ? canDecide(state, req.id) : false;
            const own = r.requesterId === state.currentUserId;
            const cancelling = state.ui.cancellingReservationId === r.id;
            const rakip = competingPendingCount(
              room.id, r.date, r.start, r.end, state.reservations, r.eventId);

            return (
              <div className="rupc__row" key={r.id}>
                <span className="rupc__date">
                  <b>{shortDateLabel(r.date).split(' ')[0]}</b>
                  {shortDateLabel(r.date).split(' ')[1]}
                </span>
                <div className="rupc__main">
                  <div className="rupc__line1">
                    <span className="rupc__name">
                      {show && event ? event.title : 'Kayıt'}
                    </span>
                    <span className={`pill ${r.status === 'pending' ? 'pill--pending' : 'pill--approved'}`}>
                      {r.status === 'pending' ? 'Onay bekliyor' : 'Rezerve'}
                    </span>
                  </div>
                  <div className="rupc__line2">
                    {timeRangeLabel(r.start, r.end)}
                    {show ? ` · ${own ? 'Sizin talebiniz' : requester?.name}` : ''}
                  </div>

                  {decidable && !cancelling && (
                    <div className="rupc__actions">
                      <Button variant="primary" size="sm"
                        onClick={() => dispatch({ type: 'approveRequest', requestId: req!.id })}>
                        <Icon name="check" size={14} color="#fff" />Onayla
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => {
                          dispatch({ type: 'navigate', route: 'requests' });
                          dispatch({ type: 'selectRequest', requestId: req!.id });
                          dispatch({ type: 'startReject', requestId: req!.id });
                        }}>Reddet</Button>
                    </div>
                  )}

                  {/* D-070 — rakip talep bilgi taşır, engel değildir. */}
                  {r.status === 'pending' && rakip > 0 && (
                    <div className="rupc__note">
                      <Icon name="info" size={13} color="var(--text-tertiary)" />
                      Aynı slota {rakip} talep daha var; onaylamak diğerini otomatik reddetmez.
                    </div>
                  )}
                  {/* BR-APR-17a — kendi talebini onaylayamama, sebebiyle. */}
                  {r.status === 'pending' && own && (
                    <div className="rupc__note">
                      <Icon name="info" size={13} color="var(--text-tertiary)" />
                      Kendi talebinizi onaylayamazsınız; karar diğer onaylayıcıda.
                    </div>
                  )}

                  {/* D-071 — kaldırma; gerekçe zorunlu. */}
                  {canCancelReservation(r, room, state.currentUserId, state.groups) && !cancelling && (
                    <div className="rupc__actions">
                      <Button variant="outline" size="sm"
                        onClick={() => {
                          setReason('');
                          dispatch({ type: 'startCancelReservation', reservationId: r.id });
                        }}>Kaldır</Button>
                      <span className="rupc__hint">gerekçe ister</span>
                    </div>
                  )}

                  {cancelling && (
                    <div className="rupc__cancel">
                      <div className="rupc__cancelhead">
                        Rezervasyon kaldırılsın mı? Etkinlik <strong>silinmez</strong>, odasız kalır
                        {requester && !own ? <> ve {requester.name} bilgilendirilir.</> : '.'}
                      </div>
                      <label className="rupc__canlabel" htmlFor={`cx-${r.id}`}>
                        Gerekçe <span className="reqlabel reqlabel--req">Zorunlu</span>
                      </label>
                      <textarea id={`cx-${r.id}`} className="textinput" rows={2} value={reason} autoFocus
                        placeholder="Örn. oda bakıma alınıyor."
                        onChange={(e) => setReason(e.target.value)} />
                      <div className="rupc__canrow">
                        <Button variant="secondary" size="sm"
                          onClick={() => dispatch({
                            type: 'startCancelReservation', reservationId: null,
                          })}>Vazgeç</Button>
                        <Button variant="danger" size="sm" disabled={!reason.trim()}
                          onClick={() => dispatch({
                            type: 'cancelReservation', reservationId: r.id, reason,
                          })}>Kaldır</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button className="rupc__all"
            onClick={() => dispatch({ type: 'navigate', route: 'requests' })}>
            Talepler ekranında tümünü gör
          </button>
        </div>
      </div>
    </section>
  );
}
