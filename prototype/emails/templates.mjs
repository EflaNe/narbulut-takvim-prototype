/**
 * 19-notifications-spec.md'de TANIMLI olayların e-posta şablonları.
 * ⚠️ Yeni bildirim olayı icat edilmez. Her şablon spec'in "Taşımak zorunda"
 * sütunundaki alanları eksiksiz taşır.
 *
 * Görsel dil ürünün kendi diliyle aynı: takvim yaprağı tarih bloğu ve
 * ızgaradaki etkinlik chip'inin e-posta karşılığı olan renk şeritli kart.
 */
import { T, CAL_COLORS } from './tokens.mjs';
import { button, eventCard, factTable, notice, renderEmail } from './layout.mjs';

/* Örnek veri — prototype/src/lib/state/demoData.ts ile hizalı. */
const D = {
  event: 'Ürün Demo',
  calendar: 'Ekip',
  date: 'Salı, 25 Ağustos 2026',
  time: '10:00 – 11:30',
  room: 'Topkapı',
  roomMeta: '20 kişilik · Ana Bina, Zemin',
  organizer: 'Deniz Aydın',
  requester: 'Mert Kaya',
  approver: 'Ahmet Yıldız',
  owner: 'Mert Kaya',
  sharedCalendar: 'Ürün',
  guest: 'guest@partner.com',
};

const SAL = { dow: 'SAL', day: '25', month: 'AĞUSTOS' };
const PER = { dow: 'PER', day: '27', month: 'AĞUSTOS' };
const PZT = { dow: 'PZT', day: '31', month: 'AĞUSTOS' };
const PAZ = { dow: 'PAZ', day: '07', month: 'EYLÜL' };

const strong = (s) => `<strong style="font-weight:500;color:${T.textPrimary}">${s}</strong>`;
const muted = (s) => `<span style="color:${T.textTertiary}">${s}</span>`;
const strike = (s) => `<span style="color:${T.textMuted};text-decoration:line-through">${s}</span>`;

/* ─────────────────────────── Etkinlik olayları ─────────────────────────── */

const N_EVT_01 = {
  code: 'N-EVT-01',
  group: 'Etkinlik',
  name: 'Etkinliğe davet edildin',
  recipient: 'Katılımcılar (iç + harici)',
  emailRequired: 'Harici katılımcı varsa zorunlu',
  subject: `Davet: ${D.event} · ${D.date}`,
  render: () => renderEmail({
    subject: `Davet: ${D.event} · ${D.date}`,
    preview: `${D.date}, ${D.time} · ${D.room}`,
    accent: CAL_COLORS.ekip,
    date: SAL,
    eyebrow: 'Etkinlik daveti',
    heading: D.event,
    lead: `${strong(D.organizer)} sizi bu etkinliğe davet etti.`,
    body: `${eventCard({
      accent: CAL_COLORS.ekip, time: D.time, right: D.room,
      lines: [
        `${muted(D.roomMeta)}`,
        `${D.calendar} takvimi ${muted('·')} Organizatör ${D.organizer}`,
        `Katılımınız ${strong('zorunlu')} olarak işaretlendi`,
      ],
    })}`,
    actions: button('Etkinliği aç'),
    footNote: 'Katılım durumunuzu etkinlik sayfasından bildirebilirsiniz.',
  }),
};

const N_EVT_02 = {
  code: 'N-EVT-02',
  group: 'Etkinlik',
  name: 'Etkinlik güncellendi',
  recipient: 'Yalnızca değişiklikten etkilenen katılımcılar',
  emailRequired: 'Harici varsa zorunlu',
  subject: `Güncellendi: ${D.event} · yeni saat ${D.time}`,
  render: () => renderEmail({
    subject: `Güncellendi: ${D.event} · yeni saat ${D.time}`,
    preview: `Saat değişti — ${D.date}, ${D.time}`,
    accent: CAL_COLORS.ekip,
    date: SAL,
    eyebrow: 'Saat değişti',
    heading: D.event,
    lead: 'Bu etkinlikte sizi ilgilendiren bir değişiklik oldu.',
    body: `${eventCard({
      accent: CAL_COLORS.ekip, time: D.time, right: D.room,
      lines: [
        `Önceki saat ${strike('09:00 – 10:30')}`,
        `${muted(`Oda değişmedi · ${D.roomMeta}`)}`,
      ],
    })}${notice('Diğer alanlar değişmedi. Bu bildirimi, değişiklik sizi etkilediği için aldınız.')}`,
    actions: button('Etkinliği aç'),
  }),
};

