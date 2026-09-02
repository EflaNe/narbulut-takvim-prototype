/**
 * Demo (mock) veri kümesi.
 *
 * ⚠️ Bu dosya backend'in yerine geçer. Gerçek API geldiğinde yalnız bu dosya
 * ve `StoreProvider`'ın başlangıç yüklemesi değişir; domain tipleri aynı kalır.
 *
 * Veri, canonical ekranlardaki (01–08) örnek içerikle hizalanmıştır.
 * Sapmalar AUTONOMOUS-STATUS.md → "Fallback kararları" bölümünde kayıtlıdır.
 */
import type {
  AccessRule, AppNotification, ApprovalRequest, Building, Calendar, CalendarEvent, CalendarShare,
  Group, Recurrence, Reservation, Room, User,
} from '../domain/types';

/** Demo saati sabittir — sunum her açılışta aynı ekranı gösterir. */
export const DEMO_TODAY = '2026-08-28';       // Cuma
export const DEMO_NOW_MINUTES = 15 * 60;      // 15:00 — canonical "şimdi" çizgisi
export const ORG_ID = 'narbulut';

const u = (
  id: string, name: string, email: string, title: string, orgId = ORG_ID,
): User => ({
  id: `usr_${id}`,
  name,
  email,
  title,
  initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toLocaleUpperCase('tr-TR'),
  orgId,
});

export const users: User[] = [
  u('deniz', 'Deniz Aydın', 'deniz.aydin@ornek.com', 'Ürün Yöneticisi'),
  u('ayse', 'Ayşe Demir', 'ayse.demir@ornek.com', 'Pazarlama Müdürü'),
  u('mert', 'Mert Kaya', 'mert.kaya@ornek.com', 'Ürün Müdürü'),
  u('zeynep', 'Zeynep Aksoy', 'zeynep.aksoy@ornek.com', 'Tesis Yönetimi'),
  u('ahmet', 'Ahmet Yıldız', 'ahmet.yildiz@ornek.com', 'Operasyon'),
  u('selin', 'Selin Arı', 'selin.ari@ornek.com', 'Tasarım'),
  u('burak', 'Burak Şen', 'burak.sen@ornek.com', 'Yazılım'),
  u('ece', 'Ece Toprak', 'ece.toprak@ornek.com', 'Yazılım'),
  u('kaan', 'Kaan Yılmaz', 'kaan.yilmaz@ornek.com', 'Satış'),
  u('nil', 'Nil Özkan', 'nil.ozkan@ornek.com', 'İnsan Kaynakları'),
  u('emre', 'Emre Doğan', 'emre.dogan@ornek.com', 'Finans'),
  u('pinar', 'Pınar Güneş', 'pinar.gunes@ornek.com', 'Operasyon'),
  u('cem', 'Cem Aslan', 'cem.aslan@ornek.com', 'Yazılım'),
  u('derya', 'Derya Kurt', 'derya.kurt@ornek.com', 'Tasarım'),
  u('okan', 'Okan Bulut', 'okan.bulut@ornek.com', 'Satış'),
  u('sema', 'Sema Yalçın', 'sema.yalcin@ornek.com', 'Destek'),
  u('tolga', 'Tolga Erdem', 'tolga.erdem@ornek.com', 'Yazılım'),
  u('umut', 'Umut Çelik', 'umut.celik@ornek.com', 'Veri'),
  u('vildan', 'Vildan Acar', 'vildan.acar@ornek.com', 'Hukuk'),
  u('yasin', 'Yasin Kara', 'yasin.kara@ornek.com', 'Operasyon'),
  u('zehra', 'Zehra Polat', 'zehra.polat@ornek.com', 'Pazarlama'),
  u('onur', 'Onur Şahin', 'onur.sahin@ornek.com', 'Yazılım'),
  // BR-PRM-18 — harici misafir: organizasyon üyesi değildir
  u('guest', 'Harici Misafir', 'guest@partner.com', 'Harici misafir', 'partner'),
];

export const CURRENT_USER_ID = 'usr_deniz' as const;

