import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { NavRail } from '../shell/NavRail';
import { canViewRoom } from '../../lib/domain/rules';
import { Icon } from '../primitives/Icon';
import { PersonaSwitcher } from '../demo/PersonaSwitcher';
import type { Room } from '../../lib/domain/types';

/**
 * İzinler rail'i — **özne ekseni**. Tablo oda eksenlidir; rail ters eksenden bakar:
 * *"bu grup/kullanıcı hangi odalarda yetkili"*. Seçim tabloyu süzer.
 */
/**
 * Öznenin **açıkça kayıtlı** olduğu oda sayısı.
 * ⚠️ `allUsers` sayılmaz: tüm odalar herkese açık olduğundan her özne için aynı sayıyı
 * verir ve rail hiçbir bilgi taşımazdı. Soru "kim nerede yetkili" değil,
 * **"kimin nerede kaydı var"**.
 */
function explicitRooms(rooms: Room[], subjectId: string, groupIds: string[]): number {
  const hit = (a: { userIds: string[]; groupIds: string[] }) =>
    a.userIds.includes(subjectId) || a.groupIds.includes(subjectId)
    || a.groupIds.some((g) => groupIds.includes(g));
  return rooms.filter((r) => hit(r.canView) || hit(r.canReserve)).length;
}

export function PermissionsSidebar() {
  const state = useAppState();
  const dispatch = useDispatch();
  const rooms = state.rooms.filter((r) => canViewRoom(r, state.currentUserId, state.groups));
  const sel = state.ui.permissionSubjectId;

  const listed = state.users
    .map((u) => ({
      u,
      n: explicitRooms(rooms, u.id,
        state.groups.filter((g) => g.memberIds.includes(u.id)).map((g) => g.id)),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const hidden = state.users.length - listed.length;

  const pick = (id: string | null) =>
    dispatch({ type: 'selectPermissionSubject', subjectId: sel === id ? null : id });

  return (
    <div className="sidebar">
      <NavRail />
      <div className="sidebar__hair" />

      <section className="subjlist" aria-label="Özneler">
        <div className="callist__head">
          <span className="callist__title">Özneler</span>
          <span className="spacer" />
          <span className="subjlist__meta">
            {state.groups.length} grup · {state.users.length} kullanıcı
          </span>
        </div>

        <button className={`subjrow subjrow--all${sel === null ? ' is-active' : ''}`}
          onClick={() => pick(null)}>
          <span className="subjrow__name">Tüm özneler</span>
          <span className="subjrow__count">{rooms.length} oda</span>
        </button>

        <div className="sectionlabel subjlist__group">Gruplar</div>
        {state.groups.map((g) => (
          <button key={g.id} className={`subjrow${sel === g.id ? ' is-active' : ''}`}
            onClick={() => pick(g.id)}>
            <Icon name="people" size={14} color="var(--text-tertiary)" />
            <span className="subjrow__name">{g.name}</span>
            <span className="subjrow__count">{explicitRooms(rooms, g.id, [])} oda</span>
          </button>
        ))}

        {/* ⚠️ Açık kaydı olmayan kullanıcı listelenmez — 28 satırın 24'ü boş olurdu. */}
        <div className="sectionlabel subjlist__group">Kullanıcılar</div>
        {listed.map(({ u, n }) => (
          <button key={u.id} className={`subjrow${sel === u.id ? ' is-active' : ''}`}
            onClick={() => pick(u.id)}>
            <span className="avatar avatar--sm">{u.initials}</span>
            <span className="subjrow__name">{u.name}</span>
            <span className="subjrow__count">{n} oda</span>
          </button>
        ))}
        {hidden > 0 && (
          <div className="subjlist__rest">
            {hidden} kullanıcının açık kaydı yok — tüm odalar zaten herkese görünür.
          </div>
        )}
      </section>

      <span className="spacer" />
      <PersonaSwitcher />
    </div>
  );
}
