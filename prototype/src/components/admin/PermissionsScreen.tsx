import { useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { userById } from '../../lib/domain/selectors';
import { completeViewFromReserve } from '../../lib/domain/rules';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import type { AccessRule, GroupId, Room, UserId } from '../../lib/domain/types';

type Column = 'canView' | 'canReserve';

const columnLabel: Record<Column, string> = {
  canView: 'görebilir',
  canReserve: 'rezerve edebilir',
};

export function PermissionsScreen() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [cell, setCell] = useState<{ roomId: string; col: Column } | null>(
    { roomId: state.rooms[3]?.id ?? state.rooms[0].id, col: 'canReserve' },
  );
  const [addQuery, setAddQuery] = useState('');

  const rooms = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return state.rooms;
    return state.rooms.filter((r) => {
      if (r.name.toLocaleLowerCase('tr-TR').includes(q)) return true;
      const subjects = [...r.canView.userIds, ...r.canReserve.userIds]
        .map((id) => userById(state, id)?.name ?? '')
        .concat([...r.canView.groupIds, ...r.canReserve.groupIds]
          .map((id) => state.groups.find((g) => g.id === id)?.name ?? ''));
      return subjects.some((s) => s.toLocaleLowerCase('tr-TR').includes(q));
    });
  }, [query, state]);

  const activeRoom = cell ? state.rooms.find((r) => r.id === cell.roomId) ?? null : null;
  const rule: AccessRule | null = activeRoom && cell ? activeRoom[cell.col] : null;
  const entryCount = rule ? (rule.allUsers ? 1 : rule.userIds.length + rule.groupIds.length) : 0;
  const restrictedRooms = state.rooms.filter((r) => !r.canReserve.allUsers).length;

  const candidates = useMemo(() => {
    const q = addQuery.trim().toLocaleLowerCase('tr-TR');
    if (!q || !rule) return { users: [], groups: [] };
    return {
      users: state.users
        .filter((u) => u.orgId === 'narbulut' && !rule.userIds.includes(u.id))
        .filter((u) => u.name.toLocaleLowerCase('tr-TR').includes(q)).slice(0, 4),
      groups: state.groups
        .filter((g) => !rule.groupIds.includes(g.id))
        .filter((g) => g.name.toLocaleLowerCase('tr-TR').includes(q)).slice(0, 3),
    };
  }, [addQuery, rule, state.users, state.groups]);

  const patchRule = (next: AccessRule) => {
    if (!activeRoom || !cell) return;
    const updated: Room = { ...activeRoom, [cell.col]: next };
    const { room, changed } = cell.col === 'canReserve'
      ? completeViewFromReserve(updated)
      : { room: updated, changed: false };
    dispatch({ type: 'updateRoomAccess', roomId: activeRoom.id, patch: room });
    if (changed) {
      dispatch({
        type: 'toast',
        message: 'Rezerve edebilme görebilmeyi gerektirir; görüntüleme hakkı otomatik eklendi.',
      });
    }
  };

  return (
    <div className="admin">
      <div className="permwrap">
        <header className="permhead">
          <div className="permhead__text">
            <div className="permhead__title">İzinler</div>
            <div className="permhead__sub">
              Hangi kullanıcı ve grup hangi odayı görebiliyor, hangisini rezerve edebiliyor.
              Erişimler eklemeli çalışır.
            </div>
          </div>
          <div className="permtools">
            <div className="searchfield" style={{ width: 300 }}>
              <Icon name="search" size={15} color="var(--text-muted)" />
              <input value={query} placeholder="Oda, kullanıcı veya grup ara" aria-label="Ara"
                onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button variant="primary"
              onClick={() => dispatch({
                type: 'toast',
                message: 'Tablodan bir hücre seçin, sonra sağdaki alandan özne ekleyin.',
              })}>
              <Icon name="plus" size={14} color="#fff" />Erişim ekle
            </Button>
          </div>
        </header>

        <div className="permtable">
          <div className="permtable__head">
            <span>Oda</span><span>Görebilir</span><span>Rezerve edebilir</span><span />
          </div>
          {rooms.map((room) => (
            <div className={`permtable__row${cell?.roomId === room.id ? ' is-active' : ''}`} key={room.id}>
              <div className="permroom">
                <b>{room.name}</b>
                <span>
                  {room.capacity} kişilik ·{' '}
                  {state.buildings.find((b) => b.id === room.buildingId)?.name}, {room.floor}
                </span>
              </div>
              {(['canView', 'canReserve'] as Column[]).map((col) => (
                <button className="permcell" key={col}
                  aria-label={`${room.name} · ${columnLabel[col]} kurallarını düzenle`}
                  onClick={() => { setCell({ roomId: room.id, col }); setAddQuery(''); }}>
                  {room[col].allUsers && (
                    <span className="permtoken permtoken--all">
                      <Icon name="check" size={12} />Tüm kullanıcılar
                    </span>
                  )}
                  {room[col].groupIds.map((g) => (
                    <span className="permtoken" key={g}>
                      <Icon name="people" size={12} />
                      {state.groups.find((x) => x.id === g)?.name}
                    </span>
                  ))}
                  {room[col].userIds.map((u) => (
                    <span className="permtoken" key={u}>
                      <Icon name="person" size={12} />{userById(state, u)?.name}
                    </span>
                  ))}
                </button>
              ))}
              <span style={{ color: 'var(--text-faint)', display: 'flex', justifyContent: 'flex-end' }}>
                <Icon name="chevronRight" size={14} />
              </span>
            </div>
          ))}
        </div>

        <div className="permlower">
        {activeRoom && rule && cell && (
          <div className="permpanel">
            <div className="permpanel__head">
              <span className="permpanel__title">{activeRoom.name} · {columnLabel[cell.col]}</span>
              <span className="permpanel__count">{entryCount} kayıt</span>
              <span className="spacer" />
              <div className="psearch" style={{ marginTop: 0, width: 240 }}>
                <input className="textinput" value={addQuery} placeholder="Kullanıcı veya grup ekle"
                  aria-label="Özne ekle" onChange={(e) => setAddQuery(e.target.value)} />
                {(candidates.users.length > 0 || candidates.groups.length > 0) && (
                  <div className="psearch__results" style={{ top: 40 }}>
                    {candidates.groups.map((g) => (
                      <button key={g.id} onClick={() => {
                        patchRule({ ...rule, groupIds: [...rule.groupIds, g.id as GroupId] });
                        setAddQuery('');
                      }}>
                        <Icon name="people" size={14} color="var(--text-tertiary)" />
                        <span className="n">{g.name}</span>
                        <span className="t">Grup · {g.memberIds.length} üye</span>
                      </button>
                    ))}
                    {candidates.users.map((u) => (
                      <button key={u.id} onClick={() => {
                        patchRule({ ...rule, userIds: [...rule.userIds, u.id as UserId] });
                        setAddQuery('');
                      }}>
                        <span className="avatar avatar--sm">{u.initials}</span>
                        <span className="n">{u.name}</span>
                        <span className="t">{u.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {rule.allUsers && (
                <div className="permentry">
                  <Icon name="people" size={15} color="var(--brand)" />
                  <div>
                    <div className="permentry__name">Tüm kullanıcılar</div>
                    <div className="permentry__meta">Organizasyondaki herkes</div>
                  </div>
                  <span className="spacer" />
                  <button className="shrow__remove"
                    onClick={() => patchRule({ ...rule, allUsers: false })}>Kaldır</button>
                </div>
              )}
              {rule.groupIds.map((gid) => {
                const g = state.groups.find((x) => x.id === gid);
                return (
                  <div className="permentry" key={gid}>
                    <Icon name="people" size={15} color="var(--text-tertiary)" />
                    <div>
                      <div className="permentry__name">{g?.name}</div>
                      <div className="permentry__meta">Grup · {g?.memberIds.length} üye</div>
                    </div>
                    <span className="spacer" />
                    <button className="shrow__remove" onClick={() => patchRule({
                      ...rule, groupIds: rule.groupIds.filter((x) => x !== gid),
                    })}>Kaldır</button>
                  </div>
                );
              })}
              {rule.userIds.map((uid) => {
                const u = userById(state, uid);
                const isApprover = activeRoom.approverUserIds.includes(uid);
                return (
                  <div className="permentry" key={uid}>
                    <span className="avatar avatar--sm">{u?.initials}</span>
                    <div>
                      <div className="permentry__name">{u?.name}</div>
                      <div className="permentry__meta">
                        Kullanıcı · {u?.title}{isApprover ? ' · odanın onaylayıcısı' : ''}
                      </div>
                    </div>
                    <span className="spacer" />
                    <button className="shrow__remove" onClick={() => patchRule({
                      ...rule, userIds: rule.userIds.filter((x) => x !== uid),
                    })}>Kaldır</button>
                  </div>
                );
              })}
              {entryCount === 0 && (
                <div className="inlinemsg inlinemsg--error" style={{ padding: '10px 0' }}>
                  <Icon name="xCircle" size={14} />
                  Bir erişim kuralı boş bırakılamaz. En az bir özne ekleyin veya
                  “Tüm kullanıcılar” seçin.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="permexplain">
          <h4>Erişim nasıl çalışır</h4>
          <p><b>Görebilir</b> — odayı listede ve oda seçicide görür; doluluk bilgisi paylaşılır.</p>
          <p><b>Rezerve edebilir</b> — odayı seçebilir. Yetkisi olmayan odayı görür ama seçemez.</p>
          <p>
            Kayıtlar eklemelidir: kullanıcı kendi hakkı veya üyesi olduğu gruplardan biri yeterliyse
            yetkilenir; engelleme kaydı yoktur.
          </p>
          <p>
            Katılımcı müsaitliği bu ekrandan etkilenmez; free/busy yalnız müsait/meşgul gösterir.
          </p>
        </div>
        </div>

        <div className="permfoot">
          <span className="adminfoot__info">
            {state.rooms.length} oda · {restrictedRooms} odada rezervasyon kısıtlı
          </span>
          <span className="spacer" />
          <Button variant="secondary" onClick={() => dispatch({ type: 'resetDemo' })}>Vazgeç</Button>
          <Button variant="primary"
            onClick={() => dispatch({ type: 'toast', message: 'Erişim kuralları kaydedildi.', tone: 'success' })}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