export const groups: Group[] = [
  { id: 'grp_urun', name: 'Ürün', memberIds: ['usr_deniz', 'usr_mert', 'usr_selin', 'usr_burak', 'usr_ece'] },
  { id: 'grp_tasarim', name: 'Tasarım', memberIds: ['usr_selin', 'usr_derya'] },
  { id: 'grp_yonetim', name: 'Yönetim', memberIds: ['usr_zeynep', 'usr_ahmet', 'usr_emre', 'usr_kaan', 'usr_nil', 'usr_pinar'] },
  { id: 'grp_operasyon', name: 'Operasyon', memberIds: ['usr_deniz', 'usr_ahmet', 'usr_pinar', 'usr_yasin'] },
  { id: 'grp_pazarlama', name: 'Pazarlama', memberIds: ['usr_ayse', 'usr_kaan', 'usr_zehra'] },
];

export const buildings: Building[] = [
  { id: 'bld_ana', name: 'Ana Bina' },
  { id: 'bld_ek', name: 'Ek Bina' },
];

export const calendars: Calendar[] = [
  { id: 'cal_kisisel', name: 'Kişisel', color: '#6259C9', ownerId: 'usr_deniz', kind: 'personal', isDefault: true },
  { id: 'cal_proje', name: 'Proje', color: '#177066', ownerId: 'usr_deniz', kind: 'project', isDefault: false },
  { id: 'cal_ekip', name: 'Ekip', color: '#A83E69', ownerId: 'usr_deniz', kind: 'team', isDefault: false },
  { id: 'cal_toplanti', name: 'Toplantılar', color: '#E8A33D', ownerId: 'usr_deniz', kind: 'meetings', isDefault: false },
  // Başkalarına ait — Deniz ile paylaşılmış
  { id: 'cal_urun', name: 'Ürün', color: '#2F6B4F', ownerId: 'usr_mert', kind: 'team', isDefault: false },
  { id: 'cal_pazarlama', name: 'Pazarlama', color: '#B4531F', ownerId: 'usr_ayse', kind: 'team', isDefault: false },
  // Diğer kullanıcıların kendi takvimleri — Deniz için yalnız free/busy kaynağı (BR-PRM-11),
  // o kullanıcı olarak girildiğinde kendi takvimi olarak görünür.
  { id: 'cal_ayse_ozel', name: 'Kişisel', color: '#B4531F', ownerId: 'usr_ayse', kind: 'personal', isDefault: true },
  { id: 'cal_ahmet_ozel', name: 'Kişisel', color: '#3B7C8C', ownerId: 'usr_ahmet', kind: 'personal', isDefault: true },
  { id: 'cal_mert_ozel', name: 'Kişisel', color: '#7A3E9D', ownerId: 'usr_mert', kind: 'personal', isDefault: true },
  { id: 'cal_zeynep_ozel', name: 'Kişisel', color: '#177066', ownerId: 'usr_zeynep', kind: 'personal', isDefault: true },
  { id: 'cal_zeynep_tesis', name: 'Tesis', color: '#0058B8', ownerId: 'usr_zeynep', kind: 'team', isDefault: false },
];

/** 08 · Takvim Paylaşımı — Kişisel takvim iki kişiyle paylaşılmış. */
export const shares: CalendarShare[] = [
  { id: 'shr_1', calendarId: 'cal_kisisel', granteeId: 'usr_mert', createdAt: '2026-08-10T09:00:00', visibleForGrantee: true },
  { id: 'shr_2', calendarId: 'cal_kisisel', granteeId: 'usr_ayse', createdAt: '2026-08-12T14:30:00', visibleForGrantee: true },
  // Deniz'e gelen paylaşımlar
  { id: 'shr_3', calendarId: 'cal_urun', granteeId: 'usr_deniz', createdAt: '2026-07-02T10:00:00', visibleForGrantee: true },
  { id: 'shr_4', calendarId: 'cal_pazarlama', granteeId: 'usr_deniz', createdAt: '2026-07-19T11:15:00', visibleForGrantee: false },
];

