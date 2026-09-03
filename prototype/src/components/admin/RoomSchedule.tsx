import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { canDecide, readableCalendarIds, userById } from '../../lib/domain/selectors';
import { canCancelReservation, competingPendingCount, isRoomApprover } from '../../lib/domain/rules';
import {
  DAY_NAMES_MINI, addMonths, dayOfMonth, isWeekend, longDateLabel, monthLabel, monthMatrix,
  sameMonth, timeRangeLabel,
} from '../../lib/domain/time';
import { IconButton } from '../primitives/IconButton';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import type { Room } from '../../lib/domain/types';

/**
 * "Bu odanın takvimi" — odaya bakarken *kimin, ne zaman* isteği olduğu sorusunun cevabı.
 * Bekleyen talepler ve kesinleşmiş rezervasyonlar tek listede, bugünden ileriye doğru.
 *
 * ⚠️ Detay (talep eden, etkinlik adı) yalnız **kararı verebilecek** ya da etkinliği zaten
 * okuyabilen kullanıcıya gösterilir; diğerleri için satır yalnız doluluk taşır
 * (`10` BR-PRM-06, `18` BR-APR-27).
 */
export function RoomSchedule({ room }: { room: Room }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const readable = new Set(readableCalendarIds(state));
  const [reason, setReason] = useState('');
  const isApprover = isRoomApprover(room, state.currentUserId, state.groups);

  const [cursor, setCursor] = useState(state.today);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  /**
   * ⚠️ Doluluk **rezervasyonlardan** okunur, etkinliklerden değil: oda sorumlusu
   * okuyamadığı bir takvimdeki etkinliği görmez ama odanın dolu olduğunu görmelidir
   * (`10` BR-PRM-06). Detay maskeleme aşağıda ayrıca yapılır (BR-APR-25b).
   */
  const allRes = state.reservations.filter((r) => r.roomId === room.id
    && (r.status === 'pending' || r.status === 'reserved'));

  const byDay = new Map<string, { reserved: number; pending: number }>();
  for (const r of allRes) {
    const d = byDay.get(r.date) ?? { reserved: 0, pending: 0 };
    if (r.status === 'pending') d.pending += 1; else d.reserved += 1;
    byDay.set(r.date, d);
  }

  const rows = allRes
    .filter((r) => (pickedDay ? r.date === pickedDay : r.date >= state.today))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start));

  // ⚠️ Rozet odanın tamamını temsil eder; gün filtresiyle değişmemelidir.
  const pendingCount = allRes.filter(
    (r) => r.status === 'pending' && r.date >= state.today).length;
  const weeks = monthMatrix(cursor);

  return (
    <section className="rsched" aria-label="Bu odanın takvimi">
      <div className="rsched__head">
        <span className="rsched__title">Bu odanın takvimi</span>
        <span className="spacer" />
        {pendingCount > 0
          ? <span className="pill pill--pending">{pendingCount} bekleyen</span>
          : <span className="rsched__none">bekleyen talep yok</span>}
      </div>

      {/* D-073 — "bu oda hangi günler dolu" sorusunun tek bakışta cevabı. */}
      <div className="rmonth">
        <div className="rmonth__head">
          <IconButton icon="chevronLeft" label="Önceki ay" tone="sm" size={15}
            onClick={() => setCursor(addMonths(`${cursor.slice(0, 8)}01`, -1))} />
          <span className="rmonth__label">{monthLabel(cursor)}</span>
          <IconButton icon="chevronRight" label="Sonraki ay" tone="sm" size={15}
            onClick={() => setCursor(addMonths(`${cursor.slice(0, 8)}01`, 1))} />
          <span className="spacer" />
          <span className="rmonth__legend">
            <i className="rmonth__dot rmonth__dot--res" /> dolu
            <i className="rmonth__dot rmonth__dot--pend" /> bekleyen
          </span>
        </div>
        <div className="rmonth__dow" aria-hidden="true">
          {DAY_NAMES_MINI.map((d) => <span key={d}>{d}</span>)}
        </div>
        {weeks.map((week) => (
          <div className="rmonth__week" key={week[0]}>
            {week.map((date) => {
              const load = byDay.get(date);
              const out = !sameMonth(date, cursor);
              const cls = [
                'rmonth__day',
                out ? 'is-out' : isWeekend(date) ? 'is-weekend' : '',
                date === state.today ? 'is-today' : '',
                date === pickedDay ? 'is-picked' : '',
                load ? 'is-busy' : '',
              ].filter(Boolean).join(' ');
              const total = (load?.reserved ?? 0) + (load?.pending ?? 0);
              return (
                <button key={date} type="button" className={cls}
                  aria-pressed={date === pickedDay}
                  aria-label={`${longDateLabel(date)} — ${total
                    ? `${total} kayıt` : 'kayıt yok'}`}
                  onClick={() => setPickedDay(date === pickedDay ? null : date)}>
                  <span className="rmonth__num">{dayOfMonth(date)}</span>
                  <span className="rmonth__dots">
                    {Array.from({ length: Math.min(load?.reserved ?? 0, 3) }, (_, i) => (
                      <i className="rmonth__dot rmonth__dot--res" key={`r${i}`} />
                    ))}
                    {Array.from({ length: Math.min(load?.pending ?? 0, 3) }, (_, i) => (
                      <i className="rmonth__dot rmonth__dot--pend" key={`p${i}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="rsched__scope">
        {pickedDay
          ? <>{longDateLabel(pickedDay)} · {rows.length} kayıt</>
          : <>Bugünden itibaren · {rows.length} kayıt</>}
        {pickedDay && (
          <button type="button" className="rsched__clear" onClick={() => setPickedDay(null)}>
            Tümünü göster
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rsched__empty">
          {pickedDay ? 'Bu gün için kayıt yok.' : 'Bugünden itibaren bu oda için kayıt yok.'}
        </div>
      ) : rows.map((r) => {
        const req = state.requests.find((q) => q.reservationId === r.id);
        const event = state.events.find((e) => e.id === r.eventId);
        const requester = userById(state, r.requesterId);
        const showDetail = isApprover || (event ? readable.has(event.calendarId) : false);
        const decidable = req ? canDecide(state, req.id) : false;
        // D-070 — aynı aralıkta başka bekleyen talep var mı?
        const rakip = competingPendingCount(
          room.id, r.date, r.start, r.end, state.reservations, r.eventId);
        const cancelling = state.ui.cancellingReservationId === r.id;

        return (
          <div className={`rsched__row rsched__row--${r.status}`} key={r.id}>
            <span className="rsched__mark" aria-hidden="true">
              <Icon name={r.status === 'pending' ? 'clock' : 'checkCircle'} size={14} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="rsched__when">
                {longDateLabel(r.date)} · {timeRangeLabel(r.start, r.end)}
              </div>
              <div className="rsched__who">
                {showDetail
                  ? <>{requester?.name}{event ? ` · ${event.title}` : ''}</>
                  : <span className="rsched__masked">
                    {r.status === 'pending' ? 'Onay bekliyor' : 'Rezerve'}
                  </span>}
              </div>
              {r.status === 'pending' && rakip > 0 && (
                <div className="rsched__clash">
                  Aynı saate {rakip} talep daha var — biri onaylanırsa diğerleri
                  kendiliğinden reddedilmez.
                </div>
              )}
            </div>

            {decidable && (
              <div className="rsched__actions">
                <Button variant="primary" size="sm"
                  onClick={() => dispatch({ type: 'approveRequest', requestId: req!.id })}>
                  Onayla
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => {
                    dispatch({ type: 'navigate', route: 'requests' });
                    dispatch({ type: 'selectRequest', requestId: req!.id });
                    dispatch({ type: 'startReject', requestId: req!.id });
                  }}>
                  Reddet
                </Button>
              </div>
            )}
            {r.status === 'pending' && !decidable && req?.requesterId === state.currentUserId && (
              <span className="rsched__note">sizin talebiniz</span>
            )}

            {cancelling && (
              <div className="rsched__cancel">
                <div className="rsched__cancelhead">
                  Rezervasyon kaldırılsın mı? Etkinlik <strong>silinmez</strong>, odasız kalır
                  {requester && requester.id !== state.currentUserId
                    ? <> ve {requester.name} bilgilendirilir.</> : '.'}
                </div>
                <label className="rsched__canlabel" htmlFor={`cx-${r.id}`}>
                  Gerekçe (zorunlu) — sahibine iletilir.
                </label>
                <textarea id={`cx-${r.id}`} className="textinput" rows={2} value={reason} autoFocus
                  placeholder="Örn. bu saatte bakım planlandı."
                  onChange={(e) => setReason(e.target.value)} />
                <div className="rsched__canrow">
                  <Button variant="danger" size="sm" disabled={!reason.trim()}
                    onClick={() => dispatch({
                      type: 'cancelReservation', reservationId: r.id, reason,
                    })}>
                    Kaldır
                  </Button>
                  <Button variant="secondary" size="sm"
                    onClick={() => dispatch({
                      type: 'startCancelReservation', reservationId: null,
                    })}>
                    Vazgeç
                  </Button>
                </div>
              </div>
            )}

            {/* D-071 — oda sorumlusu kesinleşmiş rezervasyonu gerekçeyle kaldırabilir. */}
            {canCancelReservation(r, room, state.currentUserId, state.groups) && !cancelling && (
              <div className="rsched__actions">
                <Button variant="outline" size="sm"
                  onClick={() => {
                    setReason('');
                    dispatch({ type: 'startCancelReservation', reservationId: r.id });
                  }}>
                  Kaldır
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
