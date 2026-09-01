import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { NavRail } from '../shell/NavRail';
import { Icon } from '../primitives/Icon';

/** 04 · Oda yönetimi kendi sol rail'ini taşır — takvim rail'i değil. */
export function RoomsSidebar() {
  const state = useAppState();
  const dispatch = useDispatch();
  const selectedId = state.ui.selectedRoomId ?? state.rooms[0]?.id ?? null;
  const activeCount = state.rooms.filter((r) => r.active).length;
  const pendingCount = state.requests.filter((r) => r.status === 'pending').length;
  const restricted = state.rooms.filter((r) => !r.canReserve.allUsers).length;

  return (
    <div className="sidebar">
      <NavRail />

      <section className="roomlist" aria-label="Odalar">
        <div className="roomlist__head">
          <span className="callist__title">Odalar</span>
          <span className="spacer" />
          <button className="callist__add" aria-label="Oda ekle" title="Oda ekle"
            onClick={() => dispatch({ type: 'toast', message: 'Oda oluşturma bu prototipte kapsam dışıdır.' })}>
            <Icon name="plus" size={14} />
          </button>
        </div>
        {state.rooms.map((room) => (
          <button key={room.id} className={`roomcard${room.id === selectedId ? ' is-active' : ''}`}
            aria-current={room.id === selectedId ? 'true' : undefined}
            onClick={() => dispatch({ type: 'selectRoom', roomId: room.id })}>
            <span className="roomcard__top">
              <span className="roomcard__name">{room.name}</span>
              <span className="roomcard__cap">{room.capacity} kişi</span>
            </span>
            <span className="roomcard__loc">
              {state.buildings.find((b) => b.id === room.buildingId)?.name}, {room.floor}
            </span>
            {(!room.active || room.features.length > 0) && (
              <span className="roomcard__feat">
                {room.active ? room.features.join(' · ') : 'Pasif'}
              </span>
            )}
          </button>
        ))}
      </section>

      <section className="statuscard" aria-label="Durum">
        <div className="statuscard__title">Durum</div>
        <div className="statuscard__row">
          <Icon name="check" size={13} color="var(--text-tertiary)" />
          {activeCount} aktif oda
        </div>
        <button className="statuscard__row is-link"
          onClick={() => dispatch({ type: 'navigate', route: 'requests' })}>
          <Icon name="clock" size={13} />
          {pendingCount} bekleyen talep
        </button>
        <div className="statuscard__row">
          <Icon name="lock" size={13} color="var(--text-tertiary)" />
          {restricted} kısıtlı erişim
        </div>
      </section>
    </div>
  );
}
