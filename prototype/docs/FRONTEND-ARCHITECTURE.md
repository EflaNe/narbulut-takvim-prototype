# FRONTEND-ARCHITECTURE

## 1. Yığın

| Katman | Seçim | Gerekçe |
|---|---|---|
| Derleyici | **Vite 8** | Tek komutla dev/build; sıfır yapılandırma |
| UI | **React 19 + TypeScript (strict)** | Spec'teki durum makinelerini tipleyerek taşımak |
| Stil | **Düz CSS + CSS özel değişkenleri** | Canonical tasarım birebir piksel değerleri kullanıyor. Utility framework (Tarafımızca **kullanılmadı**) bu değerleri en yakın ölçek adımına yuvarlayıp yeni bitirilen tutarlılık geçişini bozardı |
| Durum | **React Context + useReducer** | Ek durum kütüphanesi eklenmedi |
| Test | **Vitest + jsdom** (birim) · **puppeteer-core** (uçtan uca akış) | Framework sayısı minimumda |
| Font | **Poppins, self-hosted woff2** (latin + latin-ext) | Çevrimdışı sunum; Türkçe karakterler latin-ext'te |

Toplam uygulama kodu ≈ 5.700 satır TypeScript/TSX + 11 CSS dosyası.

---

## 2. Dizin düzeni

```
prototype/
├── src/
│   ├── main.tsx                 giriş; tüm CSS burada bir kez içe aktarılır
│   ├── App.tsx                  rota + overlay orkestrasyonu, mobil dallanması
│   │
│   ├── lib/
│   │   ├── domain/              UI'dan bağımsız çekirdek
│   │   │   ├── types.ts         entity tipleri ve ID tipleri
│   │   │   ├── time.ts          ızgara geometrisi, TR tarih/saat biçimleme
│   │   │   ├── rules.ts         İŞ KURALLARI — tek kaynak
│   │   │   ├── scheduling.ts    "Uygun zamanlar" öneri üretimi
│   │   │   └── selectors.ts     türetilmiş okumalar (görünür etkinlikler, yerleşim…)
│   │   ├── state/
│   │   │   ├── demoData.ts      mock veri — backend'in yerini tutar
│   │   │   ├── types.ts         AppState + AppAction birleşimi
│   │   │   ├── reducer.ts       TÜM durum geçişleri
│   │   │   └── StoreContext.tsx Provider + hook'lar
│   │   └── useMediaQuery.ts
│   │
│   ├── components/
│   │   ├── primitives/          Icon · Button · IconButton · Avatar · Menu · Toast
│   │   ├── overlay/             Drawer · ConfirmDialog
│   │   ├── shell/               NavRail · DateHero · MiniMonth · CalendarList · FiltersCard · Sidebar · DemoPanel
│   │   ├── calendar/            TopBar · WeekGrid · DayGrid · MonthGrid · RoomsGrid · EventBlock · QuickCreatePopover · EmptyGridState · CalendarScreen
│   │   ├── event/               EventDrawer · ReadOnlyEventDrawer · ParticipantRow
│   │   ├── room/                RoomPickerDrawer
│   │   ├── requests/            RequestsScreen · RoomTimeline
│   │   ├── sharing/             ShareDrawer
│   │   ├── admin/               RoomsScreen · RoomsSidebar · PermissionsScreen
│   │   └── mobile/              MobileApp · MobileCalendarsSheet · MobileEventSheet
│   │
│   ├── styles/                  tokens · base · primitives · overlay · shell · calendar · drawer · admin · requests · mobile · fonts
│   └── test/                    rules.test.ts · reducer.test.ts
│
├── emails/                      e-posta tasarım sistemi (FAZ 8)
├── scripts/                     demo-flow.mjs · screenshots.mjs
└── docs/                        bu dosyalar
```

---

## 3. Durum modeli

Tek merkezî store. Bileşenler **hiçbir iş kuralını yeniden uygulamaz** — okurlar, aksiyon
gönderirler.

```
StoreProvider (Context + useReducer)
        │
        ├── AppState
        │     ├── domain verisi   users · groups · buildings · calendars · shares
        │     │                   rooms · events · reservations · requests · notifications
        │     ├── oturum          currentUserId · today · nowMinutes
        │     ├── ui              route · anchorDate · viewMode · hiddenCalendarIds
        │     │                   draft · quickCreate · roomPickerOpen · shareCalendarId
        │     │                   selectedRequestId · confirm · toast · mobileSheet …
        │     └── seq             ID üreteci (deterministik, Math.random yok)
        │
        └── dispatch(AppAction)   ~45 ayrık aksiyon tipi
```

### Neden ayrı `draft`?
Etkinlik formu doğrudan `events` dizisini düzenlemez. `ui.draft` bir taslaktır; `saveEvent`
aksiyonu **etkinlik + rezervasyon + onay talebini tek atomik geçişte** günceller. Bu, gerçek
backend'de tek bir `POST /events` çağrısına karşılık gelir.

### `saveEvent` geçişi
```
saveEvent
 ├─ engelleyici doğrulama
 │    ├─ başlık boş mu
 │    ├─ bitiş > başlangıç mı
 │    ├─ oda çakışması (roomAvailability ≠ available)          → BR-RB-21
 │    └─ eligible approver var mı (onay gerekli odada)          → BR-APR-17b
 ├─ etkinliği ekle/güncelle
 ├─ oda değiştiyse
 │    ├─ eski rezervasyon + bekleyen talep → cancelled          → BR-APR-33
 │    └─ yeni rezervasyon: onay gerekli mi?
 │         ├─ evet → status=pending + ApprovalRequest üret      → BR-APR-06
 │         └─ hayır → status=reserved
 ├─ yalnız saat değiştiyse → bekleyen talep yeni aralığı bloke  → BR-APR-34
 └─ geri bildirim: bekleyen varsa "Talebiniz gönderildi, onay bekliyor" (başarı dili yok, BR-APR-07)
```

