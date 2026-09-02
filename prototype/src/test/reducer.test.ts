import { describe, expect, it } from 'vitest';
import { createInitialState, reducer } from '../lib/state/reducer';
import {
  activeReservationForEvent, eventsForDate, isCalendarVisible, myCalendars, mySharedCalendars,
  reservationStatusForEvent, visibleEvents,
} from '../lib/domain/selectors';
import { weekDates, weekdayIndex } from '../lib/domain/time';
import type { Room } from '../lib/domain/types';
import type { AppAction, AppState } from '../lib/state/types';

const run = (state: AppState, ...actions: AppAction[]) =>
  actions.reduce((acc, a) => reducer(acc, a), state);

const base = createInitialState();

describe('etkinlik oluşturma ve güncelleme', () => {
  it('odasız etkinlik oluşturulur ve ızgarada görünür', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'Sunum Provası' } },
      { type: 'saveEvent' });
    const created = s.events.find((e) => e.title === 'Sunum Provası');
    expect(created).toBeDefined();
    expect(eventsForDate(s, '2026-08-28').map((e) => e.title)).toContain('Sunum Provası');
    expect(s.ui.draft).toBeNull();
  });

  it('başlıksız etkinlik kaydedilmez', () => {
    const s = run(base, { type: 'openEventCreate' }, { type: 'saveEvent' });
    expect(s.ui.draft).not.toBeNull();
    expect(s.ui.toast?.tone).toBe('error');
  });

  it('onay gerektirmeyen oda seçilirse rezervasyon doğrudan kesinleşir', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'İstanbul Toplantısı', roomId: 'room_istanbul' } },
      { type: 'saveEvent' });
    const created = s.events.find((e) => e.title === 'İstanbul Toplantısı')!;
    expect(reservationStatusForEvent(s, created.id)).toBe('reserved');
    expect(s.requests.some((r) => r.eventId === created.id)).toBe(false);
  });

  it('N-RES-01: talep, odanın onaylayıcılarına bildirim düşürür', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'Atölye', roomId: 'room_bogazici' } },
      { type: 'saveEvent' });
    // Boğaziçi'nin onaylayıcısı Zeynep; talep eden Deniz kendi talebi için bildirim almaz.
    expect(s.notifications[0].recipientId).toBe('usr_zeynep');
    expect(s.notifications[0].kind).toBe('N-RES-01');
    const denizYeni = s.notifications.length - base.notifications.length;
    expect(s.notifications.filter((n) => n.recipientId === 'usr_deniz').length)
      .toBe(base.notifications.filter((n) => n.recipientId === 'usr_deniz').length);
    expect(denizYeni).toBe(1);
  });

  it('N-EVT-01: davetli iç katılımcılar bilgilendirilir, harici misafir bilgilendirilmez', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 780, end: 840 },
      { type: 'updateDraft', patch: { title: 'Kahve' } },
      { type: 'toggleParticipant', userId: 'usr_selin' },
      { type: 'toggleParticipant', userId: 'usr_guest' },
      { type: 'saveEvent' });
    expect(s.notifications.find((n) => n.recipientId === 'usr_selin')?.kind).toBe('N-EVT-01');
    // Harici misafirin uygulama içi karşılığı yoktur (BR-NOT-03)
    expect(s.notifications.some((n) => n.recipientId === 'usr_guest')).toBe(false);
  });

  it('onay gerektiren oda seçilirse rezervasyon Pending başlar ve talep üretilir', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'Boğaziçi Atölye', roomId: 'room_bogazici' } },
      { type: 'saveEvent' });
    const created = s.events.find((e) => e.title === 'Boğaziçi Atölye')!;
    expect(reservationStatusForEvent(s, created.id)).toBe('pending');
    const req = s.requests.find((r) => r.eventId === created.id)!;
    expect(req.status).toBe('pending');
    // BR-APR-07 — başarı dili kullanılmaz
    expect(s.ui.toast?.message).toBe('Talebiniz gönderildi, onay bekliyor.');
  });

  it('rezerve oda seçilirse kayıt engellenir (blocking)', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'Çakışan', roomId: 'room_topkapi' } },
      { type: 'saveEvent' });
    expect(s.events.some((e) => e.title === 'Çakışan')).toBe(false);
    expect(s.ui.toast?.message).toBe('Topkapı seçtiğiniz saatte dolu.');
  });

  it('odadan çıkılınca bekleyen talep iptal olur, etkinlik kalır', () => {
    const s = run(base,
      { type: 'openEventEdit', eventId: 'evt_kickoff' },
      { type: 'pickRoom', roomId: null },
      { type: 'saveEvent' });
    expect(s.events.some((e) => e.id === 'evt_kickoff')).toBe(true);
    expect(activeReservationForEvent(s, 'evt_kickoff')).toBeUndefined();
    expect(s.requests.find((r) => r.id === 'req_kickoff')!.status).toBe('cancelled');
  });

  it('etkinlik silinince talep silinmez, Cancelled olur', () => {
    const s = run(base, { type: 'deleteEvent', eventId: 'evt_kickoff' });
    expect(s.events.some((e) => e.id === 'evt_kickoff')).toBe(false);
    expect(s.requests.find((r) => r.id === 'req_kickoff')!.status).toBe('cancelled');
  });
});

