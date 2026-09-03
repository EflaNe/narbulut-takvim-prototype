/**
 * İş kuralları. UI bileşenlerinin içine dağıtılmaz — hepsi buradadır.
 * Her fonksiyonun başındaki BR kodu docs/takvim altındaki spec'e karşılık gelir.
 */
import type {
  AccessRule, ApprovalRequest, Calendar, CalendarEvent, CalendarShare,
  Group, IsoDate, Minutes, Reservation, Room, RoomId, User, UserId,
} from './types';
import { overlaps } from './time';

/* ────────────────────────── Yetki (10-permissions-spec) ────────────────────────── */

/** BR-PRM-05 — yetki toplamsaldır: "Tüm kullanıcılar" ∪ grup ∪ doğrudan. Explicit DENY yoktur. */
export function ruleGrants(rule: AccessRule, userId: UserId, groups: Group[]): boolean {
  if (rule.allUsers) return true;
  if (rule.userIds.includes(userId)) return true;
  return rule.groupIds.some((gid) =>
    groups.find((g) => g.id === gid)?.memberIds.includes(userId),
  );
}

/** BR-PRM-06 / BR-PRM-09 — Görebilir yoksa oda hiç render edilmez. */
export function canViewRoom(room: Room, userId: UserId, groups: Group[]): boolean {
  if (!room.active) return false; // BR-ROOM-07
  // BR-PRM-04 invariant: Rezerve edebilir → Görebilir'i gerektirir.
  return ruleGrants(room.canView, userId, groups) || ruleGrants(room.canReserve, userId, groups);
}

/** BR-PRM-07 — onay açık odada bu hak fiilen "talep gönderebilir" anlamına gelir. */
export function canReserveRoom(room: Room, userId: UserId, groups: Group[]): boolean {
  if (!room.active) return false;
  return ruleGrants(room.canReserve, userId, groups);
}

/** BR-PRM-04 / IR-PRM-03 — eksik Görebilir hakkı otomatik tamamlanır. */
export function completeViewFromReserve(room: Room): { room: Room; changed: boolean } {
  if (room.canView.allUsers) return { room, changed: false };
  const missingUsers = room.canReserve.userIds.filter((u) => !room.canView.userIds.includes(u));
  const missingGroups = room.canReserve.groupIds.filter((g) => !room.canView.groupIds.includes(g));
  const needsAll = room.canReserve.allUsers && !room.canView.allUsers;
  if (!missingUsers.length && !missingGroups.length && !needsAll) return { room, changed: false };
  return {
    changed: true,
    room: {
      ...room,
      canView: {
        allUsers: room.canView.allUsers || room.canReserve.allUsers,
        userIds: [...room.canView.userIds, ...missingUsers],
        groupIds: [...room.canView.groupIds, ...missingGroups],
      },
    },
  };
}

/** BR-PRM-14 — boş erişim kuralı geçersizdir. */
export function isAccessRuleValid(rule: AccessRule): boolean {
  return rule.allUsers || rule.userIds.length > 0 || rule.groupIds.length > 0;
}

/* ────────────────── Takvim görünürlüğü & paylaşım (12-calendars-spec) ────────────────── */

export function ownedCalendars(calendars: Calendar[], userId: UserId): Calendar[] {
  return calendars.filter((c) => c.ownerId === userId);
}

/** BR-CAL-30 — benimle paylaşılanlar; kaldırılan paylaşım kaydı state'ten silinir. */
export function sharedWithMe(
  calendars: Calendar[], shares: CalendarShare[], userId: UserId,
): { calendar: Calendar; share: CalendarShare; owner: UserId }[] {
  return shares
    .filter((s) => s.granteeId === userId)
    .map((s) => {
      const calendar = calendars.find((c) => c.id === s.calendarId);
      return calendar ? { calendar, share: s, owner: calendar.ownerId } : null;
    })
    .filter((x): x is { calendar: Calendar; share: CalendarShare; owner: UserId } => x !== null);
}

