import { describe, expect, it } from 'vitest';
import {
  canApproveNow, canCreatePendingRequest, canDecideRequest, canEditEvent, canReserveRoom,
  canViewRoom, capacityWarning, competingPendingCount,
  completeViewFromReserve, eligibleApprovers, isAccessRuleValid,
  outsideWorkingHours, participantConflicts, roomAvailability, roomSelectability,
  shareTargetState,
} from '../lib/domain/rules';
import { createInitialState } from '../lib/state/reducer';
import type { ApprovalRequest, Room } from '../lib/domain/types';

const s = createInitialState();
const room = (id: string) => s.rooms.find((r) => r.id === id)!;
const DENIZ = 'usr_deniz' as const;

describe('yetki — 10-permissions-spec', () => {
  it('BR-PRM-05: yetki toplamsaldır, grup üzerinden gelen hak yeterlidir', () => {
    // Deniz doğrudan listelenmiyor; Ürün grubu üzerinden rezerve edebiliyor
    expect(canReserveRoom(room('room_bogazici'), DENIZ, s.groups)).toBe(true);
  });

  it('BR-PRM-08: rezerve edemediği oda gizlenmez, görünür kalır', () => {
    expect(canReserveRoom(room('room_galata'), DENIZ, s.groups)).toBe(false);
    expect(canViewRoom(room('room_galata'), DENIZ, s.groups)).toBe(true);
  });

  it('BR-PRM-09: görebilir yoksa oda hiç render edilmez', () => {
    const hidden: Room = {
      ...room('room_galata'),
      canView: { allUsers: false, userIds: [], groupIds: [] },
      canReserve: { allUsers: false, userIds: [], groupIds: [] },
    };
    expect(canViewRoom(hidden, DENIZ, s.groups)).toBe(false);
  });

  it('BR-PRM-04: rezerve edebilme görebilmeyi ima eder; eksik hak otomatik tamamlanır', () => {
    const r: Room = {
      ...room('room_galata'),
      canView: { allUsers: false, userIds: [], groupIds: ['grp_yonetim'] },
      canReserve: { allUsers: false, userIds: ['usr_selin'], groupIds: [] },
    };
    const { room: fixed, changed } = completeViewFromReserve(r);
    expect(changed).toBe(true);
    expect(fixed.canView.userIds).toContain('usr_selin');
    expect(canViewRoom(fixed, 'usr_selin', s.groups)).toBe(true);
  });

  it('BR-PRM-14: boş erişim kuralı geçersizdir', () => {
    expect(isAccessRuleValid({ allUsers: false, userIds: [], groupIds: [] })).toBe(false);
    expect(isAccessRuleValid({ allUsers: true, userIds: [], groupIds: [] })).toBe(true);
  });
});

describe('oda müsaitliği ve seçilebilirlik — 16-room-booking §4.1', () => {
  it('rezerve slot dolu döner ve seçilemez (blocking)', () => {
    // Topkapı Cuma 11:00–12:00 rezerve (Operasyon Haftalık)
    expect(roomAvailability('room_topkapi', '2026-08-28', 660, 720, s.reservations)).toBe('reserved');
    const sel = roomSelectability(
      room('room_topkapi'), DENIZ, s.groups, '2026-08-28', 660, 720, s.reservations);
    expect(sel.selectable).toBe(false);
    expect(sel.reason).toBe('Seçtiğiniz saatte dolu');
  });

  it('D-070: bekleyen talep slotu bloke ETMEZ, bilgi olarak gösterilir', () => {
    // Boğaziçi Cuma 09:30–10:30 pending (Kick-off)
    expect(roomAvailability('room_bogazici', '2026-08-28', 570, 630, s.reservations)).toBe('pending');
    const sel = roomSelectability(
      room('room_bogazici'), DENIZ, s.groups, '2026-08-28', 570, 630, s.reservations);
    expect(sel.selectable).toBe(true);
    expect(sel.reason).toBe('Bu saat için bekleyen başka bir talep var');
  });

  it('rakip bekleyen talep sayısı okunabilir', () => {
    expect(competingPendingCount('room_bogazici', '2026-08-28', 570, 630, s.reservations)).toBe(1);
    expect(competingPendingCount('room_istanbul', '2026-08-28', 570, 630, s.reservations)).toBe(0);
  });

  it('BR-APR-13a: rezerve slotta onay verilemez', () => {
    const rez = s.reservations.find((r) => r.id === 'rsv_urundemo')!; // Topkapı Salı pending
    // Aynı saate kesinleşmiş bir rezervasyon kurgula
    const clash = { ...rez, id: 'rsv_x' as typeof rez.id, status: 'reserved' as const };
    const res = canApproveNow(rez, [...s.reservations, clash]);
    expect(res.ok).toBe(false);
    // Çakışma yoksa onay serbest
    expect(canApproveNow(rez, s.reservations).ok).toBe(true);
  });

  it('yetki sebebi müsaitlik sebebinden önceliklidir', () => {
    const sel = roomSelectability(
      room('room_galata'), DENIZ, s.groups, '2026-08-28', 900, 960, s.reservations);
    expect(sel.visible).toBe(true);
    expect(sel.selectable).toBe(false);
    expect(sel.reason).toBe('Bu odayı rezerve etme yetkiniz yok');
  });

  it('müsait + yetkili oda seçilebilir', () => {
    const sel = roomSelectability(
      room('room_istanbul'), DENIZ, s.groups, '2026-08-28', 660, 720, s.reservations);
    expect(sel.selectable).toBe(true);
    expect(sel.reason).toBeNull();
  });
});

