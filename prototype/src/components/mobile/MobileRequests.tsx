import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  decidedRequests, myRequests, pendingRequests, roomById, userById,
} from '../../lib/domain/selectors';
import { hhmm, shortDateLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { MobileNav } from './MobileNav';
import { RequestDetail } from '../requests/RequestsScreen';
import type { ApprovalRequest } from '../../lib/domain/types';

const pill: Record<string, { cls: string; label: string }> = {
  pending: { cls: 'pill--pending', label: 'Onay bekliyor' },
  approved: { cls: 'pill--approved', label: 'Onaylandı' },
  rejected: { cls: 'pill--rejected', label: 'Reddedildi' },
  cancelled: { cls: 'pill--cancelled', label: 'İptal edildi' },
};

/**
 * 06 · Talepler mobil — **iki adım**: liste → detay.
 *
 * ⚠️ Detaydaki geri **listeye** döner. Ana bölümün geri oku yoktur (D-074);
 * bu ikisi farklı şeydir ve karışmamalıdır.
 */
export function MobileRequests() {
  const state = useAppState();
  const dispatch = useDispatch();
  const pending = pendingRequests(state);
  const decided = decidedRequests(state);
  const all = myRequests(state);
  const selected = all.find((r) => r.id === state.ui.selectedRequestId) ?? null;

  if (selected) {
    return (
      <div className="mscreen">
        <header className="mhead">
          <button className="mhead__back" aria-label="Listeye dön"
            onClick={() => dispatch({ type: 'selectRequest', requestId: null })}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <span className="mhead__title">Listeye dön</span>
        </header>
        <div className="mscreen__body mscreen__body--flush">
          <RequestDetail req={selected} />
        </div>
      </div>
    );
  }

  const Row = ({ req }: { req: ApprovalRequest }) => {
    const event = state.events.find((e) => e.id === req.eventId);
    const room = roomById(state, req.roomId);
    const own = req.requesterId === state.currentUserId;
    const p = pill[req.status];
    return (
      <button className="mcard" onClick={() => dispatch({ type: 'selectRequest', requestId: req.id })}>
        <div className="mcard__main">
          <div className="mcard__top">
            <span className="mcard__name">{event?.title ?? 'Etkinlik'}</span>
            <span className={`pill ${p.cls}`}>{p.label}</span>
          </div>
          <div className="mcard__sub">
            {room?.name}{event ? ` · ${shortDateLabel(event.date)}, ${hhmm(event.start)}` : ''}
          </div>
          <div className="mcard__who">
            {own ? 'Sizin talebiniz' : userById(state, req.requesterId)?.name}
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--text-faint)" />
      </button>
    );
  };

  return (
    <div className="mscreen">
      <header className="mhead">
        <span className="mhead__title">Talepler</span>
        <span className="spacer" />
        <span className="mhead__meta">
          {pending.length ? `${pending.length} bekleyen` : 'bekleyen yok'}
        </span>
      </header>

      <div className="mscreen__body">
        {all.length === 0 ? (
          <div className="aempty">
            <span className="aempty__icon"><Icon name="clock" size={22} color="var(--text-tertiary)" /></span>
            <div className="aempty__title">Henüz hiç talep yok</div>
            <div className="aempty__body">
              Onay gerektiren bir oda seçtiğinizde talebiniz burada görünür.
            </div>
          </div>
        ) : (
          <>
            <div className="sectionlabel mlist__group">Bekleyenler</div>
            {pending.length === 0 && (
              <div className="mlist__empty">Karar bekleyen talep yok.</div>
            )}
            {pending.map((r) => <Row key={r.id} req={r} />)}

            {decided.length > 0 && (
              <>
                <div className="sectionlabel mlist__group">Karara bağlananlar</div>
                {decided.map((r) => <Row key={r.id} req={r} />)}
              </>
            )}
          </>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
