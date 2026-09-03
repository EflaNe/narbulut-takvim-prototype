import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { NavRail } from '../shell/NavRail';
import { decidedRequests, myRequests, pendingRequests, roomById, userById } from '../../lib/domain/selectors';
import { hhmm, shortDateLabel } from '../../lib/domain/time';
import { PersonaSwitcher } from '../demo/PersonaSwitcher';
import type { ApprovalRequest } from '../../lib/domain/types';

const pill: Record<string, { cls: string; label: string }> = {
  approved: { cls: 'pill--approved', label: 'Onaylandı' },
  rejected: { cls: 'pill--rejected', label: 'Reddedildi' },
  cancelled: { cls: 'pill--cancelled', label: 'İptal edildi' },
};

function Row({ req, active }: { req: ApprovalRequest; active: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const event = state.events.find((e) => e.id === req.eventId);
  const room = roomById(state, req.roomId);
  const requester = userById(state, req.requesterId);
  const own = req.requesterId === state.currentUserId;
  const p = pill[req.status];

  return (
    <button className={`reqrow${active ? ' is-active' : ''}`}
      onClick={() => dispatch({ type: 'selectRequest', requestId: req.id })}>
      <span className="reqrow__top">
        <span className="reqrow__title">{event?.title ?? 'Etkinlik'}</span>
        {p && <span className={`pill ${p.cls}`}>{p.label}</span>}
      </span>
      <span className="reqrow__when">
        {room?.name}{event ? ` · ${shortDateLabel(event.date)}, ${hhmm(event.start)}` : ''}
      </span>
      <span className="reqrow__who">{own ? 'Sizin talebiniz' : requester?.name}</span>
    </button>
  );
}

/** Talepler rail'i — liste master-detail'den rail'e taşındı (D-074). */
export function RequestsSidebar() {
  const state = useAppState();
  const dispatch = useDispatch();
  const pending = pendingRequests(state);
  const decided = decidedRequests(state);
  const all = myRequests(state);
  const selected = all.find((r) => r.id === state.ui.selectedRequestId) ?? pending[0] ?? decided[0];
  const filter = state.ui.requestFilter;

  return (
    <div className="sidebar">
      <NavRail />
      <div className="sidebar__hair" />

      <div className="reqfilter" role="tablist" aria-label="Talep süzgeci">
        {([['pending', 'Bekleyenler'], ['all', 'Tümü']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={filter === id}
            className={filter === id ? 'is-active' : undefined}
            onClick={() => dispatch({ type: 'setRequestFilter', filter: id })}>
            {label}
          </button>
        ))}
      </div>

      <section className="reqlist2" aria-label="Talepler">
        <div className="reqlist2__group">
          <span>Bekleyenler</span><span className="spacer" /><span>{pending.length}</span>
        </div>
        {pending.length === 0 && (
          <div className="reqlist2__empty">Karar bekleyen talep yok.</div>
        )}
        {pending.map((r) => <Row key={r.id} req={r} active={selected?.id === r.id} />)}

        {filter === 'all' && decided.length > 0 && (
          <>
            <div className="reqlist2__group">
              <span>Karara bağlananlar</span><span className="spacer" /><span>{decided.length}</span>
            </div>
            {decided.map((r) => <Row key={r.id} req={r} active={selected?.id === r.id} />)}
          </>
        )}
      </section>

      <span className="spacer" />
      <PersonaSwitcher />
    </div>
  );
}