describe('onay — 18-reservation-approval-spec', () => {
  it('BR-APR-17d: eligible approver talebi oluşturanı içermez', () => {
    const approvers = eligibleApprovers(room('room_topkapi'), DENIZ, s.groups);
    expect(approvers).toContain('usr_ahmet');
    expect(approvers).not.toContain(DENIZ);
  });

  it('BR-APR-17b: başka eligible approver yoksa Pending talep oluşturulamaz', () => {
    const solo: Room = { ...room('room_topkapi'), approverUserIds: [DENIZ], approverGroupIds: [] };
    const res = canCreatePendingRequest(solo, DENIZ, s.groups);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.message).toBe('Bu rezervasyonu onaylayabilecek başka bir kullanıcı bulunmuyor.');
    }
  });

  it('BR-APR-02: onay açık ve onaylayıcı boşken yapılandırma geçersizdir', () => {
    const broken: Room = { ...room('room_topkapi'), approverUserIds: [], approverGroupIds: [] };
    expect(canCreatePendingRequest(broken, 'usr_mert', s.groups).ok).toBe(false);
  });

  it('BR-APR-17a: kullanıcı kendi talebini onaylayamaz', () => {
    const own = s.requests.find((r) => r.id === 'req_urundemo')!;
    expect(own.requesterId).toBe(DENIZ);
    expect(canDecideRequest(own, room('room_topkapi'), DENIZ, s.groups)).toBe(false);
  });

  it('başkasının talebini, o odanın onaylayıcısı karara bağlayabilir', () => {
    const other = s.requests.find((r) => r.id === 'req_roadmap')!;
    expect(other.requesterId).toBe('usr_mert');
    expect(canDecideRequest(other, room('room_topkapi'), DENIZ, s.groups)).toBe(true);
  });

  it('karara bağlanmış talep yeniden karara bağlanamaz', () => {
    const decided: ApprovalRequest = {
      ...s.requests.find((r) => r.id === 'req_roadmap')!, status: 'approved',
    };
    expect(canDecideRequest(decided, room('room_topkapi'), DENIZ, s.groups)).toBe(false);
  });
});

describe('non-blocking sinyaller', () => {
  it('katılımcı çakışması uyarır, engellemez', () => {
    // Ayşe Cuma 11:00–12:00 meşgul
    const conflicts = participantConflicts(
      ['usr_ayse'], '2026-08-28', 660, 720, s.events);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].userId).toBe('usr_ayse');
  });

  it('kapasite aşımı uyarı üretir', () => {
    expect(capacityWarning(room('room_bogazici'), 9)).toContain('Boğaziçi');
    expect(capacityWarning(room('room_topkapi'), 9)).toBeNull();
  });

  it('çalışma saatleri dışı tespit edilir', () => {
    expect(outsideWorkingHours(8 * 60, 8 * 60 + 30)).toBe(true);
    expect(outsideWorkingHours(10 * 60, 11 * 60)).toBe(false);
  });
});

describe('takvim paylaşımı — 12-calendars-spec', () => {
  it('BR-CAL-27: paylaşılan takvimin etkinliği düzenlenemez', () => {
    const shared = s.events.find((e) => e.id === 'evt_urundemo2')!;
    expect(canEditEvent(shared, s.calendars, DENIZ)).toBe(false);
    const own = s.events.find((e) => e.id === 'evt_kickoff')!;
    expect(canEditEvent(own, s.calendars, DENIZ)).toBe(true);
  });

  it('BR-CAL-36: sahip takvimi kendisiyle paylaşamaz', () => {
    const cal = s.calendars.find((c) => c.id === 'cal_kisisel')!;
    const owner = s.users.find((u) => u.id === DENIZ)!;
    expect(shareTargetState(cal, owner, s.shares, 'narbulut')).toBe('self');
  });

  it('BR-CAL-35: aynı takvim + alıcı iki kez paylaşılamaz', () => {
    const cal = s.calendars.find((c) => c.id === 'cal_kisisel')!;
    const mert = s.users.find((u) => u.id === 'usr_mert')!;
    expect(shareTargetState(cal, mert, s.shares, 'narbulut')).toBe('already');
  });

  it('BR-CAL-25: organizasyon dışı kullanıcı hedef olamaz', () => {
    const cal = s.calendars.find((c) => c.id === 'cal_kisisel')!;
    const guest = s.users.find((u) => u.id === 'usr_guest')!;
    expect(shareTargetState(cal, guest, s.shares, 'narbulut')).toBe('external');
  });
});
