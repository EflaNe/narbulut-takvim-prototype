/**
 * Narbulut Calendar — domain tipleri.
 *
 * Kaynak: /Users/eflane/Desktop/Takvim/docs/takvim/*.md
 * Bu dosya UI'dan bağımsızdır. Backend'e geçişte entity/ID şekilleri
 * doğrudan API sözleşmesine karşılık gelecek biçimde tutulmuştur.
 */

export type UserId = `usr_${string}`;
export type GroupId = `grp_${string}`;
export type CalendarId = `cal_${string}`;
export type ShareId = `shr_${string}`;
export type BuildingId = `bld_${string}`;
export type RoomId = `room_${string}`;
export type EventId = `evt_${string}`;
export type ReservationId = `rsv_${string}`;
export type RequestId = `req_${string}`;
export type NotificationId = `ntf_${string}`;

/** ISO tarih — "2026-08-28" */
export type IsoDate = string;
/** Dakika cinsinden gün-içi zaman — 09:30 → 570 */
export type Minutes = number;

export interface User {
  id: UserId;
  name: string;
  email: string;
  title: string;
  initials: string;
  /** BR-PRM-15 — yetki değerlendirmesi organizasyon sınırındadır */
  orgId: string;
}

export interface Group {
  id: GroupId;
  name: string;
  memberIds: UserId[];
}

export type CalendarKind = 'personal' | 'project' | 'team' | 'meetings';

export interface Calendar {
  id: CalendarId;
  name: string;
  color: string;
  ownerId: UserId;
  kind: CalendarKind;
  /** D-065 — Quick Create etkinlikleri buraya düşer */
  isDefault: boolean;
}

/** BR-CAL-24/25/26 — sahip → tekil kullanıcı, tek seviye, salt okunur */
export interface CalendarShare {
  id: ShareId;
  calendarId: CalendarId;
  granteeId: UserId;
  createdAt: string;
  /** BR-CAL-32 — alıcı kendi tarafında görünürlüğü kapatabilir */
  visibleForGrantee: boolean;
}

export interface Building {
  id: BuildingId;
  name: string;
}

/** BR-PRM-02 — kural ya "Tüm kullanıcılar" ya da en az bir özne içeren liste */
export interface AccessRule {
  allUsers: boolean;
  userIds: UserId[];
  groupIds: GroupId[];
}

export interface Room {
  id: RoomId;
  name: string;
  buildingId: BuildingId;
  floor: string;
  capacity: number;
  features: string[];
  active: boolean;
  /** BR-ROOM-11 / BR-APR-01 — onay oda başınadır, global mod değildir */
  requiresApproval: boolean;
  /** BR-APR-02 — onay açıksa en az bir onaylayıcı zorunlu */
  approverUserIds: UserId[];
  approverGroupIds: GroupId[];
  canView: AccessRule;
  canReserve: AccessRule;
}

export type RecurrenceKind = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  kind: RecurrenceKind;
  /** kaç occurrence — seri talebi tek satırda occurrence sayısını belirtir (BR-APR-30) */
  count: number;
}

export interface CalendarEvent {
  id: EventId;
  calendarId: CalendarId;
  title: string;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  organizerId: UserId;
  participantIds: UserId[];
  /** null → odasız etkinlik; BR-APR-06 etkinlik odadan bağımsız oluşur */
  roomId: RoomId | null;
  notes: string;
  recurrence: Recurrence;
}

/** BR-APR-11/12 — Pending aralığı bloke eder ve "Onay bekliyor" olarak görünür */
export type ReservationStatus = 'reserved' | 'pending' | 'rejected' | 'cancelled';

export interface Reservation {
  id: ReservationId;
  eventId: EventId;
  roomId: RoomId;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  status: ReservationStatus;
  requesterId: UserId;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalRequest {
  id: RequestId;
  reservationId: ReservationId;
  eventId: EventId;
  roomId: RoomId;
  requesterId: UserId;
  status: RequestStatus;
  createdAt: string;
  decidedById: UserId | null;
  decidedAt: string | null;
  /** BR-APR-20 — gerekçe opsiyoneldir */
  reason: string | null;
}

/**
 * 19-notifications-spec.md'de tanımlı domain event kodları.
 * ⚠️ Yeni bildirim türü icat edilmez; liste spec ile birebirdir.
 * Prototipte yalnız uygulama içi kayıt tutulur — gerçek e-posta gönderimi yoktur.
 */
export type NotificationKind =
  | 'N-EVT-01' | 'N-EVT-02' | 'N-EVT-03' | 'N-EVT-04' | 'N-EVT-05' | 'N-EVT-06'
  | 'N-SER-01' | 'N-SER-02' | 'N-SER-03'
  | 'N-CAL-01' | 'N-CAL-02'
  | 'N-RES-01' | 'N-RES-02' | 'N-RES-03' | 'N-RES-04' | 'N-RES-05';

export interface AppNotification {
  id: NotificationId;
  kind: NotificationKind;
  recipientId: UserId;
  createdAt: string;
  title: string;
  body: string;
  read: boolean;
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'byRoom';