const ALL = (): AccessRule => ({ allUsers: true, userIds: [], groupIds: [] });

export const rooms: Room[] = [
  {
    id: 'room_istanbul', name: 'İstanbul', buildingId: 'bld_ana', floor: '3. Kat',
    capacity: 12, features: ['Projeksiyon', 'Video konferans'], active: true,
    requiresApproval: false, approverUserIds: [], approverGroupIds: [],
    canView: ALL(), canReserve: ALL(),
  },
  {
    id: 'room_bogazici', name: 'Boğaziçi', buildingId: 'bld_ana', floor: '2. Kat',
    capacity: 6, features: ['Beyaz tahta'], active: true,
    requiresApproval: true, approverUserIds: ['usr_zeynep'], approverGroupIds: [],
    canView: ALL(),
    canReserve: { allUsers: false, userIds: ['usr_zeynep'], groupIds: ['grp_urun', 'grp_tasarim'] },
  },
  {
    id: 'room_topkapi', name: 'Topkapı', buildingId: 'bld_ana', floor: 'Zemin',
    capacity: 20, features: ['Projeksiyon', 'Video konferans', 'Beyaz tahta'], active: true,
    requiresApproval: true, approverUserIds: ['usr_ahmet', 'usr_deniz'], approverGroupIds: [],
    canView: ALL(),
    canReserve: { allUsers: false, userIds: [], groupIds: ['grp_yonetim', 'grp_operasyon'] },
  },
  {
    id: 'room_galata', name: 'Galata', buildingId: 'bld_ek', floor: '1. Kat',
    capacity: 4, features: [], active: true,
    requiresApproval: false, approverUserIds: [], approverGroupIds: [],
    canView: ALL(),
    canReserve: { allUsers: false, userIds: ['usr_zeynep'], groupIds: ['grp_yonetim'] },
  },
];

const NO_REPEAT = (): Recurrence => ({ kind: 'none', count: 1 });