const N_EVT_03 = {
  code: 'N-EVT-03',
  group: 'Etkinlik',
  name: 'Etkinlik iptal edildi / silindi',
  recipient: 'Tüm katılımcılar',
  emailRequired: 'Harici varsa zorunlu',
  subject: `İptal edildi: ${D.event} · ${D.date}`,
  render: () => renderEmail({
    subject: `İptal edildi: ${D.event} · ${D.date}`,
    preview: `${D.date}, ${D.time} artık takviminizde değil`,
    accent: T.error,
    date: SAL,
    eyebrow: 'Etkinlik iptal edildi',
    heading: D.event,
    lead: `${strong(D.organizer)} bu etkinliği iptal etti. Takviminizden kaldırıldı.`,
    body: `${eventCard({
      accent: T.error, time: strikePlain(D.time), right: D.room,
      lines: [
        `${muted(D.date)}`,
        `${D.room} rezervasyonu da serbest bırakıldı`,
      ],
    })}`,
  }),
};

/** eventCard şerit metni HTML kaçırmadığı için düz metin varyantı. */
function strikePlain(s) { return `${s}  ·  iptal`; }

const N_EVT_04 = {
  code: 'N-EVT-04',
  group: 'Etkinlik',
  name: 'Katılımcı eklendi',
  recipient: 'Yalnızca eklenen katılımcı',
  emailRequired: 'Eklenen harici ise zorunlu',
  subject: `Davet: ${D.event} · ${D.date}`,
  render: () => renderEmail({
    subject: `Davet: ${D.event} · ${D.date}`,
    preview: `${D.organizer} sizi etkinliğe ekledi`,
    accent: CAL_COLORS.ekip,
    date: SAL,
    eyebrow: 'Etkinliğe eklendiniz',
    heading: D.event,
    lead: `${strong(D.organizer)} sizi bu etkinliğe ekledi.`,
    body: `${eventCard({
      accent: CAL_COLORS.ekip, time: D.time, right: D.room,
      lines: [
        `${muted(D.roomMeta)}`,
        `Organizatör ${D.organizer}`,
        `Katılımınız ${strong('opsiyonel')} olarak işaretlendi`,
      ],
    })}`,
    actions: button('Etkinliği aç'),
  }),
};

const N_EVT_05 = {
  code: 'N-EVT-05',
  group: 'Etkinlik',
  name: 'Katılımcı çıkarıldı',
  recipient: 'Yalnızca çıkarılan katılımcı',
  emailRequired: 'Çıkarılan harici ise zorunlu',
  subject: `Davetiniz kaldırıldı: ${D.event}`,
  render: () => renderEmail({
    subject: `Davetiniz kaldırıldı: ${D.event}`,
    preview: `${D.event} artık takviminizde görünmüyor`,
    accent: T.textTertiary,
    date: SAL,
    eyebrow: 'Davet kaldırıldı',
    heading: D.event,
    lead: 'Bu etkinliğin katılımcıları arasından çıkarıldınız; etkinlik artık takviminizde görünmüyor.',
    body: factTable([
      ['Ne zaman', `${D.date}<br />${muted(D.time)}`],
      ['Durum', 'Etkinlik iptal edilmedi; yalnızca sizin davetiniz kaldırıldı'],
    ]),
  }),
};

const N_EVT_06 = {
  code: 'N-EVT-06',
  group: 'Etkinlik',
  name: 'RSVP yanıtı verildi',
  recipient: 'Organizatör',
  emailRequired: 'Hayır',
  subject: `${D.guest} yanıtladı: ${D.event}`,
  render: () => renderEmail({
    subject: `${D.guest} yanıtladı: ${D.event}`,
    preview: `Katılamıyor · ${D.event}`,
    accent: CAL_COLORS.ekip,
    date: SAL,
    eyebrow: 'Katılım yanıtı',
    heading: `${D.guest} katılamıyor`,
    lead: `${strong(D.event)} etkinliğiniz için bir yanıt geldi.`,
    body: `${eventCard({
      accent: CAL_COLORS.ekip, time: D.time, right: D.room,
      lines: [
        `Yanıt ${strong('Katılamıyor')} ${muted('· opsiyonel katılımcı')}`,
        `${muted(D.date)}`,
      ],
    })}`,
    actions: button('Katılımcıları gör', '#', 'secondary'),
  }),
};

/* ──────────────────────────── Seri olayları ──────────────────────────── */

