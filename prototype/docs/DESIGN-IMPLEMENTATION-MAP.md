# DESIGN-IMPLEMENTATION-MAP

Canonical tasarım: `~/Desktop/Narbulut Calendar - Final Screens.dc.html`
Her canonical ekranın React karşılığı ve bilinçli sapmalar aşağıdadır.

---

## 1. Ekran eşlemesi

### 01 · Ana Takvim — Hafta  *(M3.1 + B3 + Sharing — kilitli)*

| Canonical parça | React |
|---|---|
| Sol rail çerçevesi | `shell/Sidebar.tsx` |
| Takvim / İzinler / Odalar | `shell/NavRail.tsx` |
| Mavi tarih kartı + Bugün + ok | `shell/DateHero.tsx` |
| Mini ay ızgarası | `shell/MiniMonth.tsx` |
| Takvimlerim + Reddedilenler | `shell/CalendarList.tsx › OwnedCalendarList` |
| Benimle paylaşılanlar | `shell/CalendarList.tsx › SharedCalendarList` |
| Odalar filtre ekseni *(canonical'daki “Filtreler” kartının yerine — `14` BR-SHELL-31c)* | `shell/RoomsFilterCard.tsx` |
| Üst çubuk: aralık, oklar, segment, arama, Yeni etkinlik | `calendar/TopBar.tsx` |
| Gün başlıkları + saat cetveli + ızgara | `calendar/WeekGrid.tsx` |
| Etkinlik bloğu (20px şerit + gövde, kompakt varyant) | `calendar/EventBlock.tsx` |
| Çalışma saatleri dışı bantlar, bugün sütunu, hafta sonu sütunu, şimdi çizgisi | `calendar/WeekGrid.tsx` |
| Tüm takvimler kapalı boş durumu | `calendar/EmptyGridState.tsx` |
| Etkinlik hover önizleme kartı *(canonical'da çizili değil — `14` BR-SHELL-41…45)* | `calendar/EventHoverCard.tsx` |
| Etkinlik bağlam menüsü *(sağ tık — `KEEP-13`, `14` BR-SHELL-46…50)* | `calendar/EventContextMenu.tsx` |

### 02 · Etkinlik oluştur / düzenle  *(quiet editable event editor — kilitli)*

| Canonical parça | React |
|---|---|
| 680px sağ drawer | `overlay/Drawer.tsx` + `event/EventDrawer.tsx` |
| Sessiz başlık girişi (24px, odakta alt çizgi) | `.qinput--title` |
| Takvim seçici çipi + durum rozeti | `EventDrawer` üst meta satırı |
| Ne zaman: tarih + saat + Tekrar ekle | `EventDrawer` "Ne zaman" bloğu |
| Kimlerle: arama + katılımcı satırları (Meşgul / Müsait / Bilinmiyor) | `event/ParticipantRow.tsx` |
| Uygun zamanlar (ilk öneri vurgulu) | `domain/scheduling.ts` + `.sugg` |
| Nerede: oda, Değiştir / Kaldır, hata ve uyarı satırları | `EventDrawer` "Nerede" bloğu |
| Alt bar: engelleyici sayacı + Vazgeç + Kaydet | `Drawer` footer |

### 03 · Oda seçici  *(S2 — kilitli)*

| Canonical parça | React |
|---|---|
| 640px panel, etkinlik drawer'ının solunda | `room/RoomPickerDrawer.tsx` |
| Etkinlik drawer'ı üzerinde %50 beyaz peçe | `.drawer.is-behind::after` |
| Oda ara + Kapasite/Özellik/Bina/Kat filtre çipleri | `RoomPickerDrawer` başlık |
| "Uygun başlangıç saatleri · N saatlik toplantı için · N oda" | `.rp__listhead` |
| Oda kartı: ad, rozet, meta, sebep satırı, saat çipleri | `.rcard` |
| Durumlar: Seç / Seçili / Seçilemez / Yetki iste | `domain/rules.ts › roomSelectability` |
| Alt bar: seçim özeti + Kapat + Odayı ata | `.rp__foot` |

### 04 · Oda yönetimi  *(2 kolon — kilitli)*

| Canonical parça | React |
|---|---|
| Kendi sol rail'i: Odalar listesi + Durum kartı | `admin/RoomsSidebar.tsx` |
| Başlık: oda adı + "Oda ayarları" + Aktif + Önizle | `admin/RoomsScreen.tsx` |
| İki kolon: Genel · Erişim · Kapasite · Rezervasyon onayı · Lokasyon | `.roomedit__body` |
| Özellik çipleri (✓ ile aktif) | `.featchip` |
| Onaylayıcı arama + öneri satırları + Ekle | `.approversugg` |
| Sticky alt bar + engelleyici sayacı | `.adminfoot` |

### 05 · İzinler  *(canonical permissions — kilitli)*

| Canonical parça | React |
|---|---|
| Başlık + açıklama + arama + Erişim ekle | `admin/PermissionsScreen.tsx` |
| 4 kolonlu tablo (Oda · Görebilir · Rezerve edebilir) | `.permtable` |
| Yeşil "Tüm kullanıcılar" token'ı, nötr grup/kullanıcı token'ları | `.permtoken`, `.permtoken--all` |
| Seçili hücre detay paneli + "Erişim nasıl çalışır" kartı (yan yana) | `.permlower` |
| Alt bar: "N oda · N odada rezervasyon kısıtlı" | `.permfoot` |

### 06 · Talepler  *(master–detail — kilitli)*

⚠️ Canonical dosyada bu bölüm `dc-import` ile gömülüydü ve kaynak bileşen lokal sistemde
bulunamadı (bkz. `AUTONOMOUS-STATUS.md` K-01). **`dc-import` bağımlılığı tamamen kaldırıldı.**

| Kilitli yapı | React |
|---|---|
| Sol: talep listesi (Bekleyenler / Karara bağlananlar) | `requests/RequestsScreen.tsx › RequestRow` |
| Sağ: seçili talep detayı | `RequestDetail` |
| Etkinlik adı · takvim · oda · tarih/saat · talep eden · katılımcı/kapasite | `.reqdetail__grid` |
| Yatay oda müsaitlik çizelgesi | `requests/RoomTimeline.tsx` |
| Onayla / Reddet | `RequestDetail` aksiyonları |
| Red: inline opsiyonel gerekçe editörü | `.reqreason` |
| Self-approval: aksiyon yok, bilgilendirme + Talebi geri çek | `RequestDetail` own-request dalı |

### 07 · Mobil  *(agenda/day — kilitli)*

| Canonical parça | React |
|---|---|
| Tarih kartı + Bugün + Takvimler + gün okları | `mobile/MobileApp.tsx` |
| Hafta şeridi (7 gün) | `.mob__strip` |
| "N talebiniz onay bekliyor" şeridi | `.mob__banner` |
| Gün listesi kartları (22px renk şeridi + gövde) | `.mob__card` |
| Ertesi gün özeti | `.mob__nextday` |
| Alt: Yeni etkinlik + Odalar | `.mob__bigbtn` |
| A · Takvimler sheet (Takvimlerim / Benimle paylaşılanlar) | `mobile/MobileCalendarsSheet.tsx` |
| B · Paylaşılan etkinlik salt okunur | `mobile/MobileEventSheet.tsx` |
| C · Takvimi kaldır action sheet | `MobileCalendarsSheet` removing dalı |

### 08 · Takvim paylaşımı  *(sharing drawer — kilitli)*

| Canonical parça | React |
|---|---|
| 520px drawer, ⋯ → Paylaş ile açılır | `sharing/ShareDrawer.tsx` |
| Takvim adı + "senin takvimin" | `.shd__title`, `.shd__owner` |
| Zorunlu açıklama (mevcut ve gelecekteki + varsayılan takvim) | `.banner--info` |
| Kişi ekle + "Yalnızca kurumunuzdaki kullanıcılar" | `.psearch` |
| Paylaşılan kişiler + "Etkinlik detaylarını görebilir" + Kaldır | `.shrow` |
| Alt: "Değişiklikler anında uygulanır" + Bitti | `Drawer` footer |
| Alıcı tarafı: satır hover'ında ⋯ → Takvimi kaldır | `shell/CalendarList.tsx › SharedCalendarList` |
| Kaldırma sonrası sakin onay metni | `reducer › removeShare` toast |

---

## 2. Tasarım token'ları

`src/styles/tokens.css` canonical'dan çıkarılan değerlerin tek kaynağıdır. Üç ayrı kontrol
kenarlığı rolü canonical'daki gibi **ayrı** tutulmuştur:

```
--border-input        #DDE1E6   giriş alanı
--border-btn-secondary #DADCE0  ikincil buton
--border-btn-disabled #E1E4E8   pasif buton
```

Hairline'lar da ayrıdır: `--line-frame #DCDCD8` · `--line-divider #EDEFF2` · `--line-panel #E6EAEE`.

---

## 3. Canonical'da olmayan / farklı olan

Her madde gerekçelidir; hiçbiri yeni tasarım yönü değildir.

| # | Fark | Gerekçe |
|---|---|---|
| D-01 | Sol rail kaydırılabilir; tarih kartı kırpılmıyor | Canonical PNG'de 900px çerçeve nedeniyle "Bugün" satırı kırpılmış. Greenfield ilkesi: kötü davranış miras alınmaz |
| D-02 | Tarih alanı: canonical etiket + üzerinde şeffaf native `date` girişi | Canonical biçim korunurken alan gerçekten düzenlenebilir olmalı (FAZ 1 bulgusu) |
| D-03 | Etkinlik drawer başlığında sessiz **Sil** bağlantısı | Etkinlik silme akışı spec'te var; canonical 02 tek bir durumu gösteriyor |
| D-04 | Gün / Ay / Odalara göre görünümleri gerçekten çalışıyor | Canonical yalnız Hafta'yı gösteriyor; segment kontrolü ölü olamaz |
| D-05 | Galata **aktif** (canonical 04'te `Pasif`) | Canonical 03 ve 05 Galata'yı listeliyor ve "4 oda" diyor; iki ekran çelişiyor (`AUTONOMOUS-STATUS.md` K-04) |
| D-06 | Durum kartı sayıları veriden hesaplanıyor | Sabit metin yerine gerçek durum |
| D-07 | "Ürün Roadmap" etkinliği eklendi | Onaylanabilir bir talebin takvimde görünür sonucu olması için (K-07). Veri eklemesi, tasarım değişikliği değil |
| D-08 | Topkapı `onay gerekli` | Canonical 01/02'deki "Onay bekliyor" durumunun tutarlı olması için (K-05) |
| D-09 | 05 İzinler'de sol railde "Benimle paylaşılanlar" da var | Canonical 05 paylaşım eklenmeden önce üretilmiş; rail tek bileşendir |
| D-10 | Shift+D demo paneli | Sunum arayüzünde **görünmez**; yalnız persona ve sıfırlama için |
| D-11 | Etkinlik hover önizleme kartı | Canonical'da çizilmemişti; 1 Eylül 2026'da ürün sahibi kapsama aldı. Tasarımı canonical token'larla kuruldu, spec'e `14` BR-SHELL-41…45c olarak yazıldı. Dokunmatik cihazda hiç render edilmez (BR-SHELL-43) |
| D-12 | ~~Kartta **Sil** aksiyonu~~ → **geri alındı** | 2 Eylül 2026'da bağlam menüsü kapsama girince kart salt okunura döndürüldü; yıkıcı aksiyon tek yerde toplandı — `14` BR-SHELL-45, SR-SHELL-12 |
| D-18 | **Etkinlikte sağ tık bağlam menüsü** | Canonical'da çizilmemişti ama **mevcut üründe vardı** — FAZ 1'de kaydedilmemiş bir kalıp (`KEEP-13`, audit rev.4). Düzenle · oda değiştir · sil; pasif öğenin sebebi menüde yazılı — `14` BR-SHELL-46…50 |
| D-13 | ⚠️ **“Filtreler” kartı kaldırıldı, yerine Odalar ekseni kondu** | Canonical'ın kartı **“Etkinlik türü”** satırını taşıyordu; `BR-SHELL-34` (D-037) bu ekseni açıkça kaldırmıştı — tasarım `UX-18`'i geri getiriyordu. Yanındaki **“Katılımcı”** satırının hiçbir kararda karşılığı yoktu. Buna karşılık `KEEP-03`'ün korunmasını istediği **oda ekseni** tasarımdan düşmüştü. 1 Eylül 2026'da ürün sahibi kararıyla düzeltildi — `14` SR-SHELL-09 |
| D-15 | **Takvim satırında paylaşım izi** *(`⑄ 2`)* | Canonical'da yoktu. Paylaşım yüzeyi düşük kontrastlı bir `⋯` ikonunun arkasında saklıydı ve takvimin paylaşılmış olduğu hiçbir yerde görünmüyordu. 1 Eylül 2026'da ürün sahibi kararıyla eklendi — `12` BR-CAL-43/44, SR-CAL-10 |
| D-16 | **Takvim oluştur / düzenle / sil diyalogları** | Canonical'da çizilmemişti; `12` §2 kapsam içi diyordu. Renk paleti `BR-CAL-05` gereği yönetilen 8 renkten oluşur ve durum renkleriyle çakışmaz |
| D-17 | **Oda oluşturma ve bina ekleme** | Canonical'da yoktu; `13` Roller tablosu yöneticinin oda oluşturduğunu söylüyordu. Oluşturma düzenlemeyle aynı formu kullanır (taslak satır), bina lokasyon alanından eklenir — `13` BR-ROOM-29/30, SR-ROOM-09 |
| D-14 | **Görünüm seçicide ayırıcı** | Canonical `Gün · Hafta · Ay · Odalara göre`yi tek düz sıra olarak çiziyordu; `BR-SHELL-30` zaman ekseni ile kaynak ekseninin görsel olarak ayrılmasını şart koşuyor (`UX-11`). Ayırıcı eklendi — `14` SR-SHELL-09 |

---

## 4. Yeniden kullanılabilirlik

Canonical HTML hiçbir yerde kopyalanmadı. Tekrar eden her yapı bileşen oldu:

| Bileşen | Kullanıldığı yerler |
|---|---|
| `Icon` | 29 ikon, canonical SVG yolları birebir; tüm ekranlar |
| `Drawer` | 02 etkinlik · salt okunur etkinlik · 08 paylaşım |
| `Button` / `IconButton` | tüm ekranlar; 5 varyant, canonical'daki dört ayrı primary stili tek kaynağa indirildi |
| `Menu` | takvim ⋯ · paylaşılan takvim ⋯ · takvim seçici · tekrar seçici |
| `ParticipantRow` | etkinlik drawer'ı (container query ile dar drawer'da yığılır) |
| `EventHoverCard` | hafta ve gün ızgarası; `createPortal` ile gövdeye render edilir |
| `EventBlock` | hafta ve gün ızgarası |
| `NavRail` | takvim rail'i ve oda yönetimi rail'i |
| `factTable` / `notice` / `button` (e-posta) | 16 e-posta şablonu |
