/**
 * Tek merkezî reducer. Tüm durum geçişleri buradan geçer;
 * hiçbir iş kuralı bileşenlerin içinde yeniden uygulanmaz.
 */
import type {
  ApprovalRequest, CalendarEvent, CalendarId, EventId, NotificationKind, Reservation,
  RoomId, ShareId, UserId,
} from '../domain/types';
import {
  canApproveNow, canCancelReservation, canCreatePendingRequest, canDecideRequest,
  eligibleApprovers, roomAvailability,
} from '../domain/rules';
import { hhmm, longDateLabel, shiftByView, timeRangeLabel } from '../domain/time';
import type { AppAction, AppState, EventDraft } from './types';
import * as demo from './demoData';

/* ────────────────────────────── başlangıç durumu ────────────────────────────── */

export function createInitialState(): AppState {
  return {
    currentUserId: demo.CURRENT_USER_ID,
    today: demo.DEMO_TODAY,
    nowMinutes: demo.DEMO_NOW_MINUTES,
    users: demo.users,
    groups: demo.groups,
    buildings: demo.buildings,
    calendars: demo.calendars,
    shares: demo.shares.map((s) => ({ ...s })),
    rooms: demo.rooms.map((r) => ({ ...r })),
    events: demo.events.map((e) => ({ ...e })),
    reservations: demo.reservations.map((r) => ({ ...r })),
    requests: demo.requests.map((r) => ({ ...r })),
    notifications: demo.notifications.map((n) => ({ ...n })),
    seq: 1,
    ui: {
      route: 'calendar',
      anchorDate: demo.DEMO_TODAY,
      viewMode: 'week',
      hiddenCalendarIds: [],
      hiddenRoomIds: [],
      showRejected: false,
      searchQuery: '',
      searchOpen: false,
      quickCreate: null,
      draft: null,
      readOnlyEventId: null,
      roomPickerOpen: false,
      shareCalendarId: null,
      calendarMenuId: null,
      sharedMenuId: null,
      confirm: null,
      selectedRequestId: 'req_roadmap',
      rejectingRequestId: null,
    cancellingReservationId: null,
      selectedRoomId: 'room_istanbul',
      calendarForm: null,
      deletingCalendarId: null,
      creatingRoom: false,
      signedIn: false,
      demoBannerOpen: true,
      toast: null,
      demoPanelOpen: false,
      mobileSheet: 'none',
      mobileDate: demo.DEMO_TODAY,
    },
  };
}

/* ────────────────────────────── yardımcılar ────────────────────────────── */

const nextId = (s: AppState, prefix: string) => `${prefix}_${s.seq}`;

const userById2 = (s: AppState, id: UserId) => s.users.find((u) => u.id === id)?.name;

function ui(state: AppState, patch: Partial<AppState['ui']>): AppState {
  return { ...state, ui: { ...state.ui, ...patch } };
}

function defaultCalendarId(state: AppState): CalendarId {
  const own = state.calendars.filter((c) => c.ownerId === state.currentUserId);
  return (own.find((c) => c.isDefault) ?? own[0]).id;
}

function draftFromEvent(e: CalendarEvent): EventDraft {
  return {
    id: e.id, calendarId: e.calendarId, title: e.title, date: e.date,
    start: e.start, end: e.end, participantIds: [...e.participantIds],
    roomId: e.roomId, notes: e.notes, recurrence: { ...e.recurrence },
  };
}

function newDraft(state: AppState, date: string, start: number, end: number): EventDraft {
  return {
    id: null, calendarId: defaultCalendarId(state), title: '', date, start, end,
    participantIds: [], roomId: null, notes: '', recurrence: { kind: 'none', count: 1 },
  };
}

/** BR-APR-33 — odadan çıkılınca Pending talep Cancelled olur, Approved rezervasyon düşer. */
function releaseReservation(state: AppState, eventId: EventId): AppState {
  return {
    ...state,
    reservations: state.reservations.map((r) =>
      r.eventId === eventId && (r.status === 'pending' || r.status === 'reserved')
        ? { ...r, status: 'cancelled' } : r),
    requests: state.requests.map((q) =>
      q.eventId === eventId && q.status === 'pending'
        ? { ...q, status: 'cancelled' } : q),
  };
}

function notify(
  state: AppState, recipientId: UserId, kind: NotificationKind,
  title: string, body: string,
): AppState {
  return {
    ...state,
    notifications: [
      {
        id: `ntf_${state.seq}`, kind, recipientId, createdAt: `${state.today}T00:00:00`,
        title, body, read: false,
      },
      ...state.notifications,
    ],
    seq: state.seq + 1,
  };
}