describe('onay akışı', () => {
  it('onaylayıcı talebi onaylar → rezervasyon kesinleşir', () => {
    const s = run(base, { type: 'approveRequest', requestId: 'req_roadmap' });
    expect(s.requests.find((r) => r.id === 'req_roadmap')!.status).toBe('approved');
    expect(reservationStatusForEvent(s, 'evt_roadmap')).toBe('reserved');
    expect(s.notifications[0].kind).toBe('N-RES-02');
  });

  it('self-approval engellenir: kendi talebi onaylanamaz', () => {
    const s = run(base, { type: 'approveRequest', requestId: 'req_urundemo' });
    expect(s.requests.find((r) => r.id === 'req_urundemo')!.status).toBe('pending');
    expect(s.ui.toast?.tone).toBe('error');
  });

  it('red: slot serbest kalır, etkinlik silinmez, odasız kalır', () => {
    const s = run(base,
      { type: 'rejectRequest', requestId: 'req_roadmap', reason: 'Aynı saatte bakım var.' });
    const req = s.requests.find((r) => r.id === 'req_roadmap')!;
    expect(req.status).toBe('rejected');
    expect(req.reason).toBe('Aynı saatte bakım var.');
    expect(s.events.find((e) => e.id === 'evt_roadmap')!.roomId).toBeNull();
    expect(reservationStatusForEvent(s, 'evt_roadmap')).toBe('none');
  });

  it('red gerekçesi boş bırakılabilir', () => {
    const s = run(base, { type: 'rejectRequest', requestId: 'req_roadmap', reason: '   ' });
    expect(s.requests.find((r) => r.id === 'req_roadmap')!.reason).toBeNull();
  });

  it('talep eden kendi bekleyen talebini geri çekebilir', () => {
    const s = run(base, { type: 'withdrawRequest', requestId: 'req_kickoff' });
    expect(s.requests.find((r) => r.id === 'req_kickoff')!.status).toBe('cancelled');
    expect(s.events.find((e) => e.id === 'evt_kickoff')!.roomId).toBeNull();
  });

  it('başkasının talebi geri çekilemez', () => {
    const s = run(base, { type: 'withdrawRequest', requestId: 'req_roadmap' });
    expect(s.requests.find((r) => r.id === 'req_roadmap')!.status).toBe('pending');
  });
});

