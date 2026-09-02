import { useEffect, useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { roomById, userById } from '../../lib/domain/selectors';
import { canCreatePendingRequest, competingPendingCount, eligibleApprovers, roomAvailability, roomSelectability } from '../../lib/domain/rules';
import {
  DAY_NAMES_LONG, WORK_END_H, WORK_START_H, hhmm, longDateLabel, timeRangeLabel, weekdayIndex,
} from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import { Button } from '../primitives/Button';
import type { Room } from '../../lib/domain/types';

const FILTERS = ['Kapasite', 'Özellik', 'Bina', 'Kat'] as const;

export function RoomPickerDrawer() {
  const state = useAppState();
  const dispatch = useDispatch();
  const draft = state.ui.draft!;
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'closeRoomPicker' });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dispatch]);

  const duration = Math.max(30, draft.end - draft.start);
  const attendees = draft.participantIds.length + 1;

  const rooms = useMemo(() => state.rooms
    .map((room) => ({
      room,
      sel: roomSelectability(
        room, state.currentUserId, state.groups,
        draft.date, draft.start, draft.end, state.reservations, draft.id ?? undefined),
    }))
    .filter(({ sel }) => sel.visible)
    .filter(({ room }) => !query.trim()
      || room.name.toLocaleLowerCase('tr-TR').includes(query.trim().toLocaleLowerCase('tr-TR')))
    .filter(({ room }) => {
      if (activeFilter === 'Kapasite') return room.capacity >= attendees;
      if (activeFilter === 'Özellik') return room.features.length > 0;
      if (activeFilter === 'Bina') return room.buildingId === 'bld_ana';
      if (activeFilter === 'Kat') return room.floor !== 'Zemin';
      return true;
    }),
  [state.rooms, state.currentUserId, state.groups, state.reservations,
    draft.date, draft.start, draft.end, draft.id, query, activeFilter, attendees]);

  /** Odanın o gün içinde bu süre için müsait başlangıç saatleri. */
  const freeStarts = (room: Room): number[] => {
    const out: number[] = [];
    for (let s = WORK_START_H * 60; s + duration <= WORK_END_H * 60; s += 30) {
      const av = roomAvailability(
        room.id, draft.date, s, s + duration, state.reservations, draft.id ?? undefined);
      // D-070 — bekleyen talep saati kapatmaz.
      if (av !== 'reserved') out.push(s);
      if (out.length >= 7) break;
    }
    return out;
  };

  const selectedRoom = roomById(state, draft.roomId);

  return (
    <>
      <div className="scrim" onClick={() => dispatch({ type: 'closeRoomPicker' })} />
      <aside className="roompicker" style={{ right: 680, width: 640 }}
        role="dialog" aria-modal="true" aria-label="Oda seç">
        <div className="rp__head">
          <div className="rp__titlerow">
            <span className="rp__title">Oda seç</span>
            <span className="spacer" />
            <IconButton icon="close" label="Kapat"
              onClick={() => dispatch({ type: 'closeRoomPicker' })} />
          </div>
          <div className="rp__context">
            {draft.title || 'Yeni etkinlik'} · {DAY_NAMES_LONG[weekdayIndex(draft.date)]}{' '}
            {longDateLabel(draft.date)}, {timeRangeLabel(draft.start, draft.end)} · {attendees} katılımcı
          </div>
          <div className="rp__search">
            <Icon name="search" size={15} color="var(--text-muted)" />
            <input value={query} placeholder="Oda ara" aria-label="Oda ara"
              onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="rp__filters">
            <span className="rp__filterlabel">Filtre</span>
            {FILTERS.map((f) => (
              <button key={f} className={`rp__chipbtn${activeFilter === f ? ' is-on' : ''}`}
                aria-pressed={activeFilter === f}
                onClick={() => setActiveFilter((cur) => (cur === f ? null : f))}>
                {f}
                <span style={{ color: 'var(--text-faint)', display: 'flex' }}>
                  <Icon name="chevronDown" size={13} />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rp__listhead">
          <span className="l">Uygun başlangıç saatleri</span>
          <span className="m">
            {duration % 60 === 0 ? `${duration / 60} saatlik` : `${(duration / 60).toFixed(1).replace('.', ',')} saatlik`}{' '}
            toplantı için · {rooms.length} oda
          </span>
        </div>

        <div className="rp__list">
          {rooms.length === 0 && (
            <div className="rp__empty">
              Bu filtrelerle gösterilecek oda yok.<br />Filtreleri temizleyip yeniden deneyin.
            </div>
          )}
          {rooms.map(({ room, sel }) => {
            const isSelected = draft.roomId === room.id;
            const building = state.buildings.find((b) => b.id === room.buildingId)?.name;
            const starts = sel.reason === 'Bu odayı rezerve etme yetkiniz yok' ? [] : freeStarts(room);
            const approvers = eligibleApprovers(room, state.currentUserId, state.groups)
              .map((id) => userById(state, id)?.name).filter(Boolean);
            const approverCheck = room.requiresApproval
              ? canCreatePendingRequest(room, state.currentUserId, state.groups)
              : { ok: true as const };

            return (
              <div className={`rcard${isSelected ? ' is-selected' : ''}`} key={room.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rcard__namerow">
                    <span className="rcard__name">{room.name}</span>
                    {sel.availability === 'reserved' && (
                      <span className="pill pill--rejected">Talep edilen saat dolu</span>
                    )}
                    {sel.availability === 'pending' && (
                      <span className="pill pill--pending">Talep edilmiş</span>
                    )}
                    {sel.reason === 'Bu odayı rezerve etme yetkiniz yok' && (
                      <span className="pill pill--cancelled">Rezervasyon yetkiniz yok</span>
                    )}
                    {room.requiresApproval && sel.selectable && (
                      <span className="pill pill--pending">Onay gerekli</span>
                    )}
                  </div>
                  <div className="rcard__meta">
                    {room.capacity} kişilik · {building}, {room.floor}
                    {room.features.length ? ` · ${room.features.join(', ')}` : ''}
                  </div>

                  {room.capacity < attendees && (
                    <div className="rcard__note rcard__note--warn">
                      <Icon name="warning" size={13} />
                      Kapasite {attendees - room.capacity} kişi aşılıyor; rezervasyonu engellemez.
                    </div>
                  )}
                  {sel.availability === 'reserved' && sel.reason !== 'Bu odayı rezerve etme yetkiniz yok' && (
                    <div className="rcard__note rcard__note--err">
                      <Icon name="xCircle" size={13} />
                      {timeRangeLabel(draft.start, draft.end)} arası kapalı; alttaki saatlerden birini seçebilirsiniz.
                    </div>
                  )}
                  {/* D-070 — rakip talep engel değil; kararın onaylayıcıda olduğu söylenir. */}
                  {sel.availability === 'pending' && sel.selectable && (
                    <div className="rcard__note rcard__note--warn">
                      <Icon name="clock" size={13} />
                      Bu saat için {competingPendingCount(room.id, draft.date, draft.start, draft.end,
                        state.reservations, draft.id ?? undefined)} bekleyen talep var.
                      Siz de talep edebilirsiniz; kararı onaylayıcı verir.
                    </div>
                  )}
                  {sel.reason === 'Bu odayı rezerve etme yetkiniz yok' && (
                    <div className="rcard__note rcard__note--info">
                      <Icon name="lock" size={13} />
                      Erişim kısıtlı · saat bilgisi paylaşılmıyor.
                    </div>
                  )}
                  {room.requiresApproval && sel.selectable && approverCheck.ok && (
                    <div className="rcard__note rcard__note--warn">
                      <Icon name="clock" size={13} />
                      Onaylayıcı {approvers.join(', ')} · rezervasyon “Onay bekliyor” başlar.
                    </div>
                  )}
                  {room.requiresApproval && !approverCheck.ok && (
                    <div className="rcard__note rcard__note--err">
                      <Icon name="xCircle" size={13} />{approverCheck.message}
                    </div>
                  )}

                  {starts.length > 0 && (
                    <div className="rcard__chips">
                      {starts.map((s) => (
                        <button key={s}
                          className={`rchip${isSelected && s === draft.start ? ' is-on' : ''}`}
                          aria-label={`${room.name} ${hhmm(s)} başlangıcı`}
                          onClick={() => {
                            dispatch({
                              type: 'updateDraft', patch: { start: s, end: s + duration },
                            });
                            dispatch({ type: 'pickRoom', roomId: room.id });
                          }}>
                          {hhmm(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rcard__side">
                  {isSelected ? (
                    <>
                      <span className="rcard__selected">
                        <Icon name="check" size={15} />Seçili
                      </span>
                      <span className="rcard__subtime">{timeRangeLabel(draft.start, draft.end)}</span>
                    </>
                  ) : sel.selectable ? (
                    <button className="rcard__action"
                      onClick={() => dispatch({ type: 'pickRoom', roomId: room.id })}>Seç</button>
                  ) : sel.reason === 'Bu odayı rezerve etme yetkiniz yok' ? (
                    <button className="rcard__action rcard__action--quiet"
                      onClick={() => dispatch({
                        type: 'toast',
                        message: `${room.name} için yetki talebiniz oda yöneticisine iletildi.`,
                      })}>Yetki iste</button>
                  ) : (
                    <span className="rcard__disabled">Seçilemez</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rp__foot">
          <span className="rp__footinfo">
            {selectedRoom ? (
              <>
                <Icon name="checkCircle" size={14} color="var(--success)" />
                {selectedRoom.name} · {timeRangeLabel(draft.start, draft.end)} seçildi
              </>
            ) : (
              <>
                <Icon name="info" size={14} color="var(--text-muted)" />
                Oda seçilmedi — odasız da devam edebilirsiniz
              </>
            )}
          </span>
          <span className="spacer" />
          <Button variant="secondary" onClick={() => dispatch({ type: 'closeRoomPicker' })}>Kapat</Button>
          <Button variant="primary" disabled={!selectedRoom}
            onClick={() => dispatch({ type: 'closeRoomPicker' })}>Odayı ata</Button>
        </div>
      </aside>
    </>
  );
}
