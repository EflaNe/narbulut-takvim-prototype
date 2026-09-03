import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { canViewRoom } from '../../lib/domain/rules';
import { userById } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { MobileNav } from './MobileNav';
import type { AccessRule } from '../../lib/domain/types';

/**
 * 04 · İzinler mobil — **oda kartı yığını**.
 *
 * ⚠️ Tablo 390px'e sığmaz, ama satır→detay da olmaz: bu ekranın var oluş sebebi
 * *bir odanın iki iznini karşılaştırabilmek*. Bu yüzden iki hak **aynı kartta**,
 * sabit etiket kolonuyla yan yana okunur (P4).
 */
function tokens(state: ReturnType<typeof useAppState>, rule: AccessRule): string[] {
  if (rule.allUsers) return ['Tüm kullanıcılar'];
  return [
    ...rule.groupIds.map((g) => state.groups.find((x) => x.id === g)?.name ?? '—'),
    ...rule.userIds.map((u) => userById(state, u)?.name ?? '—'),
  ];
}

export function MobilePermissions() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const q = query.trim().toLocaleLowerCase('tr-TR');

  const rooms = state.rooms
    .filter((r) => canViewRoom(r, state.currentUserId, state.groups))
    .filter((r) => !q || r.name.toLocaleLowerCase('tr-TR').includes(q)
      || [...tokens(state, r.canView), ...tokens(state, r.canReserve)]
        .some((t) => t.toLocaleLowerCase('tr-TR').includes(q)));

  return (
    <div className="mscreen">
      <header className="mhead">
        {searching ? (
          <>
            <div className="searchfield" style={{ flex: 1 }}>
              <Icon name="search" size={15} color="var(--text-muted)" />
              <input value={query} autoFocus aria-label="Ara"
                placeholder="Oda, kullanıcı veya grup ara"
                onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="mhead__act" aria-label="Aramayı kapat"
              onClick={() => { setQuery(''); setSearching(false); }}>
              <Icon name="close" size={17} />
            </button>
          </>
        ) : (
          <>
            <span className="mhead__title">İzinler</span>
            <span className="spacer" />
            <button className="mhead__act" aria-label="Ara" onClick={() => setSearching(true)}>
              <Icon name="search" size={17} />
            </button>
          </>
        )}
      </header>

      <div className="mscreen__body">
        {rooms.length === 0 && (
          <div className="aempty">
            <span className="aempty__icon"><Icon name="lock" size={22} color="var(--text-tertiary)" /></span>
            <div className="aempty__title">Eşleşen oda yok</div>
          </div>
        )}
        {rooms.map((room) => (
          <div className="mperm" key={room.id}>
            <div className="mperm__head">
              <span className="mperm__name">{room.name}</span>
              <span className="mperm__loc">
                {room.capacity} kişilik · {state.buildings.find((b) => b.id === room.buildingId)?.name}
              </span>
            </div>
            {([['canView', 'Görebilir'], ['canReserve', 'Rezerve edebilir']] as const).map(([col, label]) => (
              <button className="mperm__row" key={col}
                onClick={() => dispatch({
                  type: 'toast',
                  message: 'Erişim düzenleme masaüstü İzinler ekranındadır.',
                })}>
                <span className="mperm__label">{label}</span>
                <span className="mperm__vals">
                  {tokens(state, room[col]).map((t, i) => (
                    <span className={`permtoken${room[col].allUsers ? ' permtoken--all' : ''}`} key={i}>
                      {room[col].allUsers && <Icon name="check" size={11} />}{t}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        ))}
        {/* BR-PRM-05 — engelleme kaydı yoktur; ekleme daraltma değildir. */}
        <div className="mperm__note">
          Erişimler eklemeli çalışır; engelleme kaydı yoktur. Rezerve edebilen odayı zaten görebilir.
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
