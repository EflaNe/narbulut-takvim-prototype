/** Türetilmiş okuma yardımcıları. State'i değiştirmez. */
import type { AppState } from '../state/types';
import type {
  Calendar, CalendarEvent, CalendarId, EventId, IsoDate, Reservation, Room, RoomId, User, UserId,
} from './types';
import { canDecideRequest, canViewRoom, eligibleApprovers, sharedWithMe, visibleRequests } from './rules';
import { weekDates } from './time';

export function userById(s: AppState, id: UserId): User | undefined {
  return s.users.find((u) => u.id === id);
}

export function calendarById(s: AppState, id: CalendarId): Calendar | undefined {
  return s.calendars.find((c) => c.id === id);
}

export function roomById(s: AppState, id: RoomId | null): Room | undefined {
  return id ? s.rooms.find((r) => r.id === id) : undefined;
}

export function myCalendars(s: AppState): Calendar[] {
  return s.calendars.filter((c) => c.ownerId === s.currentUserId);
}

export function mySharedCalendars(s: AppState) {
  return sharedWithMe(s.calendars, s.shares, s.currentUserId);
}

/** Bir takvim şu anda ızgarada render ediliyor mu? */
export function isCalendarVisible(s: AppState, calendarId: CalendarId): boolean {
  const cal = calendarById(s, calendarId);
  if (!cal) return false;
  if (cal.ownerId === s.currentUserId) return !s.ui.hiddenCalendarIds.includes(calendarId);
  const share = s.shares.find(
    (x) => x.calendarId === calendarId && x.granteeId === s.currentUserId);
  return !!share && share.visibleForGrantee && !s.ui.hiddenCalendarIds.includes(calendarId);
}

/** Kullanıcının detayını görebildiği tüm takvimler (sahip + paylaşılan). */
export function readableCalendarIds(s: AppState): CalendarId[] {
  return [
    ...myCalendars(s).map((c) => c.id),
    ...mySharedCalendars(s).map((x) => x.calendar.id),
  ];
}

/** Sol rail'in oda ekseni: kapatılan odada rezerve edilmiş etkinlik ızgaradan düşer.
 *  Odasız etkinlikler bu eksenden etkilenmez (BR-SHELL-31c). */
export function isRoomVisible(s: AppState, roomId: string | null): boolean {
  if (!roomId) return true;
  return !s.ui.hiddenRoomIds.includes(roomId as never);
}

/** Kullanıcının oda ekseninde görebildiği odalar (BR-PRM-09). */
export function filterableRooms(s: AppState): Room[] {
  return s.rooms.filter((r) => canViewRoom(r, s.currentUserId, s.groups));
}

export function visibleEvents(s: AppState): CalendarEvent[] {
  const readable = new Set(readableCalendarIds(s));
  return s.events.filter((e) => readable.has(e.calendarId)
    && isCalendarVisible(s, e.calendarId)
    && isRoomVisible(s, e.roomId));
}

export function eventsForDate(s: AppState, date: IsoDate): CalendarEvent[] {
  return visibleEvents(s)
    .filter((e) => e.date === date)
    .sort((a, b) => a.start - b.start || a.end - b.end);
}

export function eventsForWeek(s: AppState, anchor: IsoDate): Record<IsoDate, CalendarEvent[]> {
  const out: Record<IsoDate, CalendarEvent[]> = {};
  for (const d of weekDates(anchor)) out[d] = eventsForDate(s, d);
  return out;
}

export function activeReservationForEvent(s: AppState, eventId: EventId): Reservation | undefined {
  return s.reservations.find(
    (r) => r.eventId === eventId && (r.status === 'pending' || r.status === 'reserved'));
}

export function reservationStatusForEvent(
  s: AppState, eventId: EventId,
): 'none' | 'pending' | 'reserved' {
  const r = activeReservationForEvent(s, eventId);
  return r ? r.status as 'pending' | 'reserved' : 'none';
}

export function isSharedEvent(s: AppState, event: CalendarEvent): boolean {
  const cal = calendarById(s, event.calendarId);
  return !!cal && cal.ownerId !== s.currentUserId;
}

export function myRequests(s: AppState) {
  return visibleRequests(s.requests, s.rooms, s.currentUserId, s.groups);
}

export function pendingRequests(s: AppState) {
  return myRequests(s).filter((r) => r.status === 'pending');
}

export function decidedRequests(s: AppState) {
  return myRequests(s).filter((r) => r.status !== 'pending');
}

export function canDecide(s: AppState, requestId: string): boolean {
  const req = s.requests.find((r) => r.id === requestId);
  if (!req) return false;
  const room = roomById(s, req.roomId);
  if (!room) return false;
  return canDecideRequest(req, room, s.currentUserId, s.groups);
}

export function approverNames(s: AppState, room: Room, requesterId: UserId): string[] {
  return eligibleApprovers(room, requesterId, s.groups)
    .map((id) => userById(s, id)?.name)
    .filter((n): n is string => !!n);
}

/** Aynı gün içinde çakışan etkinlikler için yan yana yerleşim hesabı. */
export interface LaidOutEvent {
  event: CalendarEvent;
  columnIndex: number;
  columnCount: number;
}

export function layoutDay(events: CalendarEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: LaidOutEvent[] = [];
  let cluster: CalendarEvent[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    const columns: CalendarEvent[][] = [];
    for (const ev of cluster) {
      let placed = false;
      for (const col of columns) {
        if (col[col.length - 1].end <= ev.start) { col.push(ev); placed = true; break; }
      }
      if (!placed) columns.push([ev]);
    }
    columns.forEach((col, ci) => {
      for (const ev of col) out.push({ event: ev, columnIndex: ci, columnCount: columns.length });
    });
    cluster = [];
    clusterEnd = -1;
  };

  for (const ev of sorted) {
    if (cluster.length && ev.start >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.end);
  }
  flush();
  return out.sort((a, b) => a.event.start - b.event.start);
}

export function searchEvents(s: AppState, query: string): CalendarEvent[] {
  const q = query.trim().toLocaleLowerCase('tr-TR');
  if (!q) return [];
  return visibleEvents(s)
    .filter((e) => e.title.toLocaleLowerCase('tr-TR').includes(q))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start))
    .slice(0, 20);
}

/** Oturumdaki kullanıcıya düşen bildirimler, en yenisi başta. */
export function myNotifications(s: AppState) {
  return s.notifications.filter((n) => n.recipientId === s.currentUserId);
}

export function unreadNotificationCount(s: AppState): number {
  return myNotifications(s).filter((n) => !n.read).length;
}

/** Oturumdaki kullanıcının **karar verebileceği** bekleyen talepler (kendi talepleri hariç). */
export function decidableRequests(s: AppState) {
  return s.requests.filter((r) => r.status === 'pending' && canDecide(s, r.id));
}