/** BR-CAL-27 — paylaşım salt okunurdur: alıcı düzenleyemez, silemez. */
export function canEditEvent(
  event: CalendarEvent, calendars: Calendar[], userId: UserId,
): boolean {
  const cal = calendars.find((c) => c.id === event.calendarId);
  if (!cal) return false;
  return cal.ownerId === userId;
}

/** BR-CAL-36 / BR-CAL-35 / BR-CAL-25 — paylaşım hedefi doğrulaması. */
export function shareTargetState(
  calendar: Calendar, target: User, shares: CalendarShare[], currentOrgId: string,
): 'ok' | 'self' | 'already' | 'external' {
  if (target.id === calendar.ownerId) return 'self';
  if (target.orgId !== currentOrgId) return 'external';
  if (shares.some((s) => s.calendarId === calendar.id && s.granteeId === target.id)) return 'already';
  return 'ok';
}

/* ─────────────── Oda müsaitliği & seçilebilirlik (16-room-booking §4.1) ─────────────── */

export type RoomAvailability = 'available' | 'reserved' | 'pending';

/**
 * ⚠️ D-070 — **bekleyen talep slotu bloke etmez.** Yalnız kesinleşmiş rezervasyon bloke eder.
 * `'pending'` dönmesi "başkası da istemiş" bilgisidir; seçimi engellemez (BR-APR-12).
 */
export function roomAvailability(
  roomId: RoomId, date: IsoDate, start: Minutes, end: Minutes,
  reservations: Reservation[], ignoreEventId?: string,
): RoomAvailability {
  const active = reservations.filter(
    (r) => r.roomId === roomId && r.date === date
      && (r.status === 'reserved' || r.status === 'pending')
      && r.eventId !== ignoreEventId
      && overlaps(start, end, r.start, r.end),
  );
  if (active.some((r) => r.status === 'reserved')) return 'reserved';
  if (active.some((r) => r.status === 'pending')) return 'pending';
  return 'available';
}

/** Aynı aralığa düşen bekleyen talep sayısı — bilgi amaçlıdır, engel değildir. */
export function competingPendingCount(
  roomId: RoomId, date: IsoDate, start: Minutes, end: Minutes,
  reservations: Reservation[], ignoreEventId?: string,
): number {
  return reservations.filter(
    (r) => r.roomId === roomId && r.date === date && r.status === 'pending'
      && r.eventId !== ignoreEventId && overlaps(start, end, r.start, r.end),
  ).length;
}

/**
 * ⚠️ D-070 — **onay anında çakışma kontrolü.**
 * Talepler serbestçe birikir; çakışma yalnız karar anında değerlendirilir.
 * Slot kesinleşmişse onay verilemez — ama bekleyen talep **otomatik reddedilmez**,
 * karar yöneticide kalır (BR-APR-13a/13b).
 */
export function canApproveNow(
  reservation: Reservation, reservations: Reservation[],
): { ok: true } | { ok: false; blockedBy: Reservation } {
  const clash = reservations.find(
    (r) => r.id !== reservation.id && r.roomId === reservation.roomId
      && r.date === reservation.date && r.status === 'reserved'
      && overlaps(reservation.start, reservation.end, r.start, r.end),
  );
  return clash ? { ok: false, blockedBy: clash } : { ok: true };
}

export interface RoomSelectability {
  visible: boolean;
  selectable: boolean;
  availability: RoomAvailability;
  /** Kullanıcıya gösterilecek sebep — seçilemiyorsa doludur. */
  reason: string | null;
}

/**
 * 16-room-booking-spec.md §4.1 seçilebilirlik matrisi.
 * Yetki sebebi müsaitlik sebebinden önceliklidir.
 */
