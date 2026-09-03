import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, canDecide, decidedRequests, myRequests, pendingRequests, roomById, userById,
} from '../../lib/domain/selectors';
import { canReinvite, eligibleApprovers } from '../../lib/domain/rules';
import {
  DAY_NAMES_LONG, longDateLabel, timeRangeLabel, weekdayIndex,
} from '../../lib/domain/time';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import { RoomTimeline } from './RoomTimeline';
import type { ApprovalRequest, RequestId } from '../../lib/domain/types';

const statusPill: Record<ApprovalRequest['status'], { cls: string; label: string }> = {
  pending: { cls: 'pill--pending', label: 'Onay bekliyor' },
  approved: { cls: 'pill--approved', label: 'Onaylandı' },
  rejected: { cls: 'pill--rejected', label: 'Reddedildi' },
  cancelled: { cls: 'pill--cancelled', label: 'İptal edildi' },
};

export function RequestsScreen() {
  const state = useAppState();
  const dispatch = useDispatch();
  const pending = pendingRequests(state);
  const decided = decidedRequests(state);
  const all = myRequests(state);
  const selected = all.find((r) => r.id === state.ui.selectedRequestId)
    ?? pending[0] ?? decided[0] ?? null;

  return (
    <div className="reqscreen">
      <header className="reqhead">
        <IconButton icon="chevronLeft" label="Takvime dön"
          onClick={() => dispatch({ type: 'navigate', route: 'calendar' })} />
        <span className="reqhead__title">Talepler</span>
        <span className="reqhead__sub">
          {pending.length ? `${pending.length} bekleyen talep` : 'Bekleyen talep yok'}
        </span>
      </header>

      <div className="reqbody">
        <div className="reqlist">
          <div className="reqlist__scroll">
            <div className="reqlist__group">Bekleyenler</div>
            {pending.length === 0 && (
              <div className="reqitem" style={{ color: 'var(--text-tertiary)', cursor: 'default' }}>
                Bekleyen talep yok. Karar verilmesi gereken bir şey bulunmuyor.
              </div>
            )}
            {pending.map((r) => (
              <RequestRow key={r.id} req={r} active={selected?.id === r.id} />
            ))}

            {decided.length > 0 && (
              <>
                <div className="reqlist__group">Karara bağlananlar</div>
                {decided.map((r) => (
                  <RequestRow key={r.id} req={r} active={selected?.id === r.id} />
                ))}
              </>
            )}
          </div>
        </div>

        {selected
          ? <RequestDetail req={selected} />
          : (
            <div className="reqempty">
              <div className="emptystate">
                <div className="emptystate__title">Talep kuyruğu boş</div>
                <div className="emptystate__body">
                  Onaylayıcısı olduğunuz odalara henüz talep gelmedi.
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

function RequestRow({ req, active }: { req: ApprovalRequest; active: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const event = state.events.find((e) => e.id === req.eventId);
  const room = roomById(state, req.roomId);
  const requester = userById(state, req.requesterId);
  const own = req.requesterId === state.currentUserId;
  const pill = statusPill[req.status];

  return (
    <button className={`reqitem${active ? ' is-active' : ''}`}
      onClick={() => dispatch({ type: 'selectRequest', requestId: req.id as RequestId })}>
      <div className="reqitem__top">
        <span className="reqitem__title">{event?.title ?? 'Etkinlik'}</span>
        <span className="spacer" />
        <span className={`pill ${pill.cls}`}>{pill.label}</span>
      </div>
      <div className="reqitem__meta">
        {room?.name} · {event ? `${longDateLabel(event.date)}, ${timeRangeLabel(event.start, event.end)}` : ''}
        {event && event.recurrence.kind !== 'none' ? ` · ${event.recurrence.count} tekrar` : ''}
      </div>
      <div className="reqitem__who">
        <Icon name="person" size={12} />
        {own ? 'Sizin talebiniz' : requester?.name}
      </div>
    </button>
  );
}

function RequestDetail({ req }: { req: ApprovalRequest }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const [reason, setReason] = useState('');
  const [reinvite, setReinvite] = useState('');
  const event = state.events.find((e) => e.id === req.eventId);
  const room = roomById(state, req.roomId);
  const requester = userById(state, req.requesterId);
  const cal = event ? calendarById(state, event.calendarId) : undefined;
  const decidable = canDecide(state, req.id);
  const own = req.requesterId === state.currentUserId;
  const rejecting = state.ui.rejectingRequestId === req.id;
  const reinviting = state.ui.reinvitingRequestId === req.id;
  const approvers = room
    ? eligibleApprovers(room, req.requesterId, state.groups)
      .map((id) => userById(state, id)?.name).filter(Boolean)
    : [];
  const attendees = event ? event.participantIds.length + 1 : 0;
  const pill = statusPill[req.status];

  if (!event || !room) return <div className="reqempty">Talep bulunamadı.</div>;

  return (
    <div className="reqdetail">
      <div className="reqdetail__title">{event.title}</div>
      <div className="reqdetail__meta">
        <span className={`pill ${pill.cls}`}>{pill.label}</span>
        {cal && (
          <>
            <span className="calrow__dot" style={{ width: 9, height: 9, background: cal.color }} />
            {cal.name}
          </>
        )}
        <span className="evd__sep">·</span>
        <span className="tnum">
          {DAY_NAMES_LONG[weekdayIndex(event.date)]}, {longDateLabel(event.date)} ·{' '}
          {timeRangeLabel(event.start, event.end)}
        </span>
      </div>

      <div className="reqdetail__grid">
        <div>
          <div className="reqfact__label">Oda</div>
          <div className="reqfact__value">{room.name}</div>
          <div className="reqfact__sub">
            {room.capacity} kişilik ·{' '}
            {state.buildings.find((b) => b.id === room.buildingId)?.name}, {room.floor}
          </div>
        </div>
        <div>
          <div className="reqfact__label">Talep eden</div>
          <div className="reqfact__value">{requester?.name}</div>
          <div className="reqfact__sub">{requester?.title}</div>
        </div>
        <div>
          <div className="reqfact__label">Katılımcı</div>
          <div className="reqfact__value">{attendees} kişi</div>
          <div className="reqfact__sub">
            {attendees > room.capacity
              ? `Kapasite ${attendees - room.capacity} kişi aşılıyor — kararı engellemez`
              : `Kapasite yeterli (${room.capacity})`}
          </div>
        </div>
        <div>
          <div className="reqfact__label">Tekrar</div>
          <div className="reqfact__value">
            {event.recurrence.kind === 'none' ? 'Tek seferlik' : `${event.recurrence.count} tekrar`}
          </div>
          <div className="reqfact__sub">
            {event.recurrence.kind === 'none'
              ? 'Seri talebi değil'
              : 'Karar tüm seriye uygulanır'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div className="reqfact__label">Odanın o günkü durumu</div>
        <RoomTimeline roomId={room.id} date={event.date} start={event.start} end={event.end}
          excludeReservationId={req.reservationId} />
      </div>

      {req.status === 'pending' && decidable && !rejecting && (
        <div className="reqactions">
          <Button variant="primary"
            onClick={() => dispatch({ type: 'approveRequest', requestId: req.id })}>
            <Icon name="check" size={15} color="#fff" />Onayla
          </Button>
          <Button variant="outline"
            onClick={() => { setReason(''); dispatch({ type: 'startReject', requestId: req.id }); }}>
            Reddet
          </Button>
          <span className="spacer" />
          <span className="shd__foot">Karar tek adımlıdır ve geri alınamaz.</span>
        </div>
      )}

      {req.status === 'pending' && decidable && rejecting && (
        <div className="reqactions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="reqreason">
            <div className="reqreason__label">Gerekçe (isteğe bağlı) — girilirse talep edene iletilir.</div>
            <textarea className="textinput" rows={3} value={reason} autoFocus
              aria-label="Red gerekçesi"
              placeholder="Örn. aynı saatte yönetim toplantısı planlandı."
              onChange={(e) => setReason(e.target.value)} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 12 }}>
            <Button variant="danger"
              onClick={() => dispatch({ type: 'rejectRequest', requestId: req.id, reason })}>
              Reddet
            </Button>
            <Button variant="secondary"
              onClick={() => dispatch({ type: 'startReject', requestId: null })}>Vazgeç</Button>
            <span className="spacer" />
            <span className="shd__foot" style={{ alignSelf: 'center' }}>
              Red sonrası oda tekrar müsait olur; etkinlik silinmez.
            </span>
          </div>
        </div>
      )}

      {/* BR-APR-17a — self-approval yasağı: aksiyon yok, bilgilendirme var. */}
      {req.status === 'pending' && own && (
        <div className="reqactions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="banner banner--info">
            <Icon name="info" size={14} />
            <span>
              Bu sizin talebiniz. Kendi rezervasyon talebinizi onaylayamazsınız;
              kararı {approvers.length ? approvers.join(', ') : 'odanın onaylayıcısı'} verecek.
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Button variant="outline"
              onClick={() => dispatch({ type: 'withdrawRequest', requestId: req.id })}>
              Talebi geri çek
            </Button>
          </div>
        </div>
      )}

      {req.status === 'pending' && !own && !decidable && (
        <div className="reqdecision">
          Bu talebin kararını {approvers.join(', ') || 'odanın onaylayıcısı'} verecek.
        </div>
      )}

      {req.status !== 'pending' && (
        <div className="reqdecision">
          <strong>{pill.label}</strong>
          {req.decidedById && <> · {userById(state, req.decidedById)?.name}</>}
          {req.reason && <><br />Gerekçe: {req.reason}</>}
          {req.status === 'rejected' && (
            <><br />Oda serbest bırakıldı; etkinlik odasız olarak takvimde kaldı.</>
          )}
        </div>
      )}

      {/* D-072 — red geri alınmaz; talep eden yeniden başvurmaya çağrılır. */}
      {canReinvite(req, room, state.currentUserId, state.groups) && !reinviting && (
        <div className="reqactions">
          <Button variant="outline"
            onClick={() => {
              setReinvite('');
              dispatch({ type: 'startReinvite', requestId: req.id });
            }}>
            Tekrar talep edin
          </Button>
          <span className="spacer" />
          <span className="shd__foot">
            Red kaydı durur; talep edene yeniden başvurma daveti gider.
          </span>
        </div>
      )}

      {reinviting && (
        <div className="reqactions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="reqreason">
            <div className="reqreason__label">
              Neden tekrar isteniyor? (zorunlu) — talep edene iletilir.
            </div>
            <textarea className="textinput" rows={2} value={reinvite} autoFocus
              aria-label="Davet gerekçesi"
              placeholder="Örn. çakışan rezervasyon kaldırıldı, oda boşaldı."
              onChange={(e) => setReinvite(e.target.value)} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 12 }}>
            <Button variant="primary" disabled={!reinvite.trim()}
              onClick={() => dispatch({
                type: 'sendReinvite', requestId: req.id, reason: reinvite,
              })}>
              Gönder
            </Button>
            <Button variant="secondary"
              onClick={() => dispatch({ type: 'startReinvite', requestId: null })}>
              Vazgeç
            </Button>
          </div>
        </div>
      )}

      {req.reinvitedById && (
        <div className="reqdecision">
          <strong>Tekrar talep daveti gönderildi</strong>
          {' · '}{userById(state, req.reinvitedById)?.name}
          <br />Gerekçe: {req.reinviteReason}
          <br />⚠️ Red kaydı değişmedi; yeni talep {userById(state, req.requesterId)?.name}
          {' '}tarafından gönderilmelidir.
        </div>
      )}
    </div>
  );
}
