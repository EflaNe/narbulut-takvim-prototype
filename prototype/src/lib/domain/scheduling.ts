/**
 * "Uygun zamanlar" önerileri (17-scheduling-spec.md).
 * 7 gün / 3 öneri sınırları katı kural değildir; prototip için seçilmiş değerlerdir.
 */
import type { CalendarEvent, IsoDate, Minutes, Reservation, Room, UserId } from './types';
import { addDays, isWeekend, overlaps, WORK_END_H, WORK_START_H } from './time';
import { roomAvailability } from './rules';

export interface Suggestion {
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  /** Öneriyi açıklayan tek satır — neden bu slot? */
  reason: string;
  allRequiredFree: boolean;
  roomName: string | null;
}

function userBusy(
  userId: UserId, date: IsoDate, start: Minutes, end: Minutes,
  events: CalendarEvent[], ignoreEventId?: string,
): boolean {
  return events.some(
    (e) => e.id !== ignoreEventId && e.date === date && overlaps(start, end, e.start, e.end)
      && (e.organizerId === userId || e.participantIds.includes(userId)),
  );
}

export function suggestTimes(opts: {
  fromDate: IsoDate;
  durationMinutes: number;
  participantIds: UserId[];
  organizerId: UserId;
  events: CalendarEvent[];
  rooms: Room[];
  reservations: Reservation[];
  ignoreEventId?: string;
  limit?: number;
}): Suggestion[] {
  const {
    fromDate, durationMinutes, participantIds, organizerId, events, rooms,
    reservations, ignoreEventId, limit = 3,
  } = opts;

  // Harici misafirler müsaitlik bilgisine dahil değildir (BR-PRM-18).
  const internal = participantIds.filter((id) => !id.startsWith('usr_guest'));
  const attendees = Array.from(new Set([organizerId, ...internal]));
  const out: Suggestion[] = [];

  for (let d = 0; d < 7 && out.length < limit; d += 1) {
    const date = addDays(fromDate, d);
    if (isWeekend(date)) continue;
    for (let start = WORK_START_H * 60; start + durationMinutes <= WORK_END_H * 60; start += 30) {
      const end = start + durationMinutes;
      const busy = attendees.filter(
        (id) => userBusy(id, date, start, end, events, ignoreEventId));
      if (busy.length > 1) continue;

      const freeRoom = rooms.find(
        (r) => roomAvailability(r.id, date, start, end, reservations, ignoreEventId) === 'available');

      const allFree = busy.length === 0;
      if (!allFree && out.length >= limit - 1) continue;

      out.push({
        date, start, end,
        allRequiredFree: allFree,
        roomName: freeRoom?.name ?? null,
        reason: allFree
          ? freeRoom
            ? `Tüm katılımcılar müsait · ${freeRoom.name} boş`
            : 'Tüm katılımcılar müsait · uygun oda yok'
          : 'Bir katılımcı meşgul',
      });
      if (out.length >= limit) break;
      start += 60; // aynı gün içinde önerileri seyrelt
    }
  }
  return out;
}