### Kalıcılık
**Yoktur, bilinçli olarak.** `localStorage` kullanılmadı: bozuk bir demo durumu sunumun
ortasında kalıcı hâle gelirdi. Sayfa yenileme = temiz başlangıç. Geliştirici tarafında
`resetDemo` aksiyonu vardır ve yalnız gizli demo panelinden (Shift+D) erişilir.

---

## 4. İş kuralları nerede yaşıyor

`src/lib/domain/rules.ts` tek kaynaktır. Her dışa açık fonksiyonun üstünde ilgili BR kodu yazar.

| Alan | Fonksiyon | Spec |
|---|---|---|
| Toplamsal yetki (deny yok) | `ruleGrants` · `canViewRoom` · `canReserveRoom` | BR-PRM-05/06/09 |
| Rezerve → Görebilir ima eder | `completeViewFromReserve` | BR-PRM-04 · IR-PRM-03 |
| Boş erişim kuralı geçersiz | `isAccessRuleValid` | BR-PRM-14 |
| Oda müsaitliği | `roomAvailability` | BR-APR-11/12 |
| Seçilebilirlik matrisi | `roomSelectability` | 16-room-booking §4.1 |
| Eligible approver | `eligibleApprovers` · `canCreatePendingRequest` | BR-APR-17b/17d |
| Self-approval yasağı | `canDecideRequest` | BR-APR-17a |
| Kuyruk görünürlüğü | `visibleRequests` | BR-APR-25 |
| Paylaşım salt okunur | `canEditEvent` | BR-CAL-27 |
| Paylaşım hedefi doğrulaması | `shareTargetState` | BR-CAL-25/35/36 |
| Non-blocking sinyaller | `participantConflicts` · `capacityWarning` · `outsideWorkingHours` · `isPastDate` | PC-08, 15-event-spec |

**Engelleyici / engellemeyen ayrımı kodda da görünür:** engelleyici doğrulamalar `reducer`
içinde geçişi durdurur; engellemeyenler yalnız görünüm katmanında uyarı üretir ve Kaydet'i
kapatmaz.

---

## 5. Izgara geometrisi

`src/lib/domain/time.ts` içindeki sabitler canonical 01'den ölçülmüştür:

```
HOUR_H        56px      bir saatin yüksekliği
GRID_START_H  08        ilk saat etiketi
GRID_END_H    20        ızgara sonu (12 satır)
WORK_START_H  09        çalışma saatleri başı (üstü soluk bant)
WORK_END_H    18        çalışma saatleri sonu (altı soluk bant)
```

`minutesToY(m) = (m − 8·60)/60 · 56` · `yToMinutes` 30 dakikaya yuvarlar.
Çakışan etkinlikler `layoutDay()` ile kümelenir; her kümede sütunlar hesaplanır ve blok
sütun başına 15px sağa kaydırılıp beyaz halka alır (canonical davranış).

---

## 6. Overlay orkestrasyonu

`App.tsx` tüm overlay'leri tek yerde yönetir; bileşenler kendi portalını açmaz.

```
draft ≠ null            → EventDrawer (680px)
  + roomPickerOpen      → RoomPickerDrawer (640px, right:680) ve EventDrawer %50 beyaz peçe altında
readOnlyEventId ≠ null  → ReadOnlyEventDrawer (520px)
shareCalendarId ≠ null  → ShareDrawer (520px)
confirm ≠ null          → ConfirmDialog
toast ≠ null            → Toast (4,2 sn sonra otomatik kapanır)
```

Mobilde (`max-width: 767px`) takvim rotası `MobileApp`'e düşer; yönetim rotaları aynı
bileşenleri yığılmış CSS ile kullanır.

---

## 7. Mock / backend sınırı

| | Şu an | Backend gelince |
|---|---|---|
| **Veri kaynağı** | `demoData.ts` sabitleri | API yanıtları |
| **Yazma** | `reducer` doğrudan bellekte | `reducer` optimistic update + API çağrısı |
| **Doğrulama** | `rules.ts` istemcide | `rules.ts` istemcide **korunur** (anında geri bildirim) + sunucuda **yeniden uygulanır** |
| **ID üretimi** | `state.seq` sayacı | Sunucu üretir |
| **Bildirim** | `state.notifications` dizisi | Bildirim servisi + e-posta |
| **Saat** | Sabit demo saati | Gerçek saat + kullanıcı saat dilimi |

Sınır bilinçli olarak **reducer'ın kenarındadır**: `demoData.ts` ve `StoreProvider`'ın
başlangıç yüklemesi dışında hiçbir dosya mock olduğunu bilmez. Ayrıntı:
[`BACKEND-HANDOFF.md`](BACKEND-HANDOFF.md).

---

## 8. Erişilebilirlik notları

- Tüm etkileşimli öğeler gerçek `<button>` / `<input>`; tıklanabilir `div` yok
- Etkinlik blokları anlamlı `aria-label` taşır (başlık, saat, oda, onay durumu, paylaşım)
- Görünürlük anahtarları `role="switch"` + `aria-checked`
- Drawer'lar `role="dialog"` + `aria-modal`, **Esc** ile kapanır
- Menüler dışarı tıklama ve **Esc** ile kapanır
- `:focus-visible` marka renginde görünür odak halkası verir
- Renk tek başına anlam taşımaz: onay bekleyen durum ikon + metinle de belirtilir
