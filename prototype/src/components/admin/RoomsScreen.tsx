import { useEffect, useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  completeViewFromReserve, isAccessRuleValid, roomApprovalConfigValid,
} from '../../lib/domain/rules';
import { userById } from '../../lib/domain/selectors';
import { Button } from '../primitives/Button';
import { RoomSchedule } from './RoomSchedule';
import { Icon } from '../primitives/Icon';
import type { BuildingId, Room, UserId } from '../../lib/domain/types';

/** BR-PRM-03 — yeni odada her iki erişim kuralı da "Tüm kullanıcılar" ile başlar. */
const blankRoom = (buildingId: BuildingId | ''): Room => ({
  id: 'room_draft' as Room['id'],
  name: '', buildingId: (buildingId || 'bld_ana') as BuildingId, floor: '',
  capacity: 8, features: [], active: true,
  requiresApproval: false, approverUserIds: [], approverGroupIds: [],
  canView: { allUsers: true, userIds: [], groupIds: [] },
  canReserve: { allUsers: true, userIds: [], groupIds: [] },
});

const FEATURES = ['Projeksiyon', 'Video konferans', 'Beyaz tahta'];

/**
 * BR-ROOM-31 — rezervasyon kaydı olan oda silinemez; pasife alınır.
 * Sebep hover gerektirmeden okunur (`11` ST-DIS-02).
 */
function RoomDeleteAction({ room }: { room: Room }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const bookings = state.reservations.filter((r) => r.roomId === room.id).length;
  if (bookings > 0) {
    return (
      <span className="inlinemsg inlinemsg--info" style={{ marginRight: 4 }}>
        <Icon name="lock" size={14} />
        {bookings} rezervasyon kaydı var — silinemez, pasife alınabilir
      </span>
    );
  }
  return (
    <button className="evd__link evd__link--quiet" style={{ paddingTop: 0 }}
      onClick={() => dispatch({
        type: 'askConfirm',
        confirm: {
          title: `${room.name} silinsin mi?`,
          body: 'Bu odanın hiç rezervasyon kaydı yok, bu yüzden silinebilir. İşlem geri alınamaz.',
          confirmLabel: 'Sil', tone: 'destructive',
          action: { type: 'deleteRoom', roomId: room.id },
        },
      })}>Sil</button>
  );
}

function Block({ title, sub, children }: {
  title: string; sub: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="formblock__title">{title}</div>
      <div className="formblock__sub">{sub}</div>
      <div className="formblock__content">{children}</div>
    </section>
  );
}

