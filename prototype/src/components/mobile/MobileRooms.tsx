import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { canViewRoom } from '../../lib/domain/rules';
import { Icon } from '../primitives/Icon';
import { MobileNav } from './MobileNav';
import { RoomsScreen } from '../admin/RoomsScreen';

/**
 * 02 · Odalar mobil — **liste önce**. Rail'in mobil karşılığı bir liste ekranıdır;
 * seçince ayar/takvim ekranına geçilir, geri ile listeye dönülür.
 * ⚠️ Talepler mobilinde de aynı desen geçerli — üründe tek master-detail davranışı olsun.
 */
export function MobileRooms() {
  const state = useAppState();
  const dispatch = useDispatch();
  const rooms = state.rooms.filter((r) => canViewRoom(r, state.currentUserId, state.groups));

  /**
   * ⚠️ Liste/detay kararı `ui.selectedRoomId`'ye bağlanamaz: o alan masaüstü için
   * `room_istanbul` ile başlar (rail ve detay yan yana durduğundan doğru). Mobilde
   * liste **önce** gelmeli, o yüzden açılış yerel tutulur.
   */
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId || state.ui.creatingRoom) {
    return (
      <div className="mscreen">
        <header className="mhead">
          <button className="mhead__back" aria-label="Odalara dön"
            onClick={() => {
              setOpenId(null);
              if (state.ui.creatingRoom) dispatch({ type: 'cancelRoomDraft' });
            }}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <span className="mhead__title">Odalar</span>
        </header>
        <div className="mscreen__body"><RoomsScreen /></div>
      </div>
    );
  }

  return (
    <div className="mscreen">
      <header className="mhead">
        <span className="mhead__title">Odalar</span>
        <span className="spacer" />
        <button className="mhead__act" aria-label="Oda ekle"
          onClick={() => dispatch({ type: 'startRoomDraft' })}>
          <Icon name="plus" size={17} />
        </button>
      </header>

      <div className="mscreen__body">
        {rooms.length === 0 && (
          <div className="aempty">
            <span className="aempty__icon"><Icon name="building" size={22} color="var(--text-tertiary)" /></span>
            <div className="aempty__title">Henüz oda yok</div>
          </div>
        )}
        {rooms.map((room) => {
          const pending = state.reservations.filter(
            (r) => r.roomId === room.id && r.status === 'pending' && r.date >= state.today).length;
          const building = state.buildings.find((b) => b.id === room.buildingId)?.name;
          return (
            <button className="mcard" key={room.id}
              onClick={() => {
                dispatch({ type: 'selectRoom', roomId: room.id });
                dispatch({ type: 'setRoomTab', tab: 'settings' });
                setOpenId(room.id);
              }}>
              <div className="mcard__main">
                <div className="mcard__top">
                  <span className="mcard__name">{room.name}</span>
                  {!room.active && <span className="pill pill--cancelled">Pasif</span>}
                </div>
                <div className="mcard__sub">
                  {room.capacity} kişilik · {building}, {room.floor}
                </div>
                {pending > 0 && (
                  <div className="mcard__pending">
                    <Icon name="clock" size={13} color="var(--warning)" />
                    {pending} bekleyen talep
                  </div>
                )}
              </div>
              <Icon name="chevronRight" size={16} color="var(--text-faint)" />
            </button>
          );
        })}
      </div>
      <MobileNav />
    </div>
  );
}