export const events: CalendarEvent[] = [
  /* ── Pazartesi 24 ── */
  {
    id: 'evt_sprint', calendarId: 'cal_proje', title: 'Sprint Planlama',
    date: '2026-08-24', start: 570, end: 660, organizerId: 'usr_deniz',
    participantIds: ['usr_burak', 'usr_ece', 'usr_selin'], roomId: 'room_istanbul',
    notes: 'Sprint 34 kapsam ve kapasite.', recurrence: { kind: 'weekly', count: 8 },
  },
  {
    id: 'evt_tedarikci', calendarId: 'cal_toplanti', title: 'Tedarikçi Görüşmesi',
    date: '2026-08-24', start: 780, end: 840, organizerId: 'usr_deniz',
    participantIds: ['usr_emre', 'usr_kaan'], roomId: 'room_bogazici',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_1on1', calendarId: 'cal_kisisel', title: '1:1 Görüşme',
    date: '2026-08-24', start: 960, end: 990, organizerId: 'usr_deniz',
    participantIds: ['usr_mert'], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },

  /* ── Salı 25 ── */
  {
    id: 'evt_urundemo', calendarId: 'cal_ekip', title: 'Ürün Demo',
    date: '2026-08-25', start: 600, end: 690, organizerId: 'usr_deniz',
    participantIds: [
      'usr_ayse', 'usr_mert', 'usr_guest', 'usr_selin', 'usr_burak', 'usr_ece',
      'usr_kaan', 'usr_nil', 'usr_emre', 'usr_pinar', 'usr_cem', 'usr_derya',
      'usr_okan', 'usr_sema', 'usr_tolga', 'usr_umut', 'usr_vildan', 'usr_yasin',
      'usr_zehra', 'usr_onur', 'usr_ahmet',
    ],
    roomId: 'room_topkapi', notes: 'Çeyreklik ürün demosu.', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_tasarimkritigi', calendarId: 'cal_proje', title: 'Tasarım Kritiği',
    date: '2026-08-25', start: 900, end: 960, organizerId: 'usr_deniz',
    participantIds: ['usr_selin', 'usr_derya'], roomId: 'room_bogazici',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_musteriaramasi', calendarId: 'cal_kisisel', title: 'Müşteri Araması',
    date: '2026-08-25', start: 930, end: 960, organizerId: 'usr_deniz',
    participantIds: [], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },

  /* ── Çarşamba 26 ── */
  {
    id: 'evt_haftalikekip', calendarId: 'cal_ekip', title: 'Haftalık Ekip',
    date: '2026-08-26', start: 540, end: 600, organizerId: 'usr_deniz',
    participantIds: ['usr_burak', 'usr_ece', 'usr_selin', 'usr_mert'], roomId: 'room_istanbul',
    notes: '', recurrence: { kind: 'weekly', count: 12 },
  },
  {
    id: 'evt_urundemo2', calendarId: 'cal_urun', title: 'Ürün Demo',
    date: '2026-08-26', start: 660, end: 720, organizerId: 'usr_mert',
    participantIds: ['usr_selin', 'usr_burak', 'usr_ece'], roomId: 'room_topkapi',
    notes: 'Sprint çıktıları.', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_butcedeger', calendarId: 'cal_proje', title: 'Bütçe Değerlendirme',
    date: '2026-08-26', start: 780, end: 870, organizerId: 'usr_deniz',
    participantIds: ['usr_emre'], roomId: 'room_topkapi', notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_butceon', calendarId: 'cal_toplanti', title: 'Bütçe Ön Görüşme',
    date: '2026-08-26', start: 960, end: 1020, organizerId: 'usr_deniz',
    participantIds: ['usr_emre', 'usr_nil'], roomId: 'room_istanbul',
    notes: '', recurrence: NO_REPEAT(),
  },

  /* ── Perşembe 27 ── */
  {
    id: 'evt_musterisunumu', calendarId: 'cal_ekip', title: 'Müşteri Sunumu',
    date: '2026-08-27', start: 660, end: 750, organizerId: 'usr_deniz',
    participantIds: ['usr_kaan', 'usr_okan', 'usr_mert'], roomId: 'room_topkapi',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_roadmap', calendarId: 'cal_urun', title: 'Ürün Roadmap',
    date: '2026-08-27', start: 840, end: 900, organizerId: 'usr_mert',
    participantIds: ['usr_selin', 'usr_burak'], roomId: 'room_topkapi',
    notes: 'Q4 yol haritası.', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_odaklanma', calendarId: 'cal_kisisel', title: 'Odaklanma Bloğu · Oda yok',
    date: '2026-08-27', start: 960, end: 1080, organizerId: 'usr_deniz',
    participantIds: [], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },

  /* ── Cuma 28 (bugün) ── */
  {
    id: 'evt_kickoff', calendarId: 'cal_proje', title: 'Kick-off',
    date: '2026-08-28', start: 570, end: 630, organizerId: 'usr_deniz',
    participantIds: ['usr_burak', 'usr_ece', 'usr_selin'], roomId: 'room_bogazici',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_tasarimsenkron', calendarId: 'cal_toplanti', title: 'Tasarım Senkronu',
    date: '2026-08-28', start: 780, end: 840, organizerId: 'usr_deniz',
    participantIds: ['usr_selin', 'usr_derya'], roomId: 'room_bogazici',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_retro', calendarId: 'cal_ekip', title: 'Retro',
    date: '2026-08-28', start: 900, end: 960, organizerId: 'usr_deniz',
    participantIds: ['usr_burak', 'usr_ece'], roomId: 'room_galata',
    notes: '', recurrence: NO_REPEAT(),
  },

  /* ── Deniz'in göremediği organizasyon etkinlikleri ──
     Bunlar takvimde render edilmez; yalnız free/busy ve oda doluluğu üretirler. */
  {
    id: 'evt_ops_haftalik', calendarId: 'cal_ahmet_ozel', title: 'Operasyon Haftalık',
    date: '2026-08-28', start: 660, end: 720, organizerId: 'usr_ahmet',
    participantIds: ['usr_pinar', 'usr_yasin'], roomId: 'room_topkapi',
    notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_ayse_busy_fri', calendarId: 'cal_ayse_ozel', title: 'Kampanya Değerlendirme',
    date: '2026-08-28', start: 660, end: 720, organizerId: 'usr_ayse',
    participantIds: ['usr_zehra'], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_ayse_busy_tue', calendarId: 'cal_ayse_ozel', title: 'Ajans Görüşmesi',
    date: '2026-08-25', start: 600, end: 630, organizerId: 'usr_ayse',
    participantIds: [], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_zeynep_tur', calendarId: 'cal_zeynep_tesis', title: 'Kat Turu',
    date: '2026-08-28', start: 540, end: 600, organizerId: 'usr_zeynep',
    participantIds: ['usr_pinar'], roomId: null, notes: '', recurrence: { kind: 'weekly', count: 12 },
  },
  {
    id: 'evt_zeynep_bakim', calendarId: 'cal_zeynep_tesis', title: 'Bakım Planlama',
    date: '2026-08-26', start: 900, end: 990, organizerId: 'usr_zeynep',
    participantIds: ['usr_ahmet'], roomId: 'room_istanbul', notes: '', recurrence: { kind: 'none', count: 1 },
  },
  {
    id: 'evt_zeynep_1on1', calendarId: 'cal_zeynep_ozel', title: 'Ekip 1:1',
    date: '2026-08-27', start: 600, end: 630, organizerId: 'usr_zeynep',
    participantIds: [], roomId: null, notes: '', recurrence: { kind: 'none', count: 1 },
  },
  {
    id: 'evt_eski', calendarId: 'cal_ahmet_ozel', title: 'Bölge Toplantısı',
    date: '2026-08-19', start: 600, end: 720, organizerId: 'usr_kaan',
    participantIds: ['usr_okan'], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },
  {
    id: 'evt_mert_busy', calendarId: 'cal_mert_ozel', title: 'Yatırımcı Görüşmesi',
    date: '2026-08-28', start: 900, end: 960, organizerId: 'usr_mert',
    participantIds: [], roomId: null, notes: '', recurrence: NO_REPEAT(),
  },
];