export function RoomsScreen() {
  const state = useAppState();
  const dispatch = useDispatch();
  const creating = state.ui.creatingRoom;
  const selectedId = state.ui.selectedRoomId ?? (creating ? null : state.rooms[0]?.id ?? null);
  const source = creating
    ? blankRoom(state.buildings[0]?.id ?? '')
    : state.rooms.find((r) => r.id === selectedId) ?? null;
  const [form, setForm] = useState<Room | null>(source);
  const [approverQuery, setApproverQuery] = useState('');
  const [newBuilding, setNewBuilding] = useState<string | null>(null);
  const [pendingBuilding, setPendingBuilding] = useState<string | null>(null);

  // Yeni bina reducer'da oluşturulduktan sonra forma bağlanır.
  useEffect(() => {
    if (!pendingBuilding) return;
    const b = state.buildings.find((x) => x.name === pendingBuilding);
    if (b) { setForm((f) => (f ? { ...f, buildingId: b.id } : f)); setPendingBuilding(null); }
  }, [pendingBuilding, state.buildings]);

  useEffect(() => {
    setForm(source);
    setApproverQuery('');
    setNewBuilding(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, creating]);

  const blocking = useMemo(() => {
    if (!form) return [];
    const out: string[] = [];
    if (!form.name.trim()) out.push('Oda adı gerekli');
    // BR-ROOM-02 — oda adı organizasyon içinde benzersizdir.
    if (form.name.trim() && state.rooms.some((r) => r.id !== form.id
      && r.name.trim().toLocaleLowerCase('tr-TR') === form.name.trim().toLocaleLowerCase('tr-TR'))) {
      out.push('Bu adda bir oda zaten var.');
    }
    if (!roomApprovalConfigValid(form)) out.push('En az bir onaylayıcı seçin.');
    if (!isAccessRuleValid(form.canView)) out.push('“Görebilir” kuralı boş bırakılamaz.');
    if (!isAccessRuleValid(form.canReserve)) out.push('“Rezerve edebilir” kuralı boş bırakılamaz.');
    return out;
  }, [form, state.rooms]);

  const approverSuggestions = useMemo(() => {
    if (!form) return [];
    const q = approverQuery.trim().toLocaleLowerCase('tr-TR');
    return state.users
      .filter((u) => u.orgId === 'narbulut' && !form.approverUserIds.includes(u.id))
      .filter((u) => (q ? u.name.toLocaleLowerCase('tr-TR').includes(q) : true))
      .slice(0, q ? 5 : 2);
  }, [approverQuery, state.users, form]);

  if (!form) return <div className="admin" />;

  /** BR-ROOM-30 — bina, ayrı bir yönetim ekranı olmadan oda formundan oluşturulur. */
  const addBuilding = () => {
    const name = (newBuilding ?? '').trim();
    if (!name) return;
    const existing = state.buildings.find(
      (b) => b.name.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'));
    if (existing) {
      setForm({ ...form, buildingId: existing.id });
    } else {
      dispatch({ type: 'createBuilding', name });
      setPendingBuilding(name);
    }
    setNewBuilding(null);
  };

  const accessValue = (key: 'canView' | 'canReserve') =>
    (form[key].allUsers ? 'all' : 'subjects');

  const setAccess = (key: 'canView' | 'canReserve', value: string) => {
    setForm({ ...form, [key]: { ...form[key], allUsers: value === 'all' } });
  };

  const subjectSummary = (key: 'canView' | 'canReserve') => {
    const r = form[key];
    const names = [
      ...r.groupIds.map((g) => state.groups.find((x) => x.id === g)?.name),
      ...r.userIds.map((u) => userById(state, u)?.name),
    ].filter(Boolean);
    return names.length ? names.join(', ') : 'Henüz özne eklenmedi';
  };

  return (
    <div className="admin">
      <div className="roomedit">
        <header className="roomedit__head">
          <span className="roomedit__title">{form.name || (creating ? 'Yeni oda' : 'Oda')}</span>
          <span className="roomedit__eyebrow">{creating ? 'Oluşturuluyor' : 'Oda ayarları'}</span>
          <span className="spacer" />
          {!creating && <RoomDeleteAction room={form} />}
          <button className="switch" aria-pressed={form.active}
            onClick={() => setForm({ ...form, active: !form.active })}>
            <span className={`switch__track${form.active ? ' is-on' : ''}`}>
              <span className="switch__knob" />
            </span>
            Aktif
          </button>
          <Button variant="outline" size="sm"
            onClick={() => dispatch({ type: 'navigate', route: 'calendar' })}>Önizle</Button>
        </header>

        <div className="roomedit__body">
          <Block title="Genel" sub="Oda kimliği ve kısa kodu">
            <div className="formrow">
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="room-name">Oda adı</label>
                <input id="room-name" className={`textinput${form.name.trim() ? '' : ' is-invalid'}`}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="formfield" style={{ width: 140 }}>
                <label htmlFor="room-code">Kısa kod</label>
                <input id="room-code" className="textinput" readOnly
                  value={`${form.name.slice(0, 3).toLocaleUpperCase('tr-TR')}-${(form.floor.replace(/\D/g, '') || '0').padStart(2, '0')}`} />
              </div>
            </div>
          </Block>

          <Block title="Erişim" sub="Kim görebilir, kim rezerve edebilir">
            <div className="formrow" style={{ alignItems: 'flex-start' }}>
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="acc-view">Görebilir</label>
                <select id="acc-view" className="textinput" value={accessValue('canView')}
                  onChange={(e) => setAccess('canView', e.target.value)}>
                  <option value="all">Tüm kullanıcılar</option>
                  <option value="subjects">Seçili kişi ve gruplar</option>
                </select>
                {!form.canView.allUsers && (
                  <span className="formblock__sub">{subjectSummary('canView')}</span>
                )}
              </div>
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="acc-res">Rezerve edebilir</label>
                <select id="acc-res" className="textinput" value={accessValue('canReserve')}
                  onChange={(e) => setAccess('canReserve', e.target.value)}>
                  <option value="all">Tüm kullanıcılar</option>
                  <option value="subjects">Seçili kişi ve gruplar</option>
                </select>
                {!form.canReserve.allUsers && (
                  <span className="formblock__sub">{subjectSummary('canReserve')}</span>
                )}
              </div>
            </div>
            <button className="evd__link" style={{ marginTop: 12 }}
              onClick={() => dispatch({ type: 'navigate', route: 'permissions' })}>
              Özne listelerini İzinler ekranında düzenle
            </button>
          </Block>

          <Block title="Kapasite ve özellikler" sub="Odanın fiziksel kapasitesi ve ekipmanı">
            <div className="formfield" style={{ width: 110 }}>
              <label htmlFor="room-cap">Kapasite</label>
              <input id="room-cap" className="textinput" type="number" min={1} value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || 1 })} />
            </div>
            <div style={{ marginTop: 14 }}>
              {FEATURES.map((f) => {
                const on = form.features.includes(f);
                return (
                  <button key={f} className={`featchip${on ? ' is-on' : ''}`} aria-pressed={on}
                    onClick={() => setForm({
                      ...form,
                      features: on ? form.features.filter((x) => x !== f) : [...form.features, f],
                    })}>
                    {on && <Icon name="check" size={13} />}{f}
                  </button>
                );
              })}
            </div>
          </Block>

          <Block title="Rezervasyon onayı" sub="Bu oda için geçerlidir">
            <button className="switch" aria-pressed={form.requiresApproval}
              onClick={() => setForm({ ...form, requiresApproval: !form.requiresApproval })}>
              <span className={`switch__track${form.requiresApproval ? ' is-on' : ''}`}>
                <span className="switch__knob" />
              </span>
              Onay gerekli
            </button>

            {form.requiresApproval && (
              <div style={{ marginTop: 16 }}>
                <div className="formfield">
                  <label htmlFor="approver-search">Onaylayıcılar</label>
                  <input id="approver-search"
                    className={`textinput${roomApprovalConfigValid(form) ? '' : ' is-invalid'}`}
                    value={approverQuery} placeholder="Kişi arayın"
                    onChange={(e) => setApproverQuery(e.target.value)} />
                </div>
                {!roomApprovalConfigValid(form) && (
                  <div className="inlinemsg inlinemsg--error" style={{ marginTop: 8 }}>
                    En az bir onaylayıcı seçin.
                  </div>
                )}
                <div className="tokenlist" style={{ marginTop: 12 }}>
                  {form.approverUserIds.map((id) => (
                    <span className="token" key={id}>
                      {userById(state, id)?.name}
                      <button aria-label={`${userById(state, id)?.name} onaylayıcılardan çıkar`}
                        onClick={() => setForm({
                          ...form, approverUserIds: form.approverUserIds.filter((x) => x !== id),
                        })}>
                        <Icon name="close" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  {approverSuggestions.map((u) => (
                    <div className="approversugg" key={u.id}>
                      <b>{u.name}</b><span>{u.title}</span>
                      <span className="spacer" />
                      <button className="evd__link" style={{ paddingTop: 0 }}
                        onClick={() => {
                          setForm({ ...form, approverUserIds: [...form.approverUserIds, u.id as UserId] });
                          setApproverQuery('');
                        }}>Ekle</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Block>

          <Block title="Lokasyon" sub="Bina tanımlı değilse görünmez">
            <div className="formrow">
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="room-building">Bina</label>
                {newBuilding === null ? (
                  <select id="room-building" className="textinput" value={form.buildingId}
                    onChange={(e) => {
                      if (e.target.value === '__new__') { setNewBuilding(''); return; }
                      setForm({ ...form, buildingId: e.target.value as BuildingId });
                    }}>
                    {state.buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    <option value="__new__">＋ Yeni bina ekle…</option>
                  </select>
                ) : (
                  <div className="newbuilding">
                    <input className="textinput" autoFocus value={newBuilding}
                      aria-label="Yeni bina adı" placeholder="Bina adı"
                      onChange={(e) => setNewBuilding(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addBuilding(); }} />
                    <Button variant="outline" size="sm" disabled={!newBuilding.trim()}
                      onClick={addBuilding}>Ekle</Button>
                    <Button variant="secondary" size="sm"
                      onClick={() => setNewBuilding(null)}>Vazgeç</Button>
                  </div>
                )}
              </div>
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="room-floor">Kat</label>
                <input id="room-floor" className="textinput" value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
            </div>
          </Block>

          {/* Odaya bakarken "kimin, ne zaman isteği var" sorusunun cevabı */}
          {!creating && <RoomSchedule room={source!} />}
        </div>

        <div className="adminfoot">
          <span className="adminfoot__info">
            {form.name || 'Oda'} &nbsp; {form.capacity} kişilik &nbsp; {form.active ? 'Aktif' : 'Pasif'}
            {form.requiresApproval ? '   Onay gerekli' : ''}
          </span>
          <span className="spacer" />
          {blocking.length > 0 && (
            <span className="inlinemsg inlinemsg--error">
              <Icon name="xCircle" size={14} />{blocking.length} engelleyici sorun
            </span>
          )}
          <Button variant="secondary"
            onClick={() => (creating ? dispatch({ type: 'cancelRoomDraft' }) : setForm(source))}>
            Vazgeç
          </Button>
          <Button variant="primary" disabled={blocking.length > 0}
            onClick={() => {
              const { room, changed } = completeViewFromReserve(form);
              dispatch(creating ? { type: 'createRoom', room } : { type: 'saveRoom', room });
              if (changed) {
                dispatch({
                  type: 'toast',
                  message: 'Rezerve edebilme görebilmeyi gerektirdiği için görüntüleme hakkı otomatik eklendi.',
                });
              }
            }}>{creating ? 'Odayı oluştur' : 'Kaydet'}</Button>
        </div>
      </div>
    </div>
  );
}
