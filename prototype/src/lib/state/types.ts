import type {
  AppNotification, ApprovalRequest, Building, Calendar, CalendarEvent, CalendarId,
  CalendarShare, CalendarViewMode, Group, IsoDate, Minutes, Recurrence, Reservation,
  RequestId, Room, RoomId, User, UserId, EventId,
} from '../domain/types';

export type Route = 'calendar' | 'permissions' | 'rooms' | 'requests';

export interface EventDraft {
  /** null → yeni etkinlik */
  id: EventId | null;
  calendarId: CalendarId;
  title: string;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  participantIds: UserId[];
  roomId: RoomId | null;
  notes: string;
  recurrence: Recurrence;
}

export interface QuickCreateState {
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  /** ızgara içindeki konum — popover yerleşimi için */
  x: number;
  y: number;
  title: string;
}

export interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  tone: 'default' | 'destructive';
  action: AppAction;
}

export interface UiState {
  route: Route;
  anchorDate: IsoDate;
  viewMode: CalendarViewMode;
  /** Kapatılan owned takvimler (BR-CAL-18) */
  hiddenCalendarIds: CalendarId[];
  /** Kapatılan odalar — sol rail'in oda ekseni (BR-SHELL-31, KEEP-03) */
  hiddenRoomIds: RoomId[];
  showRejected: boolean;
  searchQuery: string;
  searchOpen: boolean;
  quickCreate: QuickCreateState | null;
  draft: EventDraft | null;
  /** Salt okunur görüntüleme (paylaşılan takvim etkinliği) */
  readOnlyEventId: EventId | null;
  roomPickerOpen: boolean;
  shareCalendarId: CalendarId | null;
  calendarMenuId: CalendarId | null;
  sharedMenuId: CalendarId | null;
  confirm: ConfirmState | null;
  selectedRequestId: RequestId | null;
  rejectingRequestId: RequestId | null;
  selectedRoomId: RoomId | null;
  toast: { message: string; tone: 'info' | 'success' | 'error' } | null;
  /** Sunum UI'ında görünmez — Shift+D ile açılan demo paneli */
  demoPanelOpen: boolean;
  mobileSheet: 'none' | 'calendars' | 'event' | 'removeShared' | 'newEvent';
  mobileDate: IsoDate;
}

export interface AppState {
  currentUserId: UserId;
  today: IsoDate;
  nowMinutes: Minutes;
  users: User[];
  groups: Group[];
  buildings: Building[];
  calendars: Calendar[];
  shares: CalendarShare[];
  rooms: Room[];
  events: CalendarEvent[];
  reservations: Reservation[];
  requests: ApprovalRequest[];
  notifications: AppNotification[];
  ui: UiState;
  seq: number;
}

export type AppAction =
  | { type: 'navigate'; route: Route }
  | { type: 'setAnchorDate'; date: IsoDate }
  | { type: 'shiftWeek'; delta: number }
  | { type: 'goToday' }
  | { type: 'setViewMode'; mode: CalendarViewMode }
  | { type: 'toggleCalendar'; calendarId: CalendarId }
  | { type: 'toggleRoomFilter'; roomId: RoomId }
  | { type: 'setAllRoomFilters'; on: boolean }
  | { type: 'toggleRejected' }
  | { type: 'toggleSharedVisibility'; calendarId: CalendarId }
  | { type: 'removeSharedCalendar'; calendarId: CalendarId }
  | { type: 'setSearch'; query: string }
  | { type: 'setSearchOpen'; open: boolean }
  | { type: 'openQuickCreate'; date: IsoDate; start: Minutes; end: Minutes; x: number; y: number }
  | { type: 'updateQuickCreate'; title: string }
  | { type: 'closeQuickCreate' }
  | { type: 'quickCreateSave' }
  | { type: 'quickCreateExpand' }
  | { type: 'openEventCreate'; date?: IsoDate; start?: Minutes; end?: Minutes }
  | { type: 'openEventEdit'; eventId: EventId }
  | { type: 'openReadOnlyEvent'; eventId: EventId }
  | { type: 'closeEventDrawer' }
  | { type: 'updateDraft'; patch: Partial<EventDraft> }
  | { type: 'toggleParticipant'; userId: UserId }
  | { type: 'saveEvent' }
  | { type: 'deleteEvent'; eventId: EventId }
  | { type: 'openRoomPicker' }
  | { type: 'closeRoomPicker' }
  | { type: 'pickRoom'; roomId: RoomId | null }
  | { type: 'openShareDrawer'; calendarId: CalendarId }
  | { type: 'closeShareDrawer' }
  | { type: 'addShare'; calendarId: CalendarId; userId: UserId }
  | { type: 'removeShare'; calendarId: CalendarId; userId: UserId }
  | { type: 'setCalendarMenu'; calendarId: CalendarId | null }
  | { type: 'setSharedMenu'; calendarId: CalendarId | null }
  | { type: 'askConfirm'; confirm: ConfirmState }
  | { type: 'closeConfirm' }
  | { type: 'selectRequest'; requestId: RequestId | null }
  | { type: 'approveRequest'; requestId: RequestId }
  | { type: 'startReject'; requestId: RequestId | null }
  | { type: 'rejectRequest'; requestId: RequestId; reason: string }
  | { type: 'withdrawRequest'; requestId: RequestId }
  | { type: 'selectRoom'; roomId: RoomId | null }
  | { type: 'saveRoom'; room: Room }
  | { type: 'updateRoomAccess'; roomId: RoomId; patch: Partial<Room> }
  | { type: 'toast'; message: string; tone?: 'info' | 'success' | 'error' }
  | { type: 'clearToast' }
  | { type: 'setPersona'; userId: UserId }
  | { type: 'toggleDemoPanel' }
  | { type: 'resetDemo' }
  | { type: 'setMobileSheet'; sheet: UiState['mobileSheet'] }
  | { type: 'setMobileDate'; date: IsoDate };
