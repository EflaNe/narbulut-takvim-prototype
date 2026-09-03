import { useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, myCalendars, reservationStatusForEvent, roomById, userById,
} from '../../lib/domain/selectors';
import {
  canCreatePendingRequest, capacityWarning, competingPendingCount, eligibleApprovers,
  isPastDate, outsideWorkingHours, roomAvailability,
} from '../../lib/domain/rules';
import { suggestTimes } from '../../lib/domain/scheduling';
import {
  DAY_NAMES_LONG, hhmm, longDateLabel, parseHhmm, weekdayIndex,
} from '../../lib/domain/time';
import { Drawer } from '../overlay/Drawer';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { Menu } from '../primitives/Menu';
import { ParticipantRow } from './ParticipantRow';
import type { CalendarId, RecurrenceKind } from '../../lib/domain/types';

const PARTICIPANT_PREVIEW = 3;

export function EventDrawer({ dimmed }: { dimmed?: boolean }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const draft = state.ui.draft!;
  const isNew = draft.id === null;

  const [calMenu, setCalMenu] = useState(false);
  const [repeatMenu, setRepeatMenu] = useState(false);
  const [pQuery, setPQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [startText, setStartText] = useState(hhmm(draft.start));
  const [endText, setEndText] = useState(hhmm(draft.end));

  const cal = calendarById(state, draft.calendarId);
  const room = roomById(state, draft.roomId);
  const status = draft.id ? reservationStatusForEvent(state, draft.id) : 'none';

  /* ── Doğrulama ── */
  const roomAvail = room
    ? roomAvailability(room.id, draft.date, draft.start, draft.end, state.reservations, draft.id ?? undefined)
    : null;

  const approverCheck = room?.requiresApproval
    ? canCreatePendingRequest(room, state.currentUserId, state.groups)
    : { ok: true as const };

  const blocking: string[] = [];
  if (!draft.title.trim()) blocking.push('Etkinlik adı gerekli');
  if (draft.end <= draft.start) blocking.push('Bitiş saati başlangıçtan sonra olmalı');
  if (roomAvail === 'reserved') blocking.push(`${room!.name} seçtiğiniz saatte dolu`);
  if (!approverCheck.ok) blocking.push(approverCheck.message);

  const warnings: string[] = [];
  // D-070 — aynı saate başkası da talep etmiş olabilir; bu engel değil, bilgidir.
  const rakip = room
    ? competingPendingCount(room.id, draft.date, draft.start, draft.end,
      state.reservations, draft.id ?? undefined)
    : 0;
  if (rakip > 0) {
    warnings.push(`Bu saat için ${rakip} bekleyen talep daha var — kararı onaylayıcı verir`);
  }
  const cap = capacityWarning(room ?? null, draft.participantIds.length + 1);
  if (cap) warnings.push(`${cap.replace(/\.$/, '')} — rezervasyonu engellemez`);
  if (outsideWorkingHours(draft.start, draft.end)) {
    warnings.push('Çalışma saatleri dışında — engellemez');
  }
  if (isPastDate(draft.date, state.today)) warnings.push('Geçmiş bir tarih — engellemez');

  /* ── Katılımcılar ── */
  const participants = draft.participantIds
    .map((id) => userById(state, id))
    .filter((u): u is NonNullable<typeof u> => !!u);
  const shown = showAll ? participants : participants.slice(0, PARTICIPANT_PREVIEW);

  const candidates = useMemo(() => {
    const q = pQuery.trim().toLocaleLowerCase('tr-TR');
    if (!q) return [];
    return state.users
      .filter((u) => u.id !== state.currentUserId && !draft.participantIds.includes(u.id))
      .filter((u) => u.name.toLocaleLowerCase('tr-TR').includes(q)
        || u.email.toLocaleLowerCase('tr-TR').includes(q))
      .slice(0, 6);
  }, [pQuery, state.users, state.currentUserId, draft.participantIds]);

  /* ── Öneriler ── */
  const suggestions = useMemo(() => suggestTimes({
    fromDate: draft.date,
    durationMinutes: Math.max(30, draft.end - draft.start),
    participantIds: draft.participantIds,
    organizerId: state.currentUserId,
    events: state.events,
    rooms: state.rooms,
    reservations: state.reservations,
    ignoreEventId: draft.id ?? undefined,
  }), [draft.date, draft.start, draft.end, draft.participantIds, draft.id,
    state.currentUserId, state.events, state.rooms, state.reservations]);

  const commitTime = (which: 'start' | 'end', text: string) => {
    const v = parseHhmm(text);
    if (v === null) {
      (which === 'start' ? setStartText : setEndText)(hhmm(which === 'start' ? draft.start : draft.end));
      return;
    }
    dispatch({ type: 'updateDraft', patch: which === 'start' ? { start: v } : { end: v } });
  };

  const duration = draft.end - draft.start;
  const durationLabel = duration > 0
    ? `${Math.floor(duration / 60) ? `${Math.floor(duration / 60)} sa ` : ''}${duration % 60 ? `${duration % 60} dk` : ''}`.trim()
    : '—';

  const repeatLabels: Record<RecurrenceKind, string> = {
    none: 'Tekrar ekle', daily: 'Her gün', weekly: 'Her hafta', monthly: 'Her ay',
  };

  /** Takvimi programatik aç; desteklenmeyen tarayıcıda alan yine yazılabilir kalır. */
  const openPicker = (e: { currentTarget: HTMLInputElement }) => {
    const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
    try { el.showPicker?.(); } catch { /* kullanıcı etkileşimi yoksa sessiz geç */ }
  };

  return (
    <Drawer width={680} dimmed={dimmed} eyebrow={isNew ? 'Yeni etkinlik' : 'Etkinliği düzenle'}
      onClose={() => dispatch({ type: 'closeEventDrawer' })}
      headExtra={!isNew ? (
        <button className="evd__link evd__link--quiet" style={{ paddingTop: 0 }}
          onClick={() => dispatch({
            type: 'askConfirm',
            confirm: {
              title: 'Etkinlik silinsin mi?',
              body: status !== 'none'
                ? 'Bu etkinliğe bağlı oda rezervasyonu da iptal edilecek. Talep kaydı geçmişte kalır.'
                : 'Bu işlem geri alınamaz.',
              confirmLabel: 'Sil', tone: 'destructive',
              action: { type: 'deleteEvent', eventId: draft.id! },
            },
          })}>Sil</button>
      ) : undefined}
      footer={(
        <>
          {blocking.length > 0 && (
            <span className="inlinemsg inlinemsg--error">
              <Icon name="xCircle" size={14} />
              {blocking.length} engelleyici sorun
            </span>
          )}
          <span className="spacer" />
          <Button variant="secondary" onClick={() => dispatch({ type: 'closeEventDrawer' })}>Vazgeç</Button>
          <Button variant="primary" disabled={blocking.length > 0}
            onClick={() => dispatch({ type: 'saveEvent' })}>Kaydet</Button>
        </>
      )}>

      <input className="qinput qinput--title" placeholder="Etkinlik adı" value={draft.title}
        aria-label="Etkinlik adı" autoFocus={!dimmed}
        onChange={(e) => dispatch({ type: 'updateDraft', patch: { title: e.target.value } })} />

      <div className="evd__meta">
        <span style={{ position: 'relative' }}>
          <button className="selectchip" aria-haspopup="menu" aria-expanded={calMenu}
            onClick={() => setCalMenu((o) => !o)}>
            <span className="calrow__dot" style={{ width: 9, height: 9, background: cal?.color }} />
            {cal?.name}
            <span style={{ color: 'var(--text-faint)', display: 'flex' }}>
              <Icon name="chevronDown" size={13} />
            </span>
          </button>
          {calMenu && (
            <Menu label="Takvim seç" style={{ top: 30, left: -7 }} onClose={() => setCalMenu(false)}>
              {myCalendars(state).map((c) => (
                <button key={c.id} onClick={() => {
                  dispatch({ type: 'updateDraft', patch: { calendarId: c.id as CalendarId } });
                  setCalMenu(false);
                }}>
                  <span className="calrow__dot" style={{ background: c.color }} />{c.name}
                  {c.isDefault && <span className="prow__tag" style={{ marginLeft: 'auto' }}>varsayılan</span>}
                </button>
              ))}
            </Menu>
          )}
        </span>

        {status !== 'none' && (
          <>
            <span className="evd__sep">·</span>
            {status === 'pending' ? (
              <span className="badge badge--pending">
                <Icon name="clock" size={14} />Onay bekliyor
              </span>
            ) : (
              <span className="badge badge--reserved">
                <Icon name="checkCircle" size={14} />Oda rezerve
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Ne zaman ── */}
      <div className="evd__section">
        <div className="sectionlabel">Ne zaman</div>
        <div className="evd__timerow">
          <span className="evd__datewrap">
            <span className="evd__datebtn" aria-hidden="true">
              <Icon name="calendar" size={15} color="var(--text-tertiary)" />
              {DAY_NAMES_LONG[weekdayIndex(draft.date)]}, {longDateLabel(draft.date)}
            </span>
            {/*
              ⚠️ macOS/Chrome'da `type="date"` alanına tıklamak takvimi **açmaz** —
              yalnız odaklar; takvim ancak alanın kendi (burada görünmez) ikonuna
              basılınca açılırdı. Tıklama ve klavye ile `showPicker()` çağırıyoruz.
            */}
            <input className="evd__datenative" type="date" value={draft.date} aria-label="Tarih"
              onClick={openPicker} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(e); }
              }}
              onChange={(e) => e.target.value
                && dispatch({ type: 'updateDraft', patch: { date: e.target.value } })} />
          </span>
          <span style={{ width: 6 }} />
          <input className="qinput qinput--field tnum" style={{ width: 74 }} value={startText}
            aria-label="Başlangıç saati" placeholder="00:00"
            onChange={(e) => setStartText(e.target.value)}
            onBlur={() => commitTime('start', startText)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTime('start', startText); }} />
          <span className="evd__arrow">→</span>
          <input className="qinput qinput--field tnum" style={{ width: 74 }} value={endText}
            aria-label="Bitiş saati" placeholder="00:00"
            onChange={(e) => setEndText(e.target.value)}
            onBlur={() => commitTime('end', endText)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTime('end', endText); }} />
          <span className="spacer" />
          <span style={{ position: 'relative' }}>
            <button className="evd__repeat" aria-haspopup="menu" aria-expanded={repeatMenu}
              onClick={() => setRepeatMenu((o) => !o)}>
              <Icon name="plus" size={14} />{repeatLabels[draft.recurrence.kind]}
            </button>
            {repeatMenu && (
              <Menu label="Tekrar" style={{ top: 38, right: 0 }} onClose={() => setRepeatMenu(false)}>
                {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceKind[]).map((k) => (
                  <button key={k} onClick={() => {
                    dispatch({
                      type: 'updateDraft',
                      patch: { recurrence: { kind: k, count: k === 'none' ? 1 : 8 } },
                    });
                    setRepeatMenu(false);
                  }}>{k === 'none' ? 'Tekrarlama' : repeatLabels[k]}</button>
                ))}
              </Menu>
            )}
          </span>
        </div>
        <div className="evd__hint">
          {DAY_NAMES_LONG[weekdayIndex(draft.date)]}, {longDateLabel(draft.date)} · {durationLabel} ·{' '}
          {draft.recurrence.kind === 'none'
            ? 'aynı gün biter'
            : `${repeatLabels[draft.recurrence.kind].toLocaleLowerCase('tr-TR')} · ${draft.recurrence.count} tekrar`}
        </div>
      </div>

      {/* ── Kimlerle ── */}
      <div className="evd__section">
        <div className="evd__sectionhead">
          <div className="sectionlabel">Kimlerle</div>
          <span className="evd__count">
            {participants.length + 1} kişi · {participants.length} davetli
          </span>
        </div>
        <div className="psearch">
          <div className="searchfield">
            <Icon name="search" size={15} color="var(--text-muted)" />
            <input value={pQuery} placeholder="İsim veya e-posta ekleyin" aria-label="Katılımcı ara"
              onChange={(e) => setPQuery(e.target.value)} />
          </div>
          {candidates.length > 0 && (
            <div className="psearch__results">
              {candidates.map((u) => (
                <button key={u.id} onClick={() => {
                  dispatch({ type: 'toggleParticipant', userId: u.id });
                  setPQuery('');
                }}>
                  <span className="avatar avatar--sm">{u.initials}</span>
                  <span className="n">{u.orgId === 'narbulut' ? u.name : u.email}</span>
                  <span className="t">{u.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 6 }}>
          {shown.map((p) => (
            <ParticipantRow key={p.id} user={p} date={draft.date} start={draft.start} end={draft.end}
              ignoreEventId={draft.id ?? undefined}
              onRemove={() => dispatch({ type: 'toggleParticipant', userId: p.id })} />
          ))}
        </div>
        {participants.length > PARTICIPANT_PREVIEW && (
          <button className="evd__more" onClick={() => setShowAll((v) => !v)}>
            {showAll
              ? 'Daha az göster'
              : `+${participants.length - PARTICIPANT_PREVIEW} katılımcı daha`}
          </button>
        )}
      </div>

      {/* ── Uygun zamanlar ── */}
      {suggestions.length > 0 && (
        <div className="evd__section--tight" style={{ marginTop: 28 }}>
          <div className="evd__sectionhead">
            <div className="sectionlabel">Uygun zamanlar</div>
            <span className="evd__count">{suggestions.length} öneri</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {suggestions.map((s) => (
              <button className="sugg" key={`${s.date}-${s.start}`}
                onClick={() => dispatch({
                  type: 'updateDraft', patch: { date: s.date, start: s.start, end: s.end },
                })}>
                <span className="sugg__time">
                  {DAY_NAMES_LONG[weekdayIndex(s.date)]} {hhmm(s.start)} – {hhmm(s.end)}
                </span>
                <span className="sugg__why">{s.reason}</span>
                <span className="sugg__apply">Uygula</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Nerede ── */}
      <div className="evd__section">
        <div className="sectionlabel">Nerede</div>
        {room ? (
          <>
            <div className="evd__room">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="evd__roomname">{room.name}</div>
                <div className="evd__roommeta">
                  {room.capacity} kişilik · {state.buildings.find((b) => b.id === room.buildingId)?.name},{' '}
                  {room.floor}
                </div>
              </div>
              <button className="evd__link" onClick={() => dispatch({ type: 'openRoomPicker' })}>
                Değiştir
              </button>
              <button className="evd__link evd__link--quiet"
                onClick={() => dispatch({ type: 'pickRoom', roomId: null })}>Kaldır</button>
            </div>
            <div className="evd__msgs">
              {roomAvail === 'reserved' && (
                <div className="inlinemsg inlinemsg--error">
                  <Icon name="xCircle" size={14} />
                  {hhmm(draft.start)} – {hhmm(draft.end)} dolu
                  <span className="evd__sep">·</span>
                  <button className="evd__link" style={{ paddingTop: 0 }}
                    onClick={() => dispatch({ type: 'openRoomPicker' })}>Başka oda seç</button>
                </div>
              )}

              {room.requiresApproval && roomAvail === 'available' && approverCheck.ok && (
                <div className="inlinemsg inlinemsg--info">
                  <Icon name="clock" size={14} />
                  Onay gerekli · onaylayıcı{' '}
                  {eligibleApprovers(room, state.currentUserId, state.groups)
                    .map((id) => userById(state, id)?.name).filter(Boolean).join(', ')}
                  {' '}· rezervasyon “Onay bekliyor” başlar
                </div>
              )}
              {!approverCheck.ok && (
                <div className="inlinemsg inlinemsg--error">
                  <Icon name="xCircle" size={14} />{approverCheck.message}
                </div>
              )}
              {warnings.map((w) => (
                <div className="inlinemsg inlinemsg--warning" key={w}>
                  <Icon name="warning" size={14} />{w}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="evd__empty">
            <span className="evd__roommeta" style={{ marginTop: 0 }}>Oda seçilmedi</span>
            <button className="evd__link" style={{ paddingTop: 0 }}
              onClick={() => dispatch({ type: 'openRoomPicker' })}>Oda seç</button>
          </div>
        )}
        {!room && warnings.length > 0 && (
          <div className="evd__msgs">
            {warnings.map((w) => (
              <div className="inlinemsg inlinemsg--warning" key={w}>
                <Icon name="warning" size={14} />{w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Not ── */}
      <div className="evd__section" style={{ paddingBottom: 8 }}>
        <div className="sectionlabel">Not</div>
        <textarea className="textinput evd__notes" rows={3} value={draft.notes}
          aria-label="Not" placeholder="Gündem, bağlantı, hazırlık…"
          onChange={(e) => dispatch({ type: 'updateDraft', patch: { notes: e.target.value } })} />
      </div>
    </Drawer>
  );
}
