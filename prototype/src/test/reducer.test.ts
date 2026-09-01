import { describe, expect, it } from 'vitest';
import { createInitialState, reducer } from '../lib/state/reducer';
import {
  activeReservationForEvent, eventsForDate, isCalendarVisible, mySharedCalendars,
  reservationStatusForEvent, visibleEvents,
} from '../lib/domain/selectors';
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

  it('dolu oda seçilirse kayıt engellenir (blocking)', () => {
    const s = run(base,
      { type: 'openEventCreate', date: '2026-08-28', start: 660, end: 720 },
      { type: 'updateDraft', patch: { title: 'Çakışan', roomId: 'room_topkapi' } },
      { type: 'saveEvent' });
    expect(s.events.some((e) => e.title === 'Çakışan')).toBe(false);
    expect(s.ui.toast?.tone).toBe('error');
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
    expect(s.notifications[0].kind).toBe('N-CAL-02');
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
    const next = reducer(base, { type: 'shiftWeek', delta: 1 });
    expect(next.ui.anchorDate).toBe('2026-08-31');
    const back = reducer(next, { type: 'goToday' });
    expect(back.ui.anchorDate).toBe('2026-08-28');
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
