import { useEffect, useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  completeViewFromReserve, isAccessRuleValid, roomApprovalConfigValid,
} from '../../lib/domain/rules';
import { userById } from '../../lib/domain/selectors';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import type { Room, UserId } from '../../lib/domain/types';

const FEATURES = ['Projeksiyon', 'Video konferans', 'Beyaz tahta'];

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
  const selectedId = state.ui.selectedRoomId ?? state.rooms[0]?.id ?? null;
  const source = state.rooms.find((r) => r.id === selectedId) ?? null;
  const [form, setForm] = useState<Room | null>(source);
  const [approverQuery, setApproverQuery] = useState('');

  useEffect(() => { setForm(source); setApproverQuery(''); }, [source]);

  const blocking = useMemo(() => {
    if (!form) return [];
    const out: string[] = [];
    if (!form.name.trim()) out.push('Oda adı gerekli');
    if (!roomApprovalConfigValid(form)) out.push('En az bir onaylayıcı seçin.');
    if (!isAccessRuleValid(form.canView)) out.push('“Görebilir” kuralı boş bırakılamaz.');
    if (!isAccessRuleValid(form.canReserve)) out.push('“Rezerve edebilir” kuralı boş bırakılamaz.');
    return out;
  }, [form]);

  const approverSuggestions = useMemo(() => {
    if (!form) return [];
    const q = approverQuery.trim().toLocaleLowerCase('tr-TR');
    return state.users
      .filter((u) => u.orgId === 'narbulut' && !form.approverUserIds.includes(u.id))
      .filter((u) => (q ? u.name.toLocaleLowerCase('tr-TR').includes(q) : true))
      .slice(0, q ? 5 : 2);
  }, [approverQuery, state.users, form]);

  if (!form) return <div className="admin" />;

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
          <span className="roomedit__title">{form.name || 'Oda'}</span>
          <span className="roomedit__eyebrow">Oda ayarları</span>
          <span className="spacer" />
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
                <select id="room-building" className="textinput" value={form.buildingId}
                  onChange={(e) => setForm({ ...form, buildingId: e.target.value as Room['buildingId'] })}>
                  {state.buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="formfield" style={{ flex: 1 }}>
                <label htmlFor="room-floor">Kat</label>
                <input id="room-floor" className="textinput" value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
            </div>
          </Block>
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
          <Button variant="secondary" onClick={() => setForm(source)}>Vazgeç</Button>
          <Button variant="primary" disabled={blocking.length > 0}
            onClick={() => {
              const { room, changed } = completeViewFromReserve(form);
              dispatch({ type: 'saveRoom', room });
              if (changed) {
                dispatch({
                  type: 'toast',
                  message: 'Rezerve edebilme görebilmeyi gerektirdiği için görüntüleme hakkı otomatik eklendi.',
                });
              }
            }}>Kaydet</Button>
        </div>
      </div>
    </div>
  );
}