describe('takvim görünürlüğü ve paylaşım', () => {
  it('takvim kapatılınca etkinlikleri ızgaradan düşer', () => {
    const before = visibleEvents(base).filter((e) => e.calendarId === 'cal_proje').length;
    expect(before).toBeGreaterThan(0);
    const s = reducer(base, { type: 'toggleCalendar', calendarId: 'cal_proje' });
    expect(isCalendarVisible(s, 'cal_proje')).toBe(false);
    expect(visibleEvents(s).some((e) => e.calendarId === 'cal_proje')).toBe(false);
  });

  it('paylaşılan takvimin görünürlüğü kapatılabilir; paylaşım kaydı silinmez', () => {
    const s = reducer(base, { type: 'toggleSharedVisibility', calendarId: 'cal_urun' });
    expect(isCalendarVisible(s, 'cal_urun')).toBe(false);
    expect(mySharedCalendars(s).some((x) => x.calendar.id === 'cal_urun')).toBe(true);
  });

  it('alıcı paylaşımı kaldırınca takvim listeden çıkar', () => {
    const s = reducer(base, { type: 'removeSharedCalendar', calendarId: 'cal_urun' });
    expect(mySharedCalendars(s).some((x) => x.calendar.id === 'cal_urun')).toBe(false);
    expect(visibleEvents(s).some((e) => e.calendarId === 'cal_urun')).toBe(false);
  });

  it('BR-NOT-22: alıcı kendi kaldırdığında kimseye bildirim gitmez', () => {
    const s = reducer(base, { type: 'removeSharedCalendar', calendarId: 'cal_urun' });
    expect(s.notifications).toHaveLength(base.notifications.length);
  });

  it('sahip paylaşımı kaldırınca alıcı N-CAL-02 alır', () => {
    const s = reducer(base, { type: 'removeShare', calendarId: 'cal_kisisel', userId: 'usr_mert' });
    const n = s.notifications.find((x) => x.recipientId === 'usr_mert');
    expect(n?.kind).toBe('N-CAL-02');
  });

  it('sahip paylaşım ekler ve kaldırır; kaldırma anında etkilidir', () => {
    const added = reducer(base, { type: 'addShare', calendarId: 'cal_proje', userId: 'usr_selin' });
    expect(added.shares.some(
      (x) => x.calendarId === 'cal_proje' && x.granteeId === 'usr_selin')).toBe(true);
    expect(added.notifications[0].kind).toBe('N-CAL-01');

    const removed = reducer(added,
      { type: 'removeShare', calendarId: 'cal_proje', userId: 'usr_selin' });
    expect(removed.shares.some(
      (x) => x.calendarId === 'cal_proje' && x.granteeId === 'usr_selin')).toBe(false);
  });

  it('aynı kullanıcıya ikinci paylaşım kaydı oluşmaz', () => {
    const s = reducer(base, { type: 'addShare', calendarId: 'cal_kisisel', userId: 'usr_mert' });
    expect(s.shares.filter(
      (x) => x.calendarId === 'cal_kisisel' && x.granteeId === 'usr_mert')).toHaveLength(1);
  });
});

describe('gezinme', () => {
  it('hafta ileri/geri ve Bugün çalışır', () => {
    const next = reducer(base, { type: 'shiftView', delta: 1 });
    // Hafta adımı gün konumunu korur: Cuma 28 → Cuma 4 Eylül
    expect(next.ui.anchorDate).toBe('2026-09-04');
    const back = reducer(next, { type: 'goToday' });
    expect(back.ui.anchorDate).toBe('2026-08-28');
  });

  it('hafta adımı seçili günün hafta içindeki konumunu korur', () => {
    const s = run(base, { type: 'shiftView', delta: 1 }, { type: 'shiftView', delta: 1 });
    expect(weekdayIndex(s.ui.anchorDate)).toBe(weekdayIndex(base.ui.anchorDate));
    expect(weekDates(s.ui.anchorDate)[0]).toBe('2026-09-07');
  });

  it('BR-SHELL-03: adım aktif görünüm moduna göre değişir', () => {
    const day = run(base, { type: 'setViewMode', mode: 'day' }, { type: 'shiftView', delta: 1 });
    expect(day.ui.anchorDate).toBe('2026-08-29');

    const month = run(base, { type: 'setViewMode', mode: 'month' }, { type: 'shiftView', delta: 1 });
    expect(month.ui.anchorDate).toBe('2026-09-28');

    const byRoom = run(base, { type: 'setViewMode', mode: 'byRoom' }, { type: 'shiftView', delta: -1 });
    expect(byRoom.ui.anchorDate).toBe('2026-08-27');
  });

  it('ay kaydırması ayın son gününü aşmaz', () => {
    const s = run(base,
      { type: 'setAnchorDate', date: '2026-01-31' },
      { type: 'setViewMode', mode: 'month' },
      { type: 'shiftView', delta: 1 });
    expect(s.ui.anchorDate).toBe('2026-02-28');
  });

  it('hızlı oluşturma detaylı forma taşınır ve başlık korunur', () => {
    const s = run(base,
      { type: 'openQuickCreate', date: '2026-08-28', start: 660, end: 720, x: 10, y: 10 },
      { type: 'updateQuickCreate', title: 'Kahve' },
      { type: 'quickCreateExpand' });
    expect(s.ui.quickCreate).toBeNull();
    expect(s.ui.draft?.title).toBe('Kahve');
    expect(s.ui.draft?.start).toBe(660);
  });
});