const N_SER_01 = {
  code: 'N-SER-01',
  group: 'Tekrarlayan seri',
  name: 'Seri güncellendi',
  recipient: 'Etkilenen katılımcılar',
  emailRequired: 'Harici varsa zorunlu',
  subject: 'Seri güncellendi: Sprint Planlama · 6 tarih etkilendi',
  render: () => renderEmail({
    subject: 'Seri güncellendi: Sprint Planlama · 6 tarih etkilendi',
    preview: 'Bu ve sonraki tarihler · saat değişti',
    accent: CAL_COLORS.proje,
    date: PZT,
    eyebrow: 'Tekrarlayan seri güncellendi',
    heading: 'Sprint Planlama',
    lead: `${strong(D.organizer)} tekrarlayan bu etkinlikte değişiklik yaptı.`,
    body: `${eventCard({
      accent: CAL_COLORS.proje, time: '10:00 – 11:30', right: 'Her hafta · Pazartesi',
      lines: [
        `Önceki saat ${strike('09:30 – 11:00')}`,
        `İlk etkilenen tarih ${strong('31 Ağustos 2026')} ${muted('· 6 tekrar')}`,
      ],
    })}${factTable([
      ['Uygulanan kapsam', strong('Bu ve sonraki tarihler')],
      ['Geçmiş tarihler', 'Bu değişiklikten etkilenmedi'],
    ])}`,
    actions: button('Seriyi aç'),
  }),
};

const N_SER_02 = {
  code: 'N-SER-02',
  group: 'Tekrarlayan seri',
  name: 'Seri iptal edildi',
  recipient: 'Tüm katılımcılar',
  emailRequired: 'Harici varsa zorunlu',
  subject: 'Seri iptal edildi: Sprint Planlama · 6 tarih',
  render: () => renderEmail({
    subject: 'Seri iptal edildi: Sprint Planlama · 6 tarih',
    preview: '31 Ağustos – 5 Ekim 2026 arası tekrarlar kaldırıldı',
    accent: T.error,
    date: PZT,
    eyebrow: 'Seri iptal edildi',
    heading: 'Sprint Planlama',
    lead: `${strong(D.organizer)} bu tekrarlayan etkinliği iptal etti.`,
    body: factTable([
      ['Uygulanan kapsam', strong('Bu ve sonraki tarihler')],
      ['İptal edilen', `6 tekrar ${muted('· 31 Ağustos 2026 – 5 Ekim 2026')}`],
      ['Önceki tarihler', 'Yerinde kaldı'],
    ]),
  }),
};

const N_SER_03 = {
  code: 'N-SER-03',
  group: 'Tekrarlayan seri',
  name: 'Tek tarih seriden ayrıldı veya iptal edildi',
  recipient: 'Etkilenen katılımcılar',
  emailRequired: 'Harici varsa zorunlu',
  subject: 'Tek tarih değişti: Sprint Planlama · 7 Eylül 2026',
  render: () => renderEmail({
    subject: 'Tek tarih değişti: Sprint Planlama · 7 Eylül 2026',
    preview: 'Yalnızca 7 Eylül tarihi etkilendi',
    accent: CAL_COLORS.proje,
    date: PAZ,
    eyebrow: 'Seriden ayrılan tarih',
    heading: 'Sprint Planlama',
    lead: 'Tekrarlayan bu etkinliğin tek bir tarihi seriden ayrıldı.',
    body: `${eventCard({
      accent: CAL_COLORS.proje, time: '14:00 – 15:30', right: '7 Eylül 2026',
      lines: [
        `Serinin kalan tarihleri ${muted('değişmedi')}`,
        `${muted('Seri: her hafta · Pazartesi')}`,
      ],
    })}`,
    actions: button('Bu tarihi aç'),
  }),
};

/* ───────────────────────── Takvim paylaşımı ───────────────────────── */

