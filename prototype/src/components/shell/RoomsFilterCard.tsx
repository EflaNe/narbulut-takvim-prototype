import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { filterableRooms } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';

/**
 * Sol rail'in **oda ekseni** (`KEEP-03`, `14` BR-SHELL-31).
 *
 * Canonical 01'deki "Filtreler" kartının yerini alır: o kart D-037 ile kaldırılan
 * "Etkinlik türü" eksenini ve hiçbir kararı olmayan "Katılımcı" eksenini taşıyordu.
 */
export function RoomsFilterCard() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const rooms = filterableRooms(state);
  const hidden = rooms.filter((r) => state.ui.hiddenRoomIds.includes(r.id));

  // BR-SHELL-32 — kapalı bölümde kaç öğenin gizlendiği okunabilir olmalı.
  const hiddenEventCount = hidden.length
    ? state.events.filter((e) => e.roomId && hidden.some((r) => r.id === e.roomId)).length
    : 0;

  if (!rooms.length) return null;

  return (
    <section className="callist" aria-label="Odalar">
      <button className="callist__head" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <span className="callist__title">Odalar</span>
        {hidden.length > 0 && (
          <span className="callist__count" style={{ marginLeft: 8 }}>
            {hidden.length} kapalı
          </span>
        )}
        <span className="spacer" />
        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={15} />
        </span>
      </button>

      {open ? rooms.map((room) => {
        const on = !state.ui.hiddenRoomIds.includes(room.id);
        return (
          <div className="calrow" key={room.id}>
            <button className={`calrow__check${on ? ' is-on' : ''}`}
              style={on ? { background: 'var(--text-secondary)' } : undefined}
              role="switch" aria-checked={on} aria-label={`${room.name} odası görünürlüğü`}
              onClick={() => dispatch({ type: 'toggleRoomFilter', roomId: room.id })}>
              {on && <Icon name="check" size={11} color="#fff" />}
            </button>
            <span className={`calrow__name${on ? '' : ' is-off'}`}>{room.name}</span>
            <span className="spacer" />
            <span className="calrow__owner" style={{ flex: 'none' }}>{room.capacity} kişilik</span>
          </div>
        );
      }) : (
        <div className="callist__collapsed">
          {hidden.length
            ? `${hidden.length} oda kapalı · ${hiddenEventCount} etkinlik gizli`
            : `${rooms.length} oda · tümü açık`}
        </div>
      )}

      {open && hidden.length > 0 && (
        <button className="callist__reset"
          onClick={() => dispatch({ type: 'setAllRoomFilters', on: true })}>
          Tümünü göster
        </button>
      )}
    </section>
  );
}