describe('oda ekseni — sol rail filtresi', () => {
  it('oda kapatılınca o odadaki etkinlikler ızgaradan düşer', () => {
    const before = visibleEvents(base).filter((e) => e.roomId === 'room_topkapi').length;
    expect(before).toBeGreaterThan(0);
    const s = reducer(base, { type: 'toggleRoomFilter', roomId: 'room_topkapi' });
    expect(visibleEvents(s).some((e) => e.roomId === 'room_topkapi')).toBe(false);
  });

  it('odasız etkinlikler oda ekseninden etkilenmez', () => {
    const s = run(base,
      { type: 'setAllRoomFilters', on: false });
    const roomless = visibleEvents(s).filter((e) => e.roomId === null);
    expect(roomless.length).toBeGreaterThan(0);
    expect(visibleEvents(s).every((e) => e.roomId === null)).toBe(true);
  });

  it('“Tümünü göster” tüm odaları geri açar', () => {
    const s = run(base,
      { type: 'toggleRoomFilter', roomId: 'room_topkapi' },
      { type: 'toggleRoomFilter', roomId: 'room_istanbul' },
      { type: 'setAllRoomFilters', on: true });
    expect(s.ui.hiddenRoomIds).toHaveLength(0);
  });
});

describe('takvim CRUD — 12-calendars-spec §2', () => {
  it('yeni takvim oluşturulur ve oluşturana ait olur', () => {
    const s = reducer(base, { type: 'createCalendar', name: 'Pazarlama Planı', color: '#0058B8' });
    const cal = s.calendars.find((c) => c.name === 'Pazarlama Planı')!;
    expect(cal.ownerId).toBe('usr_deniz');
    expect(cal.isDefault).toBe(false);
    expect(myCalendars(s)).toContainEqual(cal);
  });

  it('takvim adı ve rengi güncellenir', () => {
    const s = reducer(base, {
      type: 'updateCalendar', calendarId: 'cal_proje', name: 'Proje X', color: '#7A3E9D',
    });
    const cal = s.calendars.find((c) => c.id === 'cal_proje')!;
    expect(cal.name).toBe('Proje X');
    expect(cal.color).toBe('#7A3E9D');
  });

  it('BR-CAL-21: varsayılan takvim silinemez', () => {
    const s = reducer(base, { type: 'deleteCalendar', calendarId: 'cal_kisisel', mode: 'purge' });
    expect(s.calendars.some((c) => c.id === 'cal_kisisel')).toBe(true);
  });

  it('BR-CAL-22: etkinlikler başka takvime taşınabilir', () => {
    const before = base.events.filter((e) => e.calendarId === 'cal_proje').length;
    expect(before).toBeGreaterThan(0);
    const s = reducer(base, {
      type: 'deleteCalendar', calendarId: 'cal_proje', mode: 'move', targetCalendarId: 'cal_ekip',
    });
    expect(s.calendars.some((c) => c.id === 'cal_proje')).toBe(false);
    expect(s.events.filter((e) => e.calendarId === 'cal_proje')).toHaveLength(0);
    expect(s.events.filter((e) => e.calendarId === 'cal_ekip').length).toBeGreaterThan(before);
  });

  it('etkinliklerle birlikte silinince bağlı talepler Cancelled olur', () => {
    const s = reducer(base, { type: 'deleteCalendar', calendarId: 'cal_proje', mode: 'purge' });
    expect(s.events.some((e) => e.calendarId === 'cal_proje')).toBe(false);
    // Kick-off cal_proje'deydi ve bekleyen talebi vardı
    expect(s.requests.find((r) => r.id === 'req_kickoff')!.status).toBe('cancelled');
  });

  it('silinen takvimin paylaşımları düşer ve alıcı bilgilendirilir', () => {
    const shared = run(base, { type: 'addShare', calendarId: 'cal_proje', userId: 'usr_selin' });
    const s = reducer(shared, {
      type: 'deleteCalendar', calendarId: 'cal_proje', mode: 'move', targetCalendarId: 'cal_ekip',
    });
    expect(s.shares.some((x) => x.calendarId === 'cal_proje')).toBe(false);
    expect(s.notifications[0].kind).toBe('N-CAL-02');
  });
});