const N_CAL_01 = {
  code: 'N-CAL-01',
  group: 'Takvim paylaşımı',
  name: 'Takvim seninle paylaşıldı',
  recipient: 'Paylaşım alıcısı',
  emailRequired: 'Hayır',
  subject: `${D.owner} “${D.sharedCalendar}” takvimini sizinle paylaştı`,
  render: () => renderEmail({
    subject: `${D.owner} “${D.sharedCalendar}” takvimini sizinle paylaştı`,
    preview: 'Etkinlik detaylarını görebilirsiniz · salt okunur',
    accent: CAL_COLORS.urun,
    eyebrow: 'Takvim paylaşımı',
    heading: `${D.sharedCalendar} takvimi sizinle paylaşıldı`,
    lead: `${strong(D.owner)} bu takvimi sizinle paylaştı. Sol menünüzdeki
      “Benimle paylaşılanlar” bölümünde görünür.`,
    body: `${eventCard({
      accent: CAL_COLORS.urun, time: D.sharedCalendar, right: `Sahibi ${D.owner}`,
      lines: [
        `Erişiminiz ${strong('etkinlik detaylarını görebilir')}`,
        `${muted('Düzenleme yok — salt okunur')}`,
      ],
    })}${notice(`Bu takvimdeki ${strong('mevcut ve gelecekteki')} etkinliklerin detaylarını
      görebilirsiniz. Etkinlik oluşturamaz, düzenleyemez veya silemezsiniz.`)}`,
    actions: button('Takvimi aç'),
    footNote: 'Bu takvimi kendi tarafınızdan kaldırabilirsiniz; paylaşımı kabul etmek zorunda değilsiniz.',
  }),
};

const N_CAL_02 = {
  code: 'N-CAL-02',
  group: 'Takvim paylaşımı',
  name: 'Takvim paylaşımı kaldırıldı',
  recipient: 'Eski paylaşım alıcısı',
  emailRequired: 'Hayır',
  subject: `“${D.sharedCalendar}” takvimine erişiminiz sona erdi`,
  render: () => renderEmail({
    subject: `“${D.sharedCalendar}” takvimine erişiminiz sona erdi`,
    preview: `${D.owner} paylaşımı kaldırdı`,
    accent: T.textTertiary,
    eyebrow: 'Takvim paylaşımı kaldırıldı',
    heading: `${D.sharedCalendar} takvimi artık sizinle paylaşılmıyor`,
    lead: `${strong(D.owner)} bu takvimin paylaşımını kaldırdı. Takvim sol menünüzden çıkarıldı.`,
    body: factTable([
      ['Takvim', `${D.sharedCalendar} ${muted(`· sahibi ${D.owner}`)}`],
      ['Erişim durumu', muted('Sona erdi')],
    ]),
    footNote: 'Bu takvime yeniden erişmeniz gerekirse takvim sahibiyle iletişime geçebilirsiniz.',
  }),
};

/* ──────────────────────── Oda rezervasyonu ──────────────────────── */

const N_RES_01 = {
  code: 'N-RES-01',
  group: 'Oda rezervasyonu',
  name: 'Rezervasyon talebi gönderildi',
  recipient: 'Onaylayıcı(lar)',
  emailRequired: 'Hayır',
  subject: `Onayınız bekleniyor: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
  render: () => renderEmail({
    subject: `Onayınız bekleniyor: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
    preview: `${D.requester} ${D.room} için rezervasyon talep etti`,
    accent: T.warning,
    date: PER,
    eyebrow: 'Rezervasyon talebi',
    heading: `${D.room} için onayınız bekleniyor`,
    lead: `${strong(D.requester)} onaylayıcısı olduğunuz bir oda için rezervasyon talep etti.`,
    body: `${eventCard({
      accent: T.warning, time: '14:00 – 15:00', right: D.room,
      title: 'Ürün Roadmap',
      lines: [
        `${muted(D.roomMeta)}`,
        `Talep eden ${D.requester} ${muted('· tek seferlik')}`,
      ],
    })}${notice(`Karar verilene kadar bu saat aralığı diğer kullanıcılara
      ${strong('“Onay bekliyor”')} görünür ve seçilemez.`, 'warning')}`,
    actions: `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:10px">${button('Onayla')}</td>
      <td>${button('Reddet', '#', 'secondary')}</td>
    </tr></table>`,
    footNote: 'Karar tek adımlıdır ve verildikten sonra geri alınamaz.',
  }),
};

const N_RES_02 = {
  code: 'N-RES-02',
  group: 'Oda rezervasyonu',
  name: 'Rezervasyon onaylandı',
  recipient: 'Talep eden',
  emailRequired: 'Hayır',
  subject: `Onaylandı: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
  render: () => renderEmail({
    subject: `Onaylandı: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
    preview: `${D.approver} rezervasyonunuzu onayladı`,
    accent: T.success,
    date: PER,
    eyebrow: 'Rezervasyon onaylandı',
    heading: `${D.room} rezervasyonunuz onaylandı`,
    lead: 'Oda bu saat aralığı için kesinleşti; etkinliğinizde artık rezerve olarak görünüyor.',
    body: `${eventCard({
      accent: T.success, time: '14:00 – 15:00', right: D.room,
      title: 'Ürün Roadmap',
      lines: [
        `${muted(D.roomMeta)}`,
        `Kararı veren ${D.approver}`,
      ],
    })}`,
    actions: button('Etkinliği aç'),
  }),
};

