import { useAppState } from '../../lib/state/StoreContext';
import { canViewRoom } from '../../lib/domain/rules';
import { userById } from '../../lib/domain/selectors';
import {
  GRID_END_H, GRID_START_H, HOUR_H, hourSlots, longDateLabel, minutesToY, timeRangeLabel,
} from '../../lib/domain/time';

/** "Odalara göre" — sütunlar oda, satırlar saat. Rezervasyon eksenini gösterir. */
export function RoomsGrid() {
  const state = useAppState();
  const date = state.ui.anchorDate;
  const rooms = state.rooms.filter((r) => canViewRoom(r, state.currentUserId, state.groups));

  return (
    <div className="roomsgrid">
      <div className="dayview__head">
        <span className="dayview__title">Odalara göre</span>
        <span className="dayview__sub">{longDateLabel(date)}</span>
        <span className="spacer" />
        <span className="dayview__sub">{rooms.length} oda</span>
      </div>
      <div className="roomsgrid__head">
        <div className="dayhead__gutter" />
        <div className="roomsgrid__cols"
          style={{ gridTemplateColumns: `repeat(${rooms.length}, 1fr)` }}>
          {rooms.map((r) => (
            <div className="roomsgrid__col" key={r.id}>
              {r.name}<span>{r.capacity} kişilik</span>
            </div>
          ))}
        </div>
      </div>
      <div className="gridwrap">
        <div className="grid" style={{ height: (GRID_END_H - GRID_START_H) * HOUR_H }}>
          <div className="grid__gutter">
            {hourSlots().map((h) => (
              <div className="grid__hour" key={h}>{String(h).padStart(2, '0')}:00</div>
            ))}
          </div>
          <div className="grid__canvas">
            <div className="grid__days" style={{ gridTemplateColumns: `repeat(${rooms.length}, 1fr)` }}>
              {rooms.map((room) => {
                const res = state.reservations.filter(
                  (r) => r.roomId === room.id && r.date === date
                    && (r.status === 'reserved' || r.status === 'pending'));
                return (
                  <div className="grid__day" key={room.id}>
                    {res.map((r) => {
                      const requester = userById(state, r.requesterId);
                      return (
                        <div key={r.id}
                          className={`resblock resblock--${r.status}`}
                          style={{
                            top: minutesToY(r.start),
                            height: ((r.end - r.start) / 60) * HOUR_H - 4,
                          }}>
                          <strong>{timeRangeLabel(r.start, r.end)}</strong>
                          {r.status === 'pending' ? 'Onay bekliyor' : requester?.name}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