describe('oda ve bina CRUD — 13-rooms-spec', () => {
  const draft = (): Room => ({
    id: 'room_draft', name: 'Kadıköy', buildingId: 'bld_ana', floor: '4. Kat',
    capacity: 10, features: ['Beyaz tahta'], active: true,
    requiresApproval: false, approverUserIds: [], approverGroupIds: [],
    canView: { allUsers: true, userIds: [], groupIds: [] },
    canReserve: { allUsers: true, userIds: [], groupIds: [] },
  });

  it('yeni oda oluşturulur ve seçili hâle gelir', () => {
    const s = run(base, { type: 'startRoomDraft' }, { type: 'createRoom', room: draft() });
    const room = s.rooms.find((r) => r.name === 'Kadıköy')!;
    expect(room.id).not.toBe('room_draft');
    expect(s.ui.selectedRoomId).toBe(room.id);
    expect(s.ui.creatingRoom).toBe(false);
  });

  it('BR-ROOM-31: rezervasyon kaydı olan oda silinemez', () => {
    const s = reducer(base, { type: 'deleteRoom', roomId: 'room_topkapi' });
    expect(s.rooms.some((r) => r.id === 'room_topkapi')).toBe(true);
    expect(s.ui.toast?.tone).toBe('error');
  });

  it('rezervasyonu olmayan oda silinebilir', () => {
    const created = run(base, { type: 'createRoom', room: draft() });
    const room = created.rooms.find((r) => r.name === 'Kadıköy')!;
    const s = reducer(created, { type: 'deleteRoom', roomId: room.id });
    expect(s.rooms.some((r) => r.id === room.id)).toBe(false);
  });

  it('BR-ROOM-30: bina oda formundan oluşturulur, aynı ad iki kez eklenmez', () => {
    const s = run(base,
      { type: 'createBuilding', name: 'Teknopark' },
      { type: 'createBuilding', name: 'Teknopark' });
    expect(s.buildings.filter((b) => b.name === 'Teknopark')).toHaveLength(1);
  });
});