export function roomSelectability(
  room: Room, userId: UserId, groups: Group[],
  date: IsoDate, start: Minutes, end: Minutes,
  reservations: Reservation[], ignoreEventId?: string,
): RoomSelectability {
  const availability = roomAvailability(room.id, date, start, end, reservations, ignoreEventId);
  if (!canViewRoom(room, userId, groups)) {
    return { visible: false, selectable: false, availability, reason: null };
  }
  if (!canReserveRoom(room, userId, groups)) {
    return {
      visible: true, selectable: false, availability,
      reason: 'Bu odayı rezerve etme yetkiniz yok',
    };
  }
  if (availability === 'reserved') {
    return { visible: true, selectable: false, availability, reason: 'Seçtiğiniz saatte dolu' };
  }
  // D-070 — bekleyen talep varken oda **seçilebilir**; bilgi olarak belirtilir.
  if (availability === 'pending') {
    return {
      visible: true, selectable: true, availability,
      reason: 'Bu saat için bekleyen başka bir talep var',
    };
  }
  return { visible: true, selectable: true, availability, reason: null };
}

/* ───────────────────── Onay (18-reservation-approval-spec) ───────────────────── */

/** BR-APR-17d — eligible approver = onaylayıcı listesindeki, talebi oluşturandan farklı kullanıcı. */
export function eligibleApprovers(room: Room, requesterId: UserId, groups: Group[]): UserId[] {
  const direct = room.approverUserIds;
  const viaGroup = room.approverGroupIds.flatMap(
    (gid) => groups.find((g) => g.id === gid)?.memberIds ?? [],
  );
  return Array.from(new Set([...direct, ...viaGroup])).filter((u) => u !== requesterId);
}

/**
 * Kullanıcı bu odanın onaylayıcısı mı? `eligibleApprovers`'tan farkı: talep eden
 * elenmez. Onay yetkisi için değil, **oda sorumluluğu** için sorulur (BR-APR-28).
 */
export function isRoomApprover(room: Room, userId: UserId, groups: Group[]): boolean {
  if (room.approverUserIds.includes(userId)) return true;
  return room.approverGroupIds.some(
    (gid) => groups.find((g) => g.id === gid)?.memberIds.includes(userId),
  );
}

/**
 * D-071 / BR-APR-28 — oda sorumlusu **kendi odasındaki kesinleşmiş rezervasyonu**
 * gerekçeyle kaldırabilir.
 *
 * ⚠️ Bu, kararı geri almak **değildir** — BR-APR-22 yerinde durur. Talep kaydı geçmişte
 * `approved` kalır; düşen şey rezervasyondur. Kaldırma yeni ve ayrı bir eylemdir,
 * kendi gerekçesi ve kendi bildirimiyle (N-RES-06) izlenir.
 */
export function canCancelReservation(
  reservation: Reservation, room: Room, userId: UserId, groups: Group[],
): boolean {
  if (reservation.status !== 'reserved') return false;
  if (reservation.roomId !== room.id) return false;
  return isRoomApprover(room, userId, groups);
}

/**
 * D-072 / BR-APR-29 — reddedilmiş talep için "tekrar talep edin" daveti.
 *
 * ⚠️ Red **geri alınmaz** (BR-APR-22): davet, kararı değiştirmek yerine talep edeni
 * yeniden başvurmaya çağıran **yeni bir eylemdir**. Bir talebe **bir kez** gönderilir.
 */
export function canReinvite(
  request: ApprovalRequest, room: Room, userId: UserId, groups: Group[],
): boolean {
  if (request.status !== 'rejected') return false;
  if (request.reinvitedById) return false;
  if (request.requesterId === userId) return false;
  return isRoomApprover(room, userId, groups);
}

/** BR-APR-02 — onay açıksa en az bir onaylayıcı tanımlı olmak zorundadır. */
export function roomApprovalConfigValid(room: Room): boolean {
  if (!room.requiresApproval) return true;
  return room.approverUserIds.length > 0 || room.approverGroupIds.length > 0;
}

