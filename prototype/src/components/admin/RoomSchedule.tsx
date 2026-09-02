import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { canDecide, readableCalendarIds, userById } from '../../lib/domain/selectors';
import { canCancelReservation, competingPendingCount, isRoomApprover } from '../../lib/domain/rules';
import { longDateLabel, timeRangeLabel } from '../../lib/domain/time';
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

  const rows = state.reservations
    .filter((r) => r.roomId === room.id && r.date >= state.today
      && (r.status === 'pending' || r.status === 'reserved'))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start));

  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  return (
    <section className="rsched" aria-label="Bu odanın takvimi">
      <div className="rsched__head">
        <span className="rsched__title">Bu odanın takvimi</span>
        <span className="spacer" />
        {pendingCount > 0
          ? <span className="pill pill--pending">{pendingCount} bekleyen</span>
          : <span className="rsched__none">bekleyen talep yok</span>}
      </div>

      {rows.length === 0 ? (
        <div className="rsched__empty">
          Bugünden itibaren bu oda için kayıt yok.
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