describe('rakip talepler — D-070', () => {
  const first = run(base,
    { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
    { type: 'updateDraft', patch: { title: 'A toplantısı', roomId: 'room_bogazici' } },
    { type: 'saveEvent' });

  const slotReq = (st: AppState, title: string) => {
    const ev = st.events.find((e) => e.title === title)!;
    return st.requests.find((q) => q.eventId === ev.id && q.status === 'pending')!;
  };

  /** ⚠️ Yalnız status'e bakmak yetmez: demo verisinde onlarca 'reserved' kayıt var. */
  const rezOf = (st: AppState, title: string) => {
    const ev = st.events.find((e) => e.title === title)!;
    return st.reservations.find((r) => r.eventId === ev.id && r.status === 'reserved')!;
  };

  const ikinci = (st: AppState) => run(st,
    { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
    { type: 'updateDraft', patch: { title: 'B toplantısı', roomId: 'room_bogazici' } },
    { type: 'saveEvent' });

  it('aynı slota ikinci talep OLUŞABİLİR', () => {
    const s2 = ikinci(first);
    expect(s2.events.some((e) => e.title === 'B toplantısı')).toBe(true);
    expect(s2.reservations.filter((r) => r.roomId === 'room_bogazici'
      && r.date === '2026-08-28' && r.start === 660 && r.status === 'pending')).toHaveLength(2);
  });

  it('birini onaylamak diğerini OTOMATİK REDDETMEZ', () => {
    const s2 = ikinci(first);
    const s3 = run(s2,
      { type: 'setPersona', userId: 'usr_zeynep' },
      { type: 'approveRequest', requestId: slotReq(s2, 'A toplantısı').id });
    expect(s3.requests.find((r) => r.id === slotReq(s2, 'A toplantısı').id)!.status).toBe('approved');
    expect(s3.requests.find((r) => r.id === slotReq(s2, 'B toplantısı').id)!.status).toBe('pending');
  });

  it('BR-APR-13a: rezerve slotta ikinci onay ENGELLENİR, sebebi yazılır', () => {
    const s2 = ikinci(first);
    const s3 = run(s2,
      { type: 'setPersona', userId: 'usr_zeynep' },
      { type: 'approveRequest', requestId: slotReq(s2, 'A toplantısı').id },
      { type: 'approveRequest', requestId: slotReq(s2, 'B toplantısı').id });
    expect(s3.requests.find((r) => r.id === slotReq(s2, 'B toplantısı').id)!.status).toBe('pending');
    expect(s3.ui.toast?.tone).toBe('error');
    expect(s3.ui.toast?.message).toContain('bu saatte rezerve');
  });

  it('önceki rezervasyon kalkınca ikinci talep onaylanabilir', () => {
    const s2 = ikinci(first);
    const zeynep = run(s2, { type: 'setPersona', userId: 'usr_zeynep' });
    const s3 = reducer(zeynep, { type: 'approveRequest', requestId: slotReq(s2, 'A toplantısı').id });
    // A etkinliği silinince rezervasyon düşer
    const s4 = run(s3,
      { type: 'deleteEvent', eventId: s2.events.find((e) => e.title === 'A toplantısı')!.id },
      { type: 'approveRequest', requestId: slotReq(s2, 'B toplantısı').id });
    expect(s4.requests.find((r) => r.id === slotReq(s2, 'B toplantısı').id)!.status).toBe('approved');
  });

  it('D-071: oda sorumlusu rezervasyonu kaldırır — etkinlik durur, sahibi bilgilenir', () => {
    const zeynep = run(first, { type: 'setPersona', userId: 'usr_zeynep' });
    const onayli = reducer(zeynep,
      { type: 'approveRequest', requestId: slotReq(first, 'A toplantısı').id });
    const rez = rezOf(onayli, 'A toplantısı');

    const s = reducer(onayli,
      { type: 'cancelReservation', reservationId: rez.id, reason: 'Bakım planlandı' });

    // rezervasyon düşer, gerekçe ve kaldıran saklanır
    const after = s.reservations.find((r) => r.id === rez.id)!;
    expect(after.status).toBe('cancelled');
    expect(after.cancelReason).toBe('Bakım planlandı');
    expect(after.cancelledById).toBe('usr_zeynep');

    // ⚠️ BR-APR-22 — talep kaydı GERİ ALINMAZ, 'approved' kalır
    expect(s.requests.find((r) => r.id === slotReq(first, 'A toplantısı').id)!.status)
      .toBe('approved');

    // etkinlik silinmez, odasız kalır
    const ev = s.events.find((e) => e.title === 'A toplantısı')!;
    expect(ev).toBeDefined();
    expect(ev.roomId).toBeNull();

    // sahibine N-RES-06 gider, gerekçeyle
    const n = s.notifications.find((x) => x.kind === 'N-RES-06')!;
    expect(n.recipientId).toBe(rez.requesterId);
    expect(n.body).toContain('Bakım planlandı');
  });

  it('D-071: gerekçesiz kaldırma reddedilir', () => {
    const zeynep = run(first, { type: 'setPersona', userId: 'usr_zeynep' });
    const onayli = reducer(zeynep,
      { type: 'approveRequest', requestId: slotReq(first, 'A toplantısı').id });
    const rez = rezOf(onayli, 'A toplantısı');
    const s = reducer(onayli, { type: 'cancelReservation', reservationId: rez.id, reason: '  ' });
    expect(s.reservations.find((r) => r.id === rez.id)!.status).toBe('reserved');
    expect(s.ui.toast?.tone).toBe('error');
  });

  it('D-071: oda sorumlusu OLMAYAN kaldıramaz', () => {
    const zeynep = run(first, { type: 'setPersona', userId: 'usr_zeynep' });
    const onayli = reducer(zeynep,
      { type: 'approveRequest', requestId: slotReq(first, 'A toplantısı').id });
    const rez = rezOf(onayli, 'A toplantısı');
    const s = run(onayli,
      { type: 'setPersona', userId: 'usr_deniz' },
      { type: 'cancelReservation', reservationId: rez.id, reason: 'olmaz' });
    expect(s.reservations.find((r) => r.id === rez.id)!.status).toBe('reserved');
    expect(s.ui.toast?.tone).toBe('error');
  });

  it('D-071: kaldırma sonrası bekleyen rakip talep onaylanabilir', () => {
    const s2 = ikinci(first);
    const zeynep = run(s2, { type: 'setPersona', userId: 'usr_zeynep' });
    const onayli = reducer(zeynep,
      { type: 'approveRequest', requestId: slotReq(s2, 'A toplantısı').id });
    const rez = rezOf(onayli, 'A toplantısı');
    const s = run(onayli,
      { type: 'cancelReservation', reservationId: rez.id, reason: 'Bakım' },
      { type: 'approveRequest', requestId: slotReq(s2, 'B toplantısı').id });
    expect(s.requests.find((r) => r.id === slotReq(s2, 'B toplantısı').id)!.status)
      .toBe('approved');
  });

  it('RED, etkinliği silmez — yalnız odasız bırakır', () => {
    const s3 = run(first,
      { type: 'setPersona', userId: 'usr_zeynep' },
      { type: 'rejectRequest', requestId: slotReq(first, 'A toplantısı').id, reason: '' });
    const a = s3.events.find((e) => e.title === 'A toplantısı')!;
    expect(a).toBeDefined();
    expect(a.roomId).toBeNull();
  });
});