const N_RES_03 = {
  code: 'N-RES-03',
  group: 'Oda rezervasyonu',
  name: 'Rezervasyon reddedildi',
  recipient: 'Talep eden',
  emailRequired: 'Hayır',
  subject: `Reddedildi: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
  render: () => renderEmail({
    subject: `Reddedildi: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
    preview: `${D.approver} talebi reddetti · etkinlik odasız kaldı`,
    accent: T.error,
    date: PER,
    eyebrow: 'Rezervasyon reddedildi',
    heading: `${D.room} talebiniz reddedildi`,
    lead: 'Etkinliğiniz silinmedi; yalnızca odasız kaldı.',
    body: `${eventCard({
      accent: T.error, time: '14:00 – 15:00', right: D.room,
      title: 'Ürün Roadmap',
      lines: [
        `Kararı veren ${D.approver}`,
        `Gerekçe ${muted('·')} ${strong('Aynı saatte planlı bakım var.')}`,
      ],
    })}${notice(`Bu saat aralığı serbest bırakıldı — ${D.room} takvimde tekrar müsait görünüyor.
      Aynı odayı yeniden talep edebilir veya başka bir oda seçebilirsiniz.`)}`,
    actions: button('Başka oda seç'),
  }),
};

const N_RES_04 = {
  code: 'N-RES-04',
  group: 'Oda rezervasyonu',
  name: 'Rezervasyon iptal edildi',
  recipient: 'Karşı taraf (onaylayıcı)',
  emailRequired: 'Hayır',
  subject: `Talep geri çekildi: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
  render: () => renderEmail({
    subject: `Talep geri çekildi: ${D.room} · 27 Ağustos, 14:00 – 15:00`,
    preview: 'Karar vermenize gerek kalmadı',
    accent: T.textTertiary,
    date: PER,
    eyebrow: 'Rezervasyon iptal edildi',
    heading: `${D.room} talebi artık beklemede değil`,
    lead: 'Bu talep için karar vermeniz gerekmiyor; saat aralığı serbest bırakıldı.',
    body: factTable([
      ['Oda', `${D.room} ${muted(`· 14:00 – 15:00`)}`],
      ['Talep eden', D.requester],
      ['İptal sebebi', strong('Talep eden geri çekti')],
    ]),
    footNote: 'Talep kaydı silinmedi; geçmişte erişilebilir kalır.',
  }),
};

const N_RES_05 = {
  code: 'N-RES-05',
  group: 'Oda rezervasyonu',
  name: 'Bekleyen talebin etkinlik zamanı değişti',
  recipient: 'Onaylayıcı',
  emailRequired: 'Hayır',
  subject: `Saat değişti: ${D.room} talebi · yeni saat 15:30 – 16:30`,
  render: () => renderEmail({
    subject: `Saat değişti: ${D.room} talebi · yeni saat 15:30 – 16:30`,
    preview: 'Bekleyen talep yeni saat aralığını bloke ediyor',
    accent: T.warning,
    date: PER,
    eyebrow: 'Bekleyen talep güncellendi',
    heading: `${D.room} talebinin saati değişti`,
    lead: `${strong(D.requester)} etkinliğin saatini değiştirdi. Talep hâlâ onayınızı bekliyor.`,
    body: `${eventCard({
      accent: T.warning, time: '15:30 – 16:30', right: D.room,
      title: 'Ürün Roadmap',
      lines: [
        `Önceki saat ${strike('14:00 – 15:00')}`,
        `Talep eden ${D.requester}`,
      ],
    })}${notice('Yeni aralık için çakışma kontrolü yeniden çalıştı ve aralık bloke edildi.', 'warning')}`,
    actions: `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:10px">${button('Onayla')}</td>
      <td>${button('Reddet', '#', 'secondary')}</td>
    </tr></table>`,
  }),
};

export const TEMPLATES = [
  N_EVT_01, N_EVT_02, N_EVT_03, N_EVT_04, N_EVT_05, N_EVT_06,
  N_SER_01, N_SER_02, N_SER_03,
  N_CAL_01, N_CAL_02,
  N_RES_01, N_RES_02, N_RES_03, N_RES_04, N_RES_05,
];