/* ────────────────────────────── reducer ────────────────────────────── */

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'navigate':
      return ui(state, { route: action.route, calendarMenuId: null, sharedMenuId: null });

    case 'setAnchorDate':
      return ui(state, { anchorDate: action.date, mobileDate: action.date });

    /** BR-SHELL-03 — adım, aktif görünüm moduna göre: gün / hafta / ay. */
    case 'shiftView': {
      const date = shiftByView(state.ui.anchorDate, state.ui.viewMode, action.delta);
      return ui(state, { anchorDate: date, mobileDate: date });
    }

    case 'goToday':
      return ui(state, { anchorDate: state.today, mobileDate: state.today });

    case 'setViewMode':
      return ui(state, { viewMode: action.mode });

    case 'toggleCalendar': {
      const hidden = state.ui.hiddenCalendarIds.includes(action.calendarId)
        ? state.ui.hiddenCalendarIds.filter((c) => c !== action.calendarId)
        : [...state.ui.hiddenCalendarIds, action.calendarId];
      return ui(state, { hiddenCalendarIds: hidden });
    }

    /** Oda ekseni — odası kapatılan etkinlikler ızgaradan düşer (BR-SHELL-31c). */
    case 'toggleRoomFilter': {
      const hidden = state.ui.hiddenRoomIds.includes(action.roomId)
        ? state.ui.hiddenRoomIds.filter((r) => r !== action.roomId)
        : [...state.ui.hiddenRoomIds, action.roomId];
      return ui(state, { hiddenRoomIds: hidden });
    }

    case 'setAllRoomFilters':
      return ui(state, {
        hiddenRoomIds: action.on ? [] : state.rooms.map((r) => r.id),
      });

    case 'toggleRejected':
      return ui(state, { showRejected: !state.ui.showRejected });

    /** BR-CAL-32 — alıcı görünürlüğü kapatabilir; paylaşım kaydı silinmez. */
    case 'toggleSharedVisibility':
      return {
        ...state,
        shares: state.shares.map((s) =>
          s.calendarId === action.calendarId && s.granteeId === state.currentUserId
            ? { ...s, visibleForGrantee: !s.visibleForGrantee } : s),
      };

    /** BR-CAL-34 — alıcı paylaşımı kendi tarafından kaldırabilir. */
    case 'removeSharedCalendar': {
      const cal = state.calendars.find((c) => c.id === action.calendarId);
      const next = {
        ...state,
        shares: state.shares.filter(
          (s) => !(s.calendarId === action.calendarId && s.granteeId === state.currentUserId)),
      };
      // BR-NOT-22 — alıcı kendi kaldırdığı için ne kendisine ne sahibine bildirim gider.
      return ui(next, {
        sharedMenuId: null, confirm: null, mobileSheet: 'none',
        toast: { message: `${cal?.name ?? 'Takvim'} takviminizden kaldırıldı.`, tone: 'info' },
      });
    }

    case 'setSearch':
      return ui(state, { searchQuery: action.query });

    case 'setSearchOpen':
      return ui(state, { searchOpen: action.open, searchQuery: action.open ? state.ui.searchQuery : '' });

    /* ── Quick Create ── */
    case 'openQuickCreate':
      return ui(state, {
        quickCreate: {
          date: action.date, start: action.start, end: action.end,
          x: action.x, y: action.y, title: '',
        },
      });

    case 'updateQuickCreate':
      return state.ui.quickCreate
        ? ui(state, { quickCreate: { ...state.ui.quickCreate, title: action.title } })
        : state;

    case 'closeQuickCreate':
      return ui(state, { quickCreate: null });

    case 'quickCreateSave': {
      const qc = state.ui.quickCreate;
      if (!qc) return state;
      const title = qc.title.trim();
      if (!title) return ui(state, { toast: { message: 'Etkinlik adı gerekli.', tone: 'error' } });
      const id = nextId(state, 'evt') as EventId;
      const event: CalendarEvent = {
        id, calendarId: defaultCalendarId(state), title, date: qc.date,
        start: qc.start, end: qc.end, organizerId: state.currentUserId,
        participantIds: [], roomId: null, notes: '', recurrence: { kind: 'none', count: 1 },
      };
      return ui({ ...state, events: [...state.events, event], seq: state.seq + 1 }, {
        quickCreate: null,
        toast: { message: 'Etkinlik oluşturuldu.', tone: 'success' },
      });
    }

    /** Quick Create → detaylı form. Girilen başlık taşınır (geri dönüş bağlayıcı değildir). */
    case 'quickCreateExpand': {
      const qc = state.ui.quickCreate;
      if (!qc) return state;
      const draft = newDraft(state, qc.date, qc.start, qc.end);
      return ui(state, { quickCreate: null, draft: { ...draft, title: qc.title } });
    }

    /* ── Event drawer ── */
    case 'openEventCreate': {
      const date = action.date ?? state.today;
      const start = action.start ?? 10 * 60;
      const end = action.end ?? start + 60;
      return ui(state, { draft: newDraft(state, date, start, end), readOnlyEventId: null });
    }

    case 'openEventEdit': {
      const e = state.events.find((x) => x.id === action.eventId);
      if (!e) return state;
      return ui(state, { draft: draftFromEvent(e), readOnlyEventId: null, quickCreate: null });
    }

    /** BR-CAL-27 — paylaşılan takvim etkinliği salt okunur açılır. */
    case 'openReadOnlyEvent':
      return ui(state, { readOnlyEventId: action.eventId, draft: null, quickCreate: null });

    case 'closeEventDrawer':
      return ui(state, { draft: null, readOnlyEventId: null, roomPickerOpen: false });

    case 'updateDraft':
      return state.ui.draft
        ? ui(state, { draft: { ...state.ui.draft, ...action.patch } })
        : state;

    case 'toggleParticipant': {
      const d = state.ui.draft;
      if (!d) return state;
      const has = d.participantIds.includes(action.userId);
      return ui(state, {
        draft: {
          ...d,
          participantIds: has
            ? d.participantIds.filter((p) => p !== action.userId)
            : [...d.participantIds, action.userId],
        },
      });
    }

    /* ── Kaydet: etkinlik + rezervasyon + talep ── */
    case 'saveEvent': {
      const d = state.ui.draft;
      if (!d) return state;
      if (!d.title.trim()) {
        return ui(state, { toast: { message: 'Etkinlik adı gerekli.', tone: 'error' } });
      }
      if (d.end <= d.start) {
        return ui(state, { toast: { message: 'Bitiş saati başlangıçtan sonra olmalı.', tone: 'error' } });
      }

      const room = d.roomId ? state.rooms.find((r) => r.id === d.roomId) ?? null : null;

      // Engelleyici: oda çakışması (BR-RB-21)
      if (room) {
        // D-070 — yalnız kesinleşmiş rezervasyon engeller; bekleyen talep engellemez.
        const avail = roomAvailability(
          room.id, d.date, d.start, d.end, state.reservations, d.id ?? undefined);
        if (avail === 'reserved') {
          return ui(state, {
            toast: { message: `${room.name} seçtiğiniz saatte dolu.`, tone: 'error' },
          });
        }
        // Engelleyici: eligible approver invariant (BR-APR-17b)
        if (room.requiresApproval) {
          const check = canCreatePendingRequest(room, state.currentUserId, state.groups);
          if (!check.ok) {
            return ui(state, { toast: { message: check.message, tone: 'error' } });
          }
        }
      }

      let next: AppState = state;
      const eventId = (d.id ?? nextId(state, 'evt')) as EventId;
      const isNew = !d.id;

      const event: CalendarEvent = {
        id: eventId, calendarId: d.calendarId, title: d.title.trim(), date: d.date,
        start: d.start, end: d.end,
        organizerId: isNew
          ? state.currentUserId
          : state.events.find((e) => e.id === eventId)?.organizerId ?? state.currentUserId,
        participantIds: [...d.participantIds], roomId: d.roomId, notes: d.notes,
        recurrence: { ...d.recurrence },
      };

      next = {
        ...next,
        events: isNew
          ? [...next.events, event]
          : next.events.map((e) => (e.id === eventId ? event : e)),
        seq: next.seq + (isNew ? 1 : 0),
      };

      const prevRes = next.reservations.find(
        (r) => r.eventId === eventId && (r.status === 'pending' || r.status === 'reserved'));

      const roomChanged = (prevRes?.roomId ?? null) !== (d.roomId ?? null);
      const timeChanged = prevRes
        ? prevRes.date !== d.date || prevRes.start !== d.start || prevRes.end !== d.end
        : false;

      if (!d.roomId) {
        if (prevRes) next = releaseReservation(next, eventId);
      } else if (roomChanged) {
        if (prevRes) next = releaseReservation(next, eventId);
        const rid = `rsv_${next.seq}` as Reservation['id'];
        const needsApproval = room!.requiresApproval;
        const reservation: Reservation = {
          id: rid, eventId, roomId: d.roomId, date: d.date, start: d.start, end: d.end,
          status: needsApproval ? 'pending' : 'reserved', requesterId: state.currentUserId,
        };
        next = { ...next, reservations: [...next.reservations, reservation], seq: next.seq + 1 };
        if (needsApproval) {
          const req: ApprovalRequest = {
            id: `req_${next.seq}` as ApprovalRequest['id'], reservationId: rid, eventId,
            roomId: d.roomId, requesterId: state.currentUserId, status: 'pending',
            createdAt: `${state.today}T${String(Math.floor(state.nowMinutes / 60)).padStart(2, '0')}:00:00`,
            decidedById: null, decidedAt: null, reason: null,
          };
          next = { ...next, requests: [...next.requests, req], seq: next.seq + 1 };
        }
      } else if (timeChanged && prevRes) {
        // BR-APR-34 — zaman değişince bekleyen talep yeni aralığı bloke eder.
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === prevRes.id ? { ...r, date: d.date, start: d.start, end: d.end } : r),
        };
      }

      // N-EVT-01 — davet edilen iç katılımcılar bilgilendirilir.
      // Harici misafirin uygulama içi karşılığı yoktur; kanalı e-postadır (BR-NOT-03).
      if (isNew) {
        for (const pid of event.participantIds) {
          if (next.users.find((u) => u.id === pid)?.orgId !== 'narbulut') continue;
          next = notify(next, pid, 'N-EVT-01', 'Etkinliğe davet edildiniz',
            `${event.title} · ${event.date} ${hhmm(event.start)} – ${hhmm(event.end)}`);
        }
      }

      const pendingNow = next.reservations.some(
        (r) => r.eventId === eventId && r.status === 'pending');

      // N-RES-01 — talep, odanın onaylayıcılarına düşer.
      if (pendingNow && room) {
        for (const aid of eligibleApprovers(room, state.currentUserId, state.groups)) {
          next = notify(next, aid, 'N-RES-01', 'Rezervasyon onayınızı bekliyor',
            `${room.name} · ${event.date} ${hhmm(event.start)} – ${hhmm(event.end)} · ${event.title}`);
        }
      }

      return ui(next, {
        draft: null, roomPickerOpen: false,
        toast: {
          // BR-APR-07 — talep dilinde başarı dili kullanılmaz
          message: pendingNow
            ? 'Talebiniz gönderildi, onay bekliyor.'
            : isNew ? 'Etkinlik oluşturuldu.' : 'Etkinlik güncellendi.',
          tone: pendingNow ? 'info' : 'success',
        },
      });
    }

    /** BR-EVT-30 / BR-APR-31 — etkinlik silinince bağlı talep Cancelled olur, silinmez. */
    case 'deleteEvent': {
      const removed = state.events.find((e) => e.id === action.eventId);
      let next = releaseReservation(state, action.eventId);
      // N-EVT-03 — tüm katılımcılar bilgilendirilir.
      for (const pid of removed?.participantIds ?? []) {
        if (next.users.find((u) => u.id === pid)?.orgId !== 'narbulut') continue;
        next = notify(next, pid, 'N-EVT-03', 'Etkinlik iptal edildi',
          `${removed!.title} · ${removed!.date} ${hhmm(removed!.start)} – ${hhmm(removed!.end)}`);
      }
      return ui({ ...next, events: next.events.filter((e) => e.id !== action.eventId) }, {
        draft: null, confirm: null, readOnlyEventId: null, mobileSheet: 'none',
        toast: { message: 'Etkinlik silindi.', tone: 'info' },
      });
    }

    /* ── Oda seçici ── */
    case 'openRoomPicker':
      return ui(state, { roomPickerOpen: true });

    case 'closeRoomPicker':
      return ui(state, { roomPickerOpen: false });

    case 'pickRoom':
      return state.ui.draft
        ? ui(state, { draft: { ...state.ui.draft, roomId: action.roomId }, roomPickerOpen: false })
        : state;

    /* ── Takvim paylaşımı ── */
    case 'openShareDrawer':
      return ui(state, { shareCalendarId: action.calendarId, calendarMenuId: null });

    case 'closeShareDrawer':
      return ui(state, { shareCalendarId: null });

    case 'addShare': {
      const exists = state.shares.some(
        (s) => s.calendarId === action.calendarId && s.granteeId === action.userId);
      if (exists) return state;
      const cal = state.calendars.find((c) => c.id === action.calendarId);
      const target = state.users.find((u) => u.id === action.userId);
      const next: AppState = {
        ...state,
        shares: [...state.shares, {
          id: `shr_${state.seq}` as ShareId, calendarId: action.calendarId, granteeId: action.userId,
          createdAt: `${state.today}T00:00:00`, visibleForGrantee: true,
        }],
        seq: state.seq + 1,
      };
      // N-CAL-01 — takvim adı · sahibin adı · erişimin kapsamı (19 §5.3)
      const owner = state.users.find((u) => u.id === cal?.ownerId);
      return ui(notify(next, action.userId, 'N-CAL-01', 'Bir takvim sizinle paylaşıldı',
        `${cal?.name ?? 'Takvim'} · ${owner?.name ?? ''} · etkinlik detaylarını görebilirsiniz, salt okunur`), {
        toast: { message: `${target?.name ?? 'Kullanıcı'} eklendi.`, tone: 'success' },
      });
    }

    /** BR-CAL-33 — kaldırma anında etkilidir. */
    case 'removeShare': {
      const target = state.users.find((u) => u.id === action.userId);
      const cal = state.calendars.find((c) => c.id === action.calendarId);
      const next: AppState = {
        ...state,
        shares: state.shares.filter(
          (s) => !(s.calendarId === action.calendarId && s.granteeId === action.userId)),
      };
      const owner2 = state.users.find((u) => u.id === cal?.ownerId);
      return ui(notify(next, action.userId, 'N-CAL-02', 'Takvim paylaşımı kaldırıldı',
        `${cal?.name ?? 'Takvim'} · ${owner2?.name ?? ''} · erişiminiz sona erdi`), {
        confirm: null,
        toast: {
          message: `${target?.name ?? 'Kullanıcı'} erişimi kaldırıldı. Bu takvim artık kendisine görünmüyor.`,
          tone: 'info',
        },
      });
    }

    case 'setCalendarMenu':
      return ui(state, { calendarMenuId: action.calendarId, sharedMenuId: null });

    case 'setSharedMenu':
      return ui(state, { sharedMenuId: action.calendarId, calendarMenuId: null });

    case 'askConfirm':
      return ui(state, { confirm: action.confirm });

    case 'closeConfirm':
      return ui(state, { confirm: null });

    /* ── Talepler ── */
    case 'selectRequest':
      return ui(state, { selectedRequestId: action.requestId, rejectingRequestId: null });

    /** BR-APR-18 — onay: talep Approved, rezervasyon kesinleşir. */
    case 'approveRequest': {
      const req = state.requests.find((r) => r.id === action.requestId);
      if (!req) return state;
      const room = state.rooms.find((r) => r.id === req.roomId);
      if (!room || !canDecideRequest(req, room, state.currentUserId, state.groups)) {
        return ui(state, { toast: { message: 'Bu talebi onaylama yetkiniz yok.', tone: 'error' } });
      }

      // D-070 / BR-APR-13a — çakışma karar anında değerlendirilir.
      const rez = state.reservations.find((r) => r.id === req.reservationId);
      if (rez) {
        const check = canApproveNow(rez, state.reservations);
        if (!check.ok) {
          const holder = state.events.find((e) => e.id === check.blockedBy.eventId);
          const who = userById2(state, check.blockedBy.requesterId);
          return ui(state, {
            toast: {
              message: `${room.name} bu saatte rezerve: ${who ?? 'başka bir kullanıcı'}`
                + `${holder ? ` · ${holder.title}` : ''}. Onaylamak için o rezervasyonu`
                + ' "Bu odanın takvimi" listesinden kaldırın.',
              tone: 'error',
            },
          });
        }
      }

      // ⚠️ Diğer bekleyen talepler otomatik reddedilmez (BR-APR-13b).
      const next: AppState = {
        ...state,
        requests: state.requests.map((r) => (r.id === req.id
          ? { ...r, status: 'approved', decidedById: state.currentUserId, decidedAt: `${state.today}T00:00:00` }
          : r)),
        reservations: state.reservations.map((r) =>
          r.id === req.reservationId ? { ...r, status: 'reserved' } : r),
      };
      return ui(notify(next, req.requesterId, 'N-RES-02', 'Rezervasyon onaylandı',
        `${room.name} rezervasyonunuz onaylandı.`), {
        toast: { message: `${room.name} rezervasyonu onaylandı.`, tone: 'success' },
      });
    }

    case 'startReject':
      return ui(state, { rejectingRequestId: action.requestId });

    case 'startCancelReservation':
      return ui(state, { cancellingReservationId: action.reservationId });

    /**
     * D-071 / BR-APR-28 — oda sorumlusu kesinleşmiş rezervasyonu gerekçeyle kaldırır.
     *
     * ⚠️ Talep kaydına **dokunulmaz**: `approved` olarak kalır (BR-APR-22). Düşen şey
     * rezervasyondur; etkinlik **silinmez**, odasız kalır (BR-APR-19 ile aynı davranış).
     * Gerekçe zorunludur — sahibi neden odasız kaldığını bilmek zorundadır (BR-APR-28b).
     */
    case 'cancelReservation': {
      const rez = state.reservations.find((r) => r.id === action.reservationId);
      if (!rez) return state;
      const room = state.rooms.find((r) => r.id === rez.roomId);
      if (!room || !canCancelReservation(rez, room, state.currentUserId, state.groups)) {
        return ui(state, {
          toast: { message: 'Bu rezervasyonu kaldırma yetkiniz yok.', tone: 'error' },
        });
      }
      const reason = action.reason.trim();
      if (!reason) {
        return ui(state, {
          toast: { message: 'Kaldırma gerekçesi zorunludur.', tone: 'error' },
        });
      }

      let next: AppState = {
        ...state,
        reservations: state.reservations.map((r) => (r.id === rez.id
          ? { ...r, status: 'cancelled', cancelledById: state.currentUserId, cancelReason: reason }
          : r)),
        // ⚠️ Etkinlik silinmez; yalnız oda bağı kopar (BR-APR-19).
        events: state.events.map((e) => (e.id === rez.eventId ? { ...e, roomId: null } : e)),
      };

      // N-RES-06 — sahibine gider. Kendi rezervasyonunu kaldıranı bilgilendirmeyiz (BR-NOT-22).
      if (rez.requesterId !== state.currentUserId) {
        const ev = state.events.find((e) => e.id === rez.eventId);
        const by = userById2(state, state.currentUserId);
        next = notify(
          next, rez.requesterId, 'N-RES-06',
          `${room.name} rezervasyonunuz kaldırıldı`,
          `${longDateLabel(rez.date)} · ${timeRangeLabel(rez.start, rez.end)}`
          + `${ev ? ` · ${ev.title}` : ''} — ${by ?? 'oda sorumlusu'}: ${reason}`
          + ' Etkinliğiniz duruyor, odasız kaldı.',
        );
      }

      return ui(next, {
        cancellingReservationId: null,
        toast: { message: `${room.name} rezervasyonu kaldırıldı.`, tone: 'default' },
      });
    }

    /** BR-APR-19 — red: slot serbest kalır, etkinlik silinmez; odasız kalır. */
    case 'rejectRequest': {
      const req = state.requests.find((r) => r.id === action.requestId);
      if (!req) return state;
      const room = state.rooms.find((r) => r.id === req.roomId);
      if (!room || !canDecideRequest(req, room, state.currentUserId, state.groups)) {
        return ui(state, { toast: { message: 'Bu talebi reddetme yetkiniz yok.', tone: 'error' } });
      }
      const next: AppState = {
        ...state,
        requests: state.requests.map((r) => (r.id === req.id
          ? {
            ...r, status: 'rejected', decidedById: state.currentUserId,
            decidedAt: `${state.today}T00:00:00`, reason: action.reason.trim() || null,
          }
          : r)),
        reservations: state.reservations.map((r) =>
          r.id === req.reservationId ? { ...r, status: 'rejected' } : r),
        events: state.events.map((e) => (e.id === req.eventId ? { ...e, roomId: null } : e)),
      };
      return ui(notify(next, req.requesterId, 'N-RES-03', 'Rezervasyon reddedildi',
        `${room.name} rezervasyon talebiniz reddedildi.`), {
        rejectingRequestId: null,
        toast: { message: `${room.name} talebi reddedildi. Oda tekrar müsait.`, tone: 'info' },
      });
    }

    /** BR-APR-16 — talep eden kendi bekleyen talebini geri çeker → Cancelled. */
    case 'withdrawRequest': {
      const req = state.requests.find((r) => r.id === action.requestId);
      if (!req || req.requesterId !== state.currentUserId || req.status !== 'pending') return state;
      let next: AppState = {
        ...state,
        requests: state.requests.map((r) => (r.id === req.id ? { ...r, status: 'cancelled' } : r)),
        reservations: state.reservations.map((r) =>
          r.id === req.reservationId ? { ...r, status: 'cancelled' } : r),
        events: state.events.map((e) => (e.id === req.eventId ? { ...e, roomId: null } : e)),
      };
      // N-RES-04 — karar bekleyen onaylayıcılara "artık beklemede değil" bilgisi gider.
      const room4 = state.rooms.find((r) => r.id === req.roomId);
      if (room4) {
        for (const aid of eligibleApprovers(room4, req.requesterId, state.groups)) {
          next = notify(next, aid, 'N-RES-04', 'Rezervasyon talebi geri çekildi',
            `${room4.name} · karar vermenize gerek kalmadı.`);
        }
      }
      return ui(next, { toast: { message: 'Talebiniz geri çekildi.', tone: 'info' } });
    }

    /* ── Takvim CRUD (12-calendars-spec §2) ── */
    case 'openCalendarForm':
      return ui(state, {
        calendarForm: {
          mode: action.mode,
          calendarId: action.calendarId ?? null,
          focus: action.focus ?? 'name',
        },
        calendarMenuId: null,
      });

    case 'closeCalendarForm':
      return ui(state, { calendarForm: null });

    /** BR-CAL-02 — takvim onu oluşturan kullanıcıya aittir. */
    case 'createCalendar': {
      const id = `cal_${state.seq}` as CalendarId;
      const next: AppState = {
        ...state,
        calendars: [...state.calendars, {
          id, name: action.name.trim(), color: action.color,
          ownerId: state.currentUserId, kind: 'personal', isDefault: false,
        }],
        seq: state.seq + 1,
      };
      return ui(next, {
        calendarForm: null,
        toast: { message: `${action.name.trim()} takvimi oluşturuldu.`, tone: 'success' },
      });
    }

    /** BR-CAL-03 — varsayılan takvimin de adı ve rengi değiştirilebilir. */
    case 'updateCalendar':
      return ui({
        ...state,
        calendars: state.calendars.map((c) => (c.id === action.calendarId
          ? { ...c, name: action.name.trim(), color: action.color } : c)),
      }, { calendarForm: null, toast: { message: 'Takvim güncellendi.', tone: 'success' } });

    case 'askDeleteCalendar':
      return ui(state, { deletingCalendarId: action.calendarId, calendarMenuId: null });

    /**
     * BR-CAL-21 — varsayılan takvim silinemez.
     * BR-CAL-22 — etkinlikler sessizce ve topluca silinemez; kullanıcı açık seçim yapar.
     * BR-CAL-23 — silme tüm paylaşımları kaldırır; alıcılar N-CAL-02 alır.
     */
    case 'deleteCalendar': {
      const cal = state.calendars.find((c) => c.id === action.calendarId);
      if (!cal || cal.isDefault || cal.ownerId !== state.currentUserId) return state;

      const affected = state.events.filter((e) => e.calendarId === cal.id);
      let next: AppState = state;

      if (action.mode === 'move' && action.targetCalendarId) {
        next = {
          ...next,
          events: next.events.map((e) => (e.calendarId === cal.id
            ? { ...e, calendarId: action.targetCalendarId! } : e)),
        };
      } else {
        // Etkinlikler de siliniyorsa bağlı rezervasyon ve talepler Cancelled olur (BR-APR-31).
        for (const e of affected) next = releaseReservation(next, e.id);
        next = { ...next, events: next.events.filter((e) => e.calendarId !== cal.id) };
      }

      // Paylaşımlar düşer, alıcılar bilgilendirilir.
      const grantees = next.shares.filter((s) => s.calendarId === cal.id).map((s) => s.granteeId);
      next = { ...next, shares: next.shares.filter((s) => s.calendarId !== cal.id) };
      for (const g of grantees) {
        next = notify(next, g, 'N-CAL-02', 'Takvim paylaşımı kaldırıldı',
          `${cal.name} takvimi silindi ve artık sizinle paylaşılmıyor.`);
      }

      return ui({
        ...next,
        calendars: next.calendars.filter((c) => c.id !== cal.id),
      }, {
        deletingCalendarId: null,
        hiddenCalendarIds: next.ui.hiddenCalendarIds.filter((c) => c !== cal.id),
        toast: {
          message: affected.length === 0
            ? `${cal.name} silindi.`
            : action.mode === 'move'
              ? `${cal.name} silindi; ${affected.length} etkinlik taşındı.`
              : `${cal.name} ve ${affected.length} etkinliği silindi.`,
          tone: 'info',
        },
      });
    }

    /* ── Oda yönetimi ── */
    case 'selectRoom':
      return ui(state, { selectedRoomId: action.roomId });

    case 'startRoomDraft':
      return ui(state, { creatingRoom: true, selectedRoomId: null });

    case 'cancelRoomDraft':
      return ui(state, { creatingRoom: false, selectedRoomId: state.rooms[0]?.id ?? null });

    /** BR-ROOM-02 — oda adı organizasyon içinde benzersizdir. */
    case 'createRoom': {
      const id = `room_${state.seq}` as RoomId;
      const room = { ...action.room, id };
      return ui({ ...state, rooms: [...state.rooms, room], seq: state.seq + 1 }, {
        creatingRoom: false, selectedRoomId: id,
        toast: { message: `${room.name} oluşturuldu.`, tone: 'success' },
      });
    }

    /** BR-ROOM-31 — rezervasyon kaydı olan oda silinemez; pasife alınır. */
    case 'deleteRoom': {
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (!room) return state;
      if (state.reservations.some((r) => r.roomId === room.id)) {
        return ui(state, {
          confirm: null,
          toast: {
            message: `${room.name} silinemez: rezervasyon kaydı var. Bunun yerine pasife alabilirsiniz.`,
            tone: 'error',
          },
        });
      }
      const rooms = state.rooms.filter((r) => r.id !== room.id);
      return ui({ ...state, rooms }, {
        confirm: null,
        selectedRoomId: rooms[0]?.id ?? null,
        toast: { message: `${room.name} silindi.`, tone: 'info' },
      });
    }

    /** BR-ROOM-30 — bina, oda formundaki lokasyon alanından oluşturulur. */
    case 'createBuilding': {
      const name = action.name.trim();
      if (!name || state.buildings.some((b) => b.name === name)) return state;
      return {
        ...state,
        buildings: [...state.buildings, { id: `bld_${state.seq}` as never, name }],
        seq: state.seq + 1,
      };
    }

    case 'saveRoom':
      return ui({
        ...state,
        rooms: state.rooms.map((r) => (r.id === action.room.id ? action.room : r)),
      }, { toast: { message: `${action.room.name} kaydedildi.`, tone: 'success' } });

    case 'updateRoomAccess':
      return {
        ...state,
        rooms: state.rooms.map((r) => (r.id === action.roomId ? { ...r, ...action.patch } : r)),
      };

    case 'markNotificationsRead':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          (n.recipientId === state.currentUserId ? { ...n, read: true } : n)),
      };

    case 'toast':
      return ui(state, { toast: { message: action.message, tone: action.tone ?? 'info' } });

    case 'clearToast':
      return ui(state, { toast: null });

    /* ── Demo yardımcıları (sunum UI'ında görünmez) ── */
    case 'setPersona':
      return ui({ ...state, currentUserId: action.userId }, {
        draft: null, readOnlyEventId: null, roomPickerOpen: false, shareCalendarId: null,
        selectedRequestId: null, hiddenCalendarIds: [], hiddenRoomIds: [],
        toast: {
          message: `Persona: ${state.users.find((u) => u.id === action.userId)?.name ?? ''}`,
          tone: 'info',
        },
      });

    /**
     * ⚠️ Gerçek kimlik doğrulama değildir — backend yok.
     * Demo giriş ekranı yalnızca hangi persona ile test edileceğini seçer.
     */
    case 'signIn':
      return ui({ ...state, currentUserId: action.userId }, {
        signedIn: true, route: 'calendar', anchorDate: state.today, mobileDate: state.today,
      });

    case 'signOut':
      return ui(state, { signedIn: false });

    case 'dismissDemoBanner':
      return ui(state, { demoBannerOpen: false });

    case 'toggleDemoPanel':
      return ui(state, { demoPanelOpen: !state.ui.demoPanelOpen });

    case 'resetDemo':
      return createInitialState();

    case 'setMobileSheet':
      return ui(state, { mobileSheet: action.sheet });

    case 'setMobileDate':
      return ui(state, { mobileDate: action.date, anchorDate: action.date });

    default:
      return state;
  }
}

export type { RoomId, CalendarId, EventId };