/**
 * BR-APR-17b — ELIGIBLE APPROVER INVARIANT.
 * Talep, oluşturan dışında eligible approver yoksa Pending olarak oluşturulamaz.
 * Bu blocking bir validasyondur; çözümsüz Pending üretilmez.
 */
export function canCreatePendingRequest(
  room: Room, requesterId: UserId, groups: Group[],
): { ok: true } | { ok: false; message: string } {
  if (!roomApprovalConfigValid(room)) {
    return { ok: false, message: 'Bu odanın onay yapılandırması eksik; rezervasyon talebi oluşturulamıyor.' };
  }
  if (eligibleApprovers(room, requesterId, groups).length === 0) {
    return { ok: false, message: 'Bu rezervasyonu onaylayabilecek başka bir kullanıcı bulunmuyor.' };
  }
  return { ok: true };
}

/** BR-APR-17a — self-approval yasağı: kendi talebinde Onayla/Reddet gösterilmez. */
export function canDecideRequest(
  request: ApprovalRequest, room: Room, userId: UserId, groups: Group[],
): boolean {
  if (request.status !== 'pending') return false;
  if (request.requesterId === userId) return false;
  return eligibleApprovers(room, request.requesterId, groups).includes(userId);
}

/** BR-APR-25 — onaylayıcı yalnız kendi sorumlu olduğu odaların taleplerini görür. */
export function visibleRequests(
  requests: ApprovalRequest[], rooms: Room[], userId: UserId, groups: Group[],
): ApprovalRequest[] {
  return requests.filter((req) => {
    const room = rooms.find((r) => r.id === req.roomId);
    if (!room) return false;
    if (req.requesterId === userId) return true; // kendi talebini görür (BR-APR-16 geri çekme)
    const approvers = new Set([
      ...room.approverUserIds,
      ...room.approverGroupIds.flatMap((gid) => groups.find((g) => g.id === gid)?.memberIds ?? []),
    ]);
    return approvers.has(userId);
  });
}

/* ───────────────── Çakışma (blocking vs non-blocking) ───────────────── */

export interface ParticipantConflict {
  userId: UserId;
  eventId: string;
}

/**
 * Katılımcı çakışması NON-BLOCKING'dir — uyarır, engellemez.
 * Free/busy detay yasağı (BR-PRM-11) gereği yalnız meşguliyet döner, etkinlik başlığı değil.
 */
export function participantConflicts(
  participantIds: UserId[], date: IsoDate, start: Minutes, end: Minutes,
  events: CalendarEvent[], ignoreEventId?: string,
): ParticipantConflict[] {
  const out: ParticipantConflict[] = [];
  for (const uid of participantIds) {
    const hit = events.find(
      (e) => e.id !== ignoreEventId && e.date === date
        && overlaps(start, end, e.start, e.end)
        && (e.organizerId === uid || e.participantIds.includes(uid)),
    );
    if (hit) out.push({ userId: uid, eventId: hit.id });
  }
  return out;
}

/** Kapasite aşımı NON-BLOCKING'dir — uyarır, engellemez (PC-08). */
export function capacityWarning(room: Room | null, attendeeCount: number): string | null {
  if (!room) return null;
  if (attendeeCount <= room.capacity) return null;
  return `${room.name} ${room.capacity} kişilik; ${attendeeCount} katılımcı seçtiniz.`;
}

/** Çalışma saatleri dışı NON-BLOCKING'dir — uyarır, engellemez. */
export function outsideWorkingHours(start: Minutes, end: Minutes): boolean {
  return start < 9 * 60 || end > 18 * 60;
}

/** Geçmiş tarih NON-BLOCKING'dir (15-event-spec) — uyarır, engellemez. */
export function isPastDate(date: IsoDate, today: IsoDate): boolean {
  return date < today;
}

export interface ValidationIssue {
  field: 'title' | 'date' | 'time' | 'room' | 'participants';
  severity: 'blocking' | 'warning';
  message: string;
}
