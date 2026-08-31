/**
 * 19-notifications-spec.md'de TANIMLI olayların e-posta şablonları.
 * ⚠️ Yeni bildirim olayı icat edilmez. Her şablon spec'in "Taşımak zorunda"
 * sütunundaki alanları eksiksiz taşır.
 */
import { T, CAL_COLORS } from './tokens.mjs';
import { button, factTable, notice, renderEmail } from './layout.mjs';

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

const strong = (s) => `<strong style="font-weight:500;color:${T.textPrimary}">${s}</strong>`;

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
    stripColor: CAL_COLORS.ekip,
    eyebrow: 'Etkinlik daveti',
    heading: D.event,
    lead: `${strong(D.organizer)} sizi bu etkinliğe davet etti.`,
    body: factTable([
      ['Ne zaman', `${D.date}<br />${D.time}`],
      ['Nerede', `${D.room}<br /><span style="color:${T.textTertiary}">${D.roomMeta}</span>`],
      ['Takvim', D.calendar],
      ['Organizatör', D.organizer],
      ['Katılımınız', `${strong('Zorunlu')}`],
    ]),
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
    stripColor: CAL_COLORS.ekip,
    eyebrow: 'Etkinlik güncellendi',
    heading: D.event,
    lead: 'Bu etkinlikte sizi ilgilendiren bir değişiklik oldu.',
    body: `${factTable([
      ['Değişen', 'Saat'],
      ['Önceki', `<span style="color:${T.textTertiary};text-decoration:line-through">Salı, 25 Ağustos 2026 · 09:00 – 10:30</span>`],
      ['Yeni', `${strong(`${D.date} · ${D.time}`)}`],
      ['Nerede', `${D.room} <span style="color:${T.textTertiary}">(değişmedi)</span>`],
    ])}${notice('Diğer alanlar değişmedi. Yalnızca değişiklikten etkilenen katılımcılara gönderildi.')}`,
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
    stripColor: T.error,
    eyebrow: 'Etkinlik iptal edildi',
    heading: D.event,
    lead: `${strong(D.organizer)} bu etkinliği iptal etti. Takviminizden kaldırıldı.`,
    body: `${factTable([
      ['İptal edilen', `${D.date}<br />${D.time}`],
      ['Nerede', D.room],
    ])}${notice(`${D.room} rezervasyonu da serbest bırakıldı.`, 'info')}`,
    footNote: 'Bu tarih için başka bir davetiniz varsa takviminizde görünmeye devam eder.',
  }),
};

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
    stripColor: CAL_COLORS.ekip,
    eyebrow: 'Etkinliğe eklendiniz',
    heading: D.event,
    lead: `${strong(D.organizer)} sizi bu etkinliğe ekledi.`,
    body: factTable([
      ['Ne zaman', `${D.date}<br />${D.time}`],
      ['Nerede', `${D.room}<br /><span style="color:${T.textTertiary}">${D.roomMeta}</span>`],
      ['Organizatör', D.organizer],
      ['Katılımınız', strong('Opsiyonel')],
    ]),
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
    stripColor: T.textTertiary,
    eyebrow: 'Davet kaldırıldı',
    heading: D.event,
    lead: 'Bu etkinliğin katılımcıları arasından çıkarıldınız; etkinlik artık takviminizde görünmüyor.',
    body: factTable([
      ['Etkinlik', D.event],
      ['Ne zaman', `${D.date} · ${D.time}`],
    ]),
    footNote: 'Etkinlik iptal edilmedi; yalnızca sizin davetiniz kaldırıldı.',
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
    stripColor: CAL_COLORS.ekip,
    eyebrow: 'Katılım yanıtı',
    heading: D.event,
    lead: 'Bir katılımcı davetinizi yanıtladı.',
    body: factTable([
      ['Kim', D.guest],
      ['Yanıt', `${strong('Katılamıyor')}`],
      ['Katılım türü', 'Opsiyonel'],
      ['Ne zaman', `${D.date} · ${D.time}`],
    ]),
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
  subject: `Seri güncellendi: Sprint Planlama · 6 tarih etkilendi`,
  render: () => renderEmail({
    subject: 'Seri güncellendi: Sprint Planlama · 6 tarih etkilendi',
    preview: 'Bu ve sonraki tarihler · saat değişti',
    stripColor: CAL_COLORS.proje,
    eyebrow: 'Tekrarlayan seri güncellendi',
    heading: 'Sprint Planlama',
    lead: `${strong(D.organizer)} tekrarlayan bu etkinlikte değişiklik yaptı.`,
    body: `${factTable([
      ['Uygulanan kapsam', strong('Bu ve sonraki tarihler')],
      ['Etkilenen tarih', '6 tekrar'],
      ['Değişen', 'Saat: 09:30 – 11:00 → 10:00 – 11:30'],
      ['İlk etkilenen', '31 Ağustos 2026'],
    ])}${notice('Geçmiş tarihler bu değişiklikten etkilenmedi.')}`,
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
    stripColor: T.error,
    eyebrow: 'Seri iptal edildi',
    heading: 'Sprint Planlama',
    lead: `${strong(D.organizer)} bu tekrarlayan etkinliği iptal etti.`,
    body: factTable([
      ['Uygulanan kapsam', strong('Bu ve sonraki tarihler')],
      ['İptal edilen', '6 tekrar'],
      ['Tarih aralığı', '31 Ağustos 2026 – 5 Ekim 2026'],
    ]),
    footNote: 'Bu aralıktaki tekrarlar takviminizden kaldırıldı; önceki tarihler yerinde kaldı.',
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
    stripColor: CAL_COLORS.proje,
    eyebrow: 'Seriden ayrılan tarih',
    heading: 'Sprint Planlama',
    lead: 'Tekrarlayan bu etkinliğin tek bir tarihi seriden ayrıldı.',
    body: `${factTable([
      ['Etkilenen tarih', strong('7 Eylül 2026')],
      ['Yeni saat', '14:00 – 15:30'],
      ['Seri', 'Her hafta · Pazartesi'],
    ])}${notice('Serinin diğer tarihleri değişmedi.')}`,
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
    stripColor: CAL_COLORS.urun,
    eyebrow: 'Takvim paylaşımı',
    heading: `${D.sharedCalendar} takvimi sizinle paylaşıldı`,
    lead: `${strong(D.owner)} bu takvimi sizinle paylaştı. Takvim sol menünüzdeki
      “Benimle paylaşılanlar” bölümünde görünür.`,
    body: `${factTable([
      ['Takvim', D.sharedCalendar],
      ['Sahibi', D.owner],
      ['Erişiminiz', strong('Etkinlik detaylarını görebilir')],
      ['Düzenleme', `<span style="color:${T.textTertiary}">Yok — salt okunur</span>`],
    ])}${notice(`Bu takvimdeki ${strong('mevcut ve gelecekteki')} etkinliklerin detaylarını görebilirsiniz.
      Etkinlik oluşturamaz, düzenleyemez veya silemezsiniz.`)}`,
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
    stripColor: T.textTertiary,
    eyebrow: 'Takvim paylaşımı kaldırıldı',
    heading: `${D.sharedCalendar} takvimi artık sizinle paylaşılmıyor`,
    lead: `${strong(D.owner)} bu takvimin paylaşımını kaldırdı. Takvim sol menünüzden çıkarıldı.`,
    body: factTable([
      ['Takvim', D.sharedCalendar],
      ['Sahibi', D.owner],
      ['Erişim durumu', `<span style="color:${T.textTertiary}">Sona erdi</span>`],
    ]),
    footNote: 'Takvim sessizce kaybolmadı; bu bildirim erişim değişikliğini açıkça belirtmek içindir.',
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
    stripColor: T.warning,
    eyebrow: 'Rezervasyon talebi',
    heading: `${D.room} için onayınız bekleniyor`,
    lead: `${strong(D.requester)} onaylayıcısı olduğunuz bir oda için rezervasyon talep etti.`,
    body: `${factTable([
      ['Oda', `${D.room}<br /><span style="color:${T.textTertiary}">${D.roomMeta}</span>`],
      ['Ne zaman', 'Perşembe, 27 Ağustos 2026<br />14:00 – 15:00'],
      ['Talep eden', D.requester],
      ['Etkinlik', 'Ürün Roadmap'],
      ['Tekrar', 'Tek seferlik'],
    ])}${notice('Karar verilene kadar bu saat aralığı diğer kullanıcılara “Onay bekliyor” görünür ve seçilemez.', 'warning')}`,
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
    stripColor: T.success,
    eyebrow: 'Rezervasyon onaylandı',
    heading: `${D.room} rezervasyonunuz onaylandı`,
    lead: 'Oda bu saat aralığı için kesinleşti; etkinliğinizde artık rezerve olarak görünüyor.',
    body: factTable([
      ['Oda', `${D.room}<br /><span style="color:${T.textTertiary}">${D.roomMeta}</span>`],
      ['Ne zaman', 'Perşembe, 27 Ağustos 2026<br />14:00 – 15:00'],
      ['Kararı veren', D.approver],
      ['Etkinlik', 'Ürün Roadmap'],
    ]),
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
    stripColor: T.error,
    eyebrow: 'Rezervasyon reddedildi',
    heading: `${D.room} talebiniz reddedildi`,
    lead: 'Etkinliğiniz silinmedi; yalnızca odasız kaldı. Başka bir oda seçebilirsiniz.',
    body: `${factTable([
      ['Oda', D.room],
      ['Ne zaman', 'Perşembe, 27 Ağustos 2026<br />14:00 – 15:00'],
      ['Kararı veren', D.approver],
      ['Gerekçe', `<span style="color:${T.textPrimary}">Aynı saatte planlı bakım var.</span>`],
    ])}${notice(`${D.room} bu saat için tekrar müsait durumda değil; başka bir oda seçmeniz gerekiyor.`, 'error')}`,
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
    stripColor: T.textTertiary,
    eyebrow: 'Rezervasyon iptal edildi',
    heading: `${D.room} talebi artık beklemede değil`,
    lead: 'Bu talep için karar vermeniz gerekmiyor; saat aralığı serbest bırakıldı.',
    body: factTable([
      ['Oda', D.room],
      ['Ne zaman', 'Perşembe, 27 Ağustos 2026<br />14:00 – 15:00'],
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
    stripColor: T.warning,
    eyebrow: 'Bekleyen talep güncellendi',
    heading: `${D.room} talebinin saati değişti`,
    lead: `${strong(D.requester)} etkinliğin saatini değiştirdi. Talep hâlâ onayınızı bekliyor.`,
    body: `${factTable([
      ['Oda', D.room],
      ['Önceki saat', `<span style="color:${T.textTertiary};text-decoration:line-through">27 Ağustos · 14:00 – 15:00</span>`],
      ['Yeni saat', strong('27 Ağustos · 15:30 – 16:30')],
      ['Talep eden', D.requester],
    ])}${notice('Yeni aralık için çakışma kontrolü yeniden çalıştı ve aralık bloke edildi.', 'warning')}`,
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
