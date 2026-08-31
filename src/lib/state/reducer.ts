/**
 * Tek merkezî reducer. Tüm durum geçişleri buradan geçer;
 * hiçbir iş kuralı bileşenlerin içinde yeniden uygulanmaz.
 */
import type {
  ApprovalRequest, CalendarEvent, CalendarId, EventId, NotificationKind, Reservation,
  RoomId, ShareId, UserId,
} from '../domain/types';
import {
  canCreatePendingRequest, canDecideRequest, roomAvailability,
} from '../domain/rules';
import { addDays, startOfWeek } from '../domain/time';
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
    notifications: [],
    seq: 1,
    ui: {
      route: 'calendar',
      anchorDate: demo.DEMO_TODAY,
      viewMode: 'week',
      hiddenCalendarIds: [],
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
      selectedRoomId: 'room_istanbul',
      toast: null,
      demoPanelOpen: false,
      mobileSheet: 'none',
      mobileDate: demo.DEMO_TODAY,
    },
  };
}

/* ────────────────────────────── yardımcılar ────────────────────────────── */

const nextId = (s: AppState, prefix: string) => `${prefix}_${s.seq}`;

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

    case 'shiftWeek':
      return ui(state, {
        anchorDate: addDays(startOfWeek(state.ui.anchorDate), action.delta * 7),
      });

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
      return ui(notify(next, state.currentUserId, 'N-CAL-02',
        'Paylaşım kaldırıldı', `${cal?.name ?? 'Takvim'} artık takviminizde görünmüyor.`), {
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
        const avail = roomAvailability(
          room.id, d.date, d.start, d.end, state.reservations, d.id ?? undefined);
        if (avail !== 'available') {
          return ui(state, {
            toast: {
              message: avail === 'reserved'
                ? `${room.name} seçtiğiniz saatte dolu.`
                : `${room.name} için bu saatte bekleyen bir talep var.`,
              tone: 'error',
            },
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

      const pendingNow = next.reservations.some(
        (r) => r.eventId === eventId && r.status === 'pending');

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
      const next = releaseReservation(state, action.eventId);
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
      return ui(notify(next, action.userId, 'N-CAL-01', 'Bir takvim sizinle paylaşıldı',
        `${cal?.name ?? 'Takvim'} takvimi sizinle paylaşıldı.`), {
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
      return ui(notify(next, action.userId, 'N-CAL-02', 'Takvim paylaşımı kaldırıldı',
        `${cal?.name ?? 'Takvim'} artık sizinle paylaşılmıyor.`), {
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
      return ui({
        ...state,
        requests: state.requests.map((r) => (r.id === req.id ? { ...r, status: 'cancelled' } : r)),
        reservations: state.reservations.map((r) =>
          r.id === req.reservationId ? { ...r, status: 'cancelled' } : r),
        events: state.events.map((e) => (e.id === req.eventId ? { ...e, roomId: null } : e)),
      }, { toast: { message: 'Talebiniz geri çekildi.', tone: 'info' } });
    }

    /* ── Oda yönetimi ── */
    case 'selectRoom':
      return ui(state, { selectedRoomId: action.roomId });

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

    case 'toast':
      return ui(state, { toast: { message: action.message, tone: action.tone ?? 'info' } });

    case 'clearToast':
      return ui(state, { toast: null });

    /* ── Demo yardımcıları (sunum UI'ında görünmez) ── */
    case 'setPersona':
      return ui({ ...state, currentUserId: action.userId }, {
        draft: null, readOnlyEventId: null, roomPickerOpen: false, shareCalendarId: null,
        selectedRequestId: null, hiddenCalendarIds: [],
        toast: {
          message: `Persona: ${state.users.find((u) => u.id === action.userId)?.name ?? ''}`,
          tone: 'info',
        },
      });

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