export const reservations: Reservation[] = [
  { id: 'rsv_sprint', eventId: 'evt_sprint', roomId: 'room_istanbul', date: '2026-08-24', start: 570, end: 660, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_tedarikci', eventId: 'evt_tedarikci', roomId: 'room_bogazici', date: '2026-08-24', start: 780, end: 840, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_urundemo', eventId: 'evt_urundemo', roomId: 'room_topkapi', date: '2026-08-25', start: 600, end: 690, status: 'pending', requesterId: 'usr_deniz' },
  { id: 'rsv_tasarimkritigi', eventId: 'evt_tasarimkritigi', roomId: 'room_bogazici', date: '2026-08-25', start: 900, end: 960, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_haftalikekip', eventId: 'evt_haftalikekip', roomId: 'room_istanbul', date: '2026-08-26', start: 540, end: 600, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_urundemo2', eventId: 'evt_urundemo2', roomId: 'room_topkapi', date: '2026-08-26', start: 660, end: 720, status: 'reserved', requesterId: 'usr_mert' },
  { id: 'rsv_butcedeger', eventId: 'evt_butcedeger', roomId: 'room_topkapi', date: '2026-08-26', start: 780, end: 870, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_butceon', eventId: 'evt_butceon', roomId: 'room_istanbul', date: '2026-08-26', start: 960, end: 1020, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_musterisunumu', eventId: 'evt_musterisunumu', roomId: 'room_topkapi', date: '2026-08-27', start: 660, end: 750, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_roadmap', eventId: 'evt_roadmap', roomId: 'room_topkapi', date: '2026-08-27', start: 840, end: 900, status: 'pending', requesterId: 'usr_mert' },
  { id: 'rsv_kickoff', eventId: 'evt_kickoff', roomId: 'room_bogazici', date: '2026-08-28', start: 570, end: 630, status: 'pending', requesterId: 'usr_deniz' },
  { id: 'rsv_tasarimsenkron', eventId: 'evt_tasarimsenkron', roomId: 'room_bogazici', date: '2026-08-28', start: 780, end: 840, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_retro', eventId: 'evt_retro', roomId: 'room_galata', date: '2026-08-28', start: 900, end: 960, status: 'reserved', requesterId: 'usr_deniz' },
  { id: 'rsv_ops', eventId: 'evt_ops_haftalik', roomId: 'room_topkapi', date: '2026-08-28', start: 660, end: 720, status: 'reserved', requesterId: 'usr_ahmet' },
  { id: 'rsv_eski', eventId: 'evt_eski', roomId: 'room_topkapi', date: '2026-08-19', start: 600, end: 720, status: 'rejected', requesterId: 'usr_kaan' },
  { id: 'rsv_zeynep_bakim', eventId: 'evt_zeynep_bakim', roomId: 'room_istanbul', date: '2026-08-26', start: 900, end: 990, status: 'reserved', requesterId: 'usr_zeynep' },
];

export const requests: ApprovalRequest[] = [
  {
    id: 'req_roadmap', reservationId: 'rsv_roadmap', eventId: 'evt_roadmap',
    roomId: 'room_topkapi', requesterId: 'usr_mert', status: 'pending',
    createdAt: '2026-08-26T09:12:00', decidedById: null, decidedAt: null, reason: null,
  },
  {
    id: 'req_urundemo', reservationId: 'rsv_urundemo', eventId: 'evt_urundemo',
    roomId: 'room_topkapi', requesterId: 'usr_deniz', status: 'pending',
    createdAt: '2026-08-24T16:40:00', decidedById: null, decidedAt: null, reason: null,
  },
  {
    id: 'req_kickoff', reservationId: 'rsv_kickoff', eventId: 'evt_kickoff',
    roomId: 'room_bogazici', requesterId: 'usr_deniz', status: 'pending',
    createdAt: '2026-08-27T11:05:00', decidedById: null, decidedAt: null, reason: null,
  },
  {
    id: 'req_butcedeger', reservationId: 'rsv_butcedeger', eventId: 'evt_butcedeger',
    roomId: 'room_topkapi', requesterId: 'usr_deniz', status: 'approved',
    createdAt: '2026-08-21T10:00:00', decidedById: 'usr_ahmet', decidedAt: '2026-08-21T13:20:00', reason: null,
  },
  {
    id: 'req_eski_red', reservationId: 'rsv_eski', eventId: 'evt_eski',
    roomId: 'room_topkapi', requesterId: 'usr_kaan', status: 'rejected',
    createdAt: '2026-08-19T08:30:00', decidedById: 'usr_deniz', decidedAt: '2026-08-19T09:10:00',
    reason: 'Aynı saatte yönetim toplantısı planlandı.',
  },
];

/**
 * Başlangıç bildirimleri — seed edilmiş paylaşım ve taleplerin karşılığı.
 * ⚠️ Yeni bildirim türü icat edilmez; hepsi `19-notifications-spec.md`'de tanımlıdır.
 */
export const notifications: AppNotification[] = [
  {
    id: 'ntf_seed_1', kind: 'N-RES-01', recipientId: 'usr_ahmet',
    createdAt: '2026-08-26T09:12:00', read: false,
    title: 'Rezervasyon onayınızı bekliyor',
    body: 'Topkapı · 27 Ağustos 14:00 – 15:00 · Ürün Roadmap',
  },
  {
    id: 'ntf_seed_2', kind: 'N-RES-01', recipientId: 'usr_zeynep',
    createdAt: '2026-08-27T11:05:00', read: false,
    title: 'Rezervasyon onayınızı bekliyor',
    body: 'Boğaziçi · 28 Ağustos 09:30 – 10:30 · Kick-off',
  },
  {
    id: 'ntf_seed_3', kind: 'N-CAL-01', recipientId: 'usr_deniz',
    createdAt: '2026-07-02T10:00:00', read: true,
    title: 'Bir takvim sizinle paylaşıldı',
    body: 'Ürün · Mert Kaya · etkinlik detaylarını görebilirsiniz, salt okunur',
  },
];
