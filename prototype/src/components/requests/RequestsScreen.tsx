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
import { AdminHeader } from '../shell/AdminShell';
import { NotificationBell } from '../shell/NotificationBell';
import { Icon } from '../primitives/Icon';
import { RoomTimeline } from './RoomTimeline';
import type { ApprovalRequest } from '../../lib/domain/types';

const statusPill: Record<ApprovalRequest['status'], { cls: string; label: string }> = {
  pending: { cls: 'pill--pending', label: 'Onay bekliyor' },
  approved: { cls: 'pill--approved', label: 'Onaylandı' },
  rejected: { cls: 'pill--rejected', label: 'Reddedildi' },
  cancelled: { cls: 'pill--cancelled', label: 'İptal edildi' },
};

export function RequestsScreen() {
  const state = useAppState();
  const pending = pendingRequests(state);
  const decided = decidedRequests(state);
  const all = myRequests(state);
  const selected = all.find((r) => r.id === state.ui.selectedRequestId)
    ?? pending[0] ?? decided[0] ?? null;

  return (
    <div className="ascreen">
      {/* D-074 — Talepler dördüncü ana bölümdür: geri oku YOKTUR. */}
      <AdminHeader
        title="Talepler"
        meta={[
          <span className="ahead__pending" key="p">
            {pending.length ? `${pending.length} bekleyen talep` : 'Bekleyen talep yok'}
          </span>,
          'karar verilene kadar burada durur',
        ]}
        actions={<NotificationBell />} />

      {/* ⚠️ Karar satır içinde ve anlıktır — alt çubuk yoktur (P3). */}
      <div className="ascreen__body">
        {selected
          ? <RequestDetail req={selected} />
          : <RequestsEmpty hasHistory={decided.length > 0} />}
      </div>
    </div>
  );
}

/** 08 · boş durumlar — "bekleyen yok" ile "hiç talep yok" ayrı iki durumdur. */
function RequestsEmpty({ hasHistory }: { hasHistory: boolean }) {
  const dispatch = useDispatch();
  if (hasHistory) {
    return (
      <div className="aempty">
        <span className="aempty__icon aempty__icon--ok">
          <Icon name="checkCircle" size={22} color="var(--success)" />
        </span>
        <div className="aempty__title">Karar bekleyen talep yok</div>
        <div className="aempty__body">
          Geçmiş kararlar rail'deki “Tümü” süzgecinde durur.
        </div>
      </div>
    );
  }
  return (
    <div className="aempty">
      <span className="aempty__icon">
        <Icon name="clock" size={22} color="var(--text-tertiary)" />
      </span>
      <div className="aempty__title">Henüz hiç talep yok</div>
      <div className="aempty__body">
        Onay gerektiren bir oda seçtiğinizde talebiniz burada görünür.
      </div>
      <Button variant="primary"
        onClick={() => dispatch({ type: 'navigate', route: 'calendar' })}>
        Takvimde oda seç
      </Button>
    </div>
  );
}

export function RequestDetail({ req }: { req: ApprovalRequest }) {
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
            <div className="reqreason__label">
              Gerekçe <span className="reqlabel reqlabel--opt">İsteğe bağlı</span>
            </div>
            <textarea className="textinput" rows={3} value={reason} autoFocus
              aria-label="Red gerekçesi"
              placeholder="Talep edene iletilecek not"
              onChange={(e) => setReason(e.target.value)} />
          </div>
          {/* 09 · ne olacağını söyleyen tek cümle */}
          <div className="reqoutcome">
            Talep «Reddedildi» olarak kapanır, slot boşta kalır. Aynı slottaki diğer
            bekleyen talepler etkilenmez.
          </div>
          <div className="reqacts">
            <span className="spacer" />
            <Button variant="secondary"
              onClick={() => dispatch({ type: 'startReject', requestId: null })}>Vazgeç</Button>
            <Button variant="outline" className="btn--onerror"
              onClick={() => dispatch({ type: 'rejectRequest', requestId: req.id, reason })}>
              Reddet
            </Button>
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
              Davet mesajı <span className="reqlabel reqlabel--req">Zorunlu</span>
            </div>
            <textarea className="textinput" rows={2} value={reinvite} autoFocus
              aria-label="Davet gerekçesi"
              placeholder="Örn. çakışan rezervasyon kaldırıldı, oda boşaldı."
              onChange={(e) => setReinvite(e.target.value)} />
          </div>
          {/* ⚠️ 09 · "geri al" demiyoruz — red kaydı yerinde durur (BR-APR-29a). */}
          <div className="reqoutcome">
            Davet reddi kaldırmaz ve talebi yeniden açmaz.{' '}
            {userById(state, req.requesterId)?.name} yeni bir talep oluşturur; karar
            yeniden verilir.
          </div>
          <div className="reqacts">
            <span className="spacer" />
            <Button variant="secondary"
              onClick={() => dispatch({ type: 'startReinvite', requestId: null })}>
              Vazgeç
            </Button>
            <Button variant="primary" disabled={!reinvite.trim()}
              onClick={() => dispatch({
                type: 'sendReinvite', requestId: req.id, reason: reinvite,
              })}>
              Davet gönder
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
