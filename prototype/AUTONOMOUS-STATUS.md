# AUTONOMOUS-STATUS

Otonom yürütmenin denetim izi. Kullanıcı onayı istemek için değil, **ne yapıldığını ve
hangi belirsizliğin nasıl kapatıldığını** kayıt altına almak içindir.

Yürütme tarihi: 31 Ağustos 2026
Kapsam: FAZ 7 (frontend prototype) · FAZ 8 (e-posta tasarım sistemi) · FAZ 9 (dokümantasyon)

---

## 1. Faz durumu

| Faz | Durum | Çıktı |
|---|---|---|
| **FAZ 7 — Frontend prototype** | ✅ Tamamlandı | `prototype/` · Vite + React 19 + TypeScript |
| **FAZ 8 — E-posta tasarım sistemi** | ✅ Tamamlandı | `prototype/emails/` · 16 şablon + önizleme dizini |
| **FAZ 9 — Dokümantasyon** | ✅ Tamamlandı | `prototype/README.md` + `prototype/docs/*` |

---

## 2. Kalite kapıları

| Kapı | Sonuç |
|---|---|
| **A — Build** | ✅ `npm run build` hatasız |
| **B — TypeScript** | ✅ `tsc -b` · 0 hata (strict, `noUnusedLocals`, `noUnusedParameters` açık) |
| **C — Konsol** | ✅ Canonical demo akışı boyunca uncaught error / React warning / failed request = 0 |
| **D — Etkileşim** | ✅ 24 adımlık canonical demo akışı baştan sona tamamlanıyor (`scripts/demo-flow.mjs`) |
| **E — Görsel** | ✅ Canonical PNG'lerle karşılaştırıldı; kritik sapmalar giderildi (§4) |
| **F — Responsive** | ✅ 1440×900 masaüstü + 390×844 mobil doğrulandı |
| **G — Offline** | ✅ `npm install` sonrası ağ gerekmiyor: Poppins self-hosted, harici CDN/istek yok |

Testler: **42 test / 2 dosya** — `npm test`.

---

## 3. Kapatılan belirsizlikler (fallback kararları)

Aşağıdaki noktalar "gerçek blocker" değildi; source of truth'a en yakın, en düşük
scope'lu çözümle kapatıldı.

### K-01 · 06 Talepler ekranının görsel kaynağı
`Talepler D2 - Karar Masasi Etkilesimli.dc.html` **lokal sistemde bulunamadı**
(`~/Desktop`, `~/Desktop/Takvim`, `~/Desktop/Takvim/design`, sunum paketi ve `support.js`
tarandı). Bu nedenle talimatta kilitlenen yapı uygulandı: master–detail approval inbox,
sol istek listesi + sağ detay, yatay oda müsaitlik çizelgesi, onay/red aksiyonları,
inline opsiyonel red gerekçesi, self-approval bilgilendirme durumu.
**Yeni tasarım yönü üretilmedi.** `dc-import` bağımlılığı tamamen ortadan kalktı.

### K-02 · Demo saati sabitlendi
Sunumun her açılışta aynı ekranı göstermesi için demo saati **28 Ağustos 2026 Cuma, 15:00**
olarak sabitlendi (canonical 01'deki "şimdi" çizgisiyle aynı). Alternatif (gerçek saat)
hafta sonunda boş bir ızgara gösterme riski taşıyordu.

### K-03 · Mevcut kullanıcı kimliği
Canonical ekranlarda oturum sahibinin adı geçmiyor. **Deniz Aydın · Ürün Yöneticisi**
(`deniz.aydin@ornek.com`) tanımlandı. Canonical'da adı geçen kişiler (Mert Kaya,
Ayşe Demir, Zeynep Aksoy, Ahmet Yıldız) aynen korundu.

### K-04 · Galata odasının aktiflik durumu
Canonical **04** Galata'yı `Pasif` gösterip "3 aktif oda" derken, canonical **03** ve **05**
Galata'yı listeliyor ve "4 oda" diyor. İki ekran aynı anda doğru olamaz.
Galata **aktif** kabul edildi: 03'teki "rezervasyon yetkiniz yok" durumu (canonical demo
akışının parçası) ve 05'teki 4 satırlık tablo buna bağlı. `Pasif` rozeti veri tarafından
sürülür; oda editöründeki Aktif anahtarı çalışır durumdadır.

### K-05 · Topkapı odasında onay gereksinimi
Canonical 01'de Salı 25 "Ürün Demo" (Topkapı) **saat ikonuyla** = onay bekliyor gösteriliyor,
canonical 02 aynı etkinliği "Onay bekliyor" rozetiyle açıyor. Bu durumun tutarlı olması için
Topkapı `Rezervasyon onayı = açık` (onaylayıcılar: Ahmet Yıldız, Deniz Aydın) tanımlandı.
16-room-booking §4.1 öncelik kuralı gereği müsaitlik sebebi onay ipucundan önce gösterildiği
için canonical 03'teki "Talep edilen saat dolu" gösterimi bununla çelişmiyor.

### K-06 · Self-approval yasağı ve demo akışı
`BR-APR-17a` gereği kullanıcı kendi talebini onaylayamaz. Canonical demo akışının
16–20. adımları ("talebi onayla → takvimde rezerve gör") tek personayla mümkün değil.
Çözüm: veri, **her iki durumu da aynı ekranda gösterecek** biçimde kuruldu —
Deniz'in kendi talepleri bilgilendirme + "Talebi geri çek" durumunda; Mert Kaya'nın
Topkapı talebi ise Deniz tarafından onaylanabilir. Böylece 16–20. adımlar
**persona değiştirmeden** çalışır.
Ayrıca literal akış (kendi talebini onaylatma) için **Shift+D** ile açılan, sunum
arayüzünde görünmeyen bir demo paneli üzerinden onaylayıcı personasına geçilebilir.

### K-07 · "Ürün Roadmap" etkinliği eklendi
Onaylanabilir bir talebin takvim üzerinde görünür sonucu olması için, paylaşılan
**Ürün** takvimine (sahibi Mert Kaya) 27 Ağustos 14:00–15:00 "Ürün Roadmap" etkinliği
eklendi. Canonical 01'e göre tek veri eklemesidir; tasarım değişikliği değildir.

### K-08 · Sol rail kırpılması düzeltildi
Canonical 01 PNG'sinde tarih kartının "Bugün + ok" satırı 900px çerçeveye sığmadığı için
kırpılmış görünüyor. Prototipte sol rail kaydırılabilir ve kart kırpılmıyor.
FAZ 1'in "greenfield redesign — kötü davranışı miras alma" ilkesi gereği bilinçli sapma.

### K-09 · Tarih alanı
Canonical 02 tarihi biçimlendirilmiş bir etiket olarak gösteriyor; native `input[type=date]`
bu biçimi veremiyor. Etiket canonical görünümde bırakıldı, üstüne şeffaf native date input
yerleştirildi — hem görünüm hem gerçek düzenlenebilirlik korundu.

### K-10 · Talepler ekranına giriş noktası
Canonical'da ayrı bir "Talepler" navigasyon öğesi yok. Giriş noktası canonical 04'teki
**Durum kartındaki "N bekleyen talep"** satırı yapıldı; mobilde canonical 07'deki
"N talebiniz onay bekliyor" şeridi aynı yere gider. Yeni navigasyon öğesi eklenmedi.

### K-11 · Bildirim kodları
Reducer'daki bildirim kodları `19-notifications-spec.md` ile birebir hizalandı
(`N-EVT-01…06`, `N-SER-01…03`, `N-CAL-01/02`, `N-RES-01…05`).
FAZ 8'de **yeni bildirim olayı üretilmedi**; 16 şablon = spec'teki 16 domain event.

### K-12 · Sunum tarihi
Sorulmadı. Öncelik sırası talimattaki gibi işletildi:
P0 çalışan demo → kararlılık → görsel sadakat → P1 → e-posta → dokümantasyon.

---

## 4. Görsel karşılaştırma (GATE E) — giderilen sapmalar

| # | Sapma | Çözüm |
|---|---|---|
| 1 | Tarih kartı flex ile eziliyordu | `.sidebar > * { flex:none }` |
| 2 | Sahip olunan takvim satırlarında `⋯` gizliydi | Sahipte kalıcı, paylaşılanda hover ile (BR-CAL-34) |
| 3 | Takvim satırında canonical'da olmayan "N kişi" etiketi | Kaldırıldı |
| 4 | Oda seçici açıkken etkinlik drawer'ı şeffaflaşıyordu | Canonical'daki gibi %50 **beyaz peçe** |
| 5 | Oda kartında "Seç" outline buton | Canonical'daki metin aksiyonu |
| 6 | Öneri satırlarında kısa gün adı | Uzun gün adı |
| 7 | 04 Odalar takvim rail'i kullanıyordu | Kendi rail'i (Odalar listesi + Durum kartı) |
| 8 | 04 tek kolon form | Canonical iki kolon + sticky alt bar + özellik çipleri |
| 9 | 05 açıklama kartı tablonun altındaydı | Canonical'daki gibi detay paneliyle yan yana |
| 10 | 05 "Tüm kullanıcılar" nötr token | Canonical'daki yeşil onay token'ı |
| 11 | Oda listesi satırlarında metinler bitişik | `display:block` |
| 12 | `favicon.ico` 404 | Marka favicon'u eklendi |

---

## 5. Bilinen sınırlar

Tam liste: `docs/KNOWN-LIMITATIONS.md`. Özet: gerçek backend, veritabanı, kimlik doğrulama,
e-posta gönderimi, eşzamanlılık ve sunucu tarafı yetki uygulaması yoktur.

---

## 6. Blocker

**Yok.** Kullanıcıya sorulması gereken gerçek blocker (eksik credential, erişilemeyen zorunlu
harici sistem, çelişen iki bağlayıcı business rule, geri alınamaz işlem) oluşmadı.
K-04, K-05 ve K-06'daki gerilimler canonical mock'lar arası tutarsızlıktı; bağlayıcı
business rule çatışması değildi ve spec'e sadık kalınarak çözüldü.

---

## 7. Final doğrulama (sıfırdan)

Sunum ZIP'i geçici bir dizine açıldı ve **temiz kurulumdan** itibaren doğrulandı:

| # | Kontrol | Sonuç |
|---|---|---|
| 1 | `npm install` (temiz, `node_modules` yokken) | ✅ |
| 2 | `npm run build` | ✅ `tsc -b` + `vite build` hatasız |
| 3 | `npm test` | ✅ 42/42 |
| 4 | `node emails/build.mjs` | ✅ 16 şablon üretildi |
| 5 | `npm run dev` | ✅ http://localhost:5180 |
| 6 | Canonical demo akışı (24 adım) | ✅ tamamı geçti |
| 7 | Mobil 375 / 390 / 430 px | ✅ yatay taşma yok |
| 8 | 06 Talepler (dc-import'suz) | ✅ master–detail, self-approval durumu, onay/red |
| 9 | Takvim paylaşımı | ✅ ekleme, kaldırma, görünürlük, alıcı tarafı |
| 10 | Konsol hatası / React uyarısı / başarısız istek | ✅ 0 |
| 11 | Harici ağ isteği (GATE G) | ✅ 0 — Poppins yerelden yüklendi |
| 12 | ZIP bütünlüğü | ✅ 513 dosya · `node_modules` yok |

Doğrulama betikleri: `scripts/demo-flow.mjs` (akış + konsol) ve `scripts/gates.mjs`
(offline + responsive + konsol). İkisi de `puppeteer-core` ile sistemdeki Chrome'u kullanır.

---

## 8. Rapor sonrası değişiklik — 1 Eylül 2026

**Etkinlik hover önizleme kartı kapsama alındı.**

Ürün sahibi prototipi gördükten sonra ızgarada hover önizlemesinin neden olmadığını sordu.
Kanıt zinciri: `U-05 hover önizleme` FAZ 1'de **unvalidated candidate**, FAZ 2B'de PC-02'de
**aday**, `04-scope-closure.md` PC-02'de ise açıkça **kapsam dışı** ("spec seviyesinde
önerilecek") idi. Canonical tasarımda da karşılığı yoktu — dosyadaki 6 hover state'in tamamı
02 Etkinlik drawer'ındaki alanlara ait.

⚠️ **Tespit edilen boşluk:** kapsam kapanışının söz verdiği "spec seviyesinde önerilecek"
notu FAZ 4'te `14-calendar-shell-spec.md`'ye **hiç taşınmamıştı.** Bu FAZ 4 eksiğidir.

**Yapılanlar**

| | |
|---|---|
| Spec | `14` BR-SHELL-41…45 + SR-SHELL-07 yazıldı |
| Kapsam | `04-scope-closure.md` PC-02 güncellendi; kapsam değişikliği tarih ve gerekçeyle not edildi |
| Prototip | `calendar/EventHoverCard.tsx` + `EventBlock` içinde 400 ms gecikmeli hover/focus durumu |
| Kısıt | Dokunmatik cihazda hiç render edilmez; kart salt okunur; free/busy yalnız müsait/meşgul |
| Doğrulama | Demo akışı **25 adıma** çıktı, tamamı geçti; konsol hatası 0; tüm kapılar geçti |

Bu bir **ürün kapsamı kararıdır**, otonom modda kendiliğinden kapatılmadı — ürün sahibine
soruldu ve onayıyla eklendi.

### 8.1 · Karta silme aksiyonu eklendi *(aynı gün)*

Ürün sahibi karttan da silebilmek istedi. ⚠️ Bu, birkaç saat önce yazdığım
`BR-SHELL-45 — "Kart salt okunurdur: aksiyon, buton veya bağlantı taşımaz"` kuralıyla
**doğrudan çelişiyordu.** Kural benim spec-level önerimdi, ürün sahibinin kararı değildi;
bu nedenle revize edildi (BR-SHELL-45…45c, SR-SHELL-08).

Silme yıkıcı bir işlem olduğu için hover yüzeyine üç kısıtla kondu:

| Kısıt | Kural |
|---|---|
| Yalnızca kullanıcının düzenleyebildiği etkinlikte gösterilir; paylaşılan salt okunur etkinlikte hiç render edilmez | BR-SHELL-45a · `12` BR-CAL-27 |
| Doğrudan silmez; açık onay diyaloğundan geçer ve rezervasyon sonucunu belirtir | BR-SHELL-45b · `11` ST-DES-01/02 · `15` BR-EVT-29/30 |
| Kartın altında **etiketli ayrı satırda** durur; çıplak ikon değildir | BR-SHELL-45c |

Kart artık pointer alabildiği için imleç bloktan karta geçerken 160 ms'lik kapanma
gecikmesi eklendi; kart bu sürede kendini açık tutar.

Doğrulama: demo akışı **27 adıma** çıktı (kartta silme var · paylaşılanda yok),
tamamı geçti, konsol hatası 0, tüm kapılar geçti.

---

## 9. Tasarım–spec hizalama turu — 1 Eylül 2026

Prototip gözden geçirildi ve **canonical tasarım ile bağlayıcı kuralların çeliştiği üç nokta**
tespit edilip ürün sahibinin kararıyla kapatıldı. Üçü de aynı kökten geliyordu.

### Kök neden

`KEEP-03` (audit) bugünkü ürünün sol rail'inde **dört** filtre ekseni sayıyordu:
*tarih · **tip** · oda · takvim*. Sonra `D-037` **tip eksenini tamamen kaldırdı**.

| Katman | Ne oldu |
|---|---|
| FAZ 4 · spec | `KEEP-03`'ü mekanik taşıdım; kaldırılan tip ekseninin yerine **"diğer filtreler"** adlı, arkasında hiçbir karar olmayan bir yer tutucu yazdım |
| FAZ 6 · tasarım | Filtreler kartına **"Etkinlik türü"** — yani D-037'nin sildiği ekseni — geri koydu; yanına dayanaksız bir **"Katılımcı"** satırı ekledi; `KEEP-03`'ün koru dediği **oda ekseni** düştü |
| FAZ 7 · prototip | Tasarımı sadakatle kopyaladım; iki ölü kontrol prototipe taşındı |

⚠️ **Süreç boşluğu:** FAZ 6 sonrası yaptığım tutarlılık geçişi renk, kenarlık ve tipografi
düzeyindeydi — **kural düzeyinde tasarım/spec çapraz kontrolü hiç yapılmadı.**

### Kararlar ve uygulama

| # | Karar | Uygulama |
|---|---|---|
| 1A | "Filtreler" kartı **oda eksenine** dönüştürüldü | `RoomsFilterCard`; `BR-SHELL-31c/31d` yazıldı; `FiltersCard` silindi |
| 2A | Görünüm seçiciye **ayırıcı** eklendi | `Gün · Hafta · Ay │ Odalara göre` — `BR-SHELL-30` artık karşılanıyor |
| 3A | `BR-SHELL-31` **üç eksene** indirildi | "diğer filtreler" yer tutucusu silindi; `04-scope-closure.md` PC-01 hizalandı |

Gerekçe kaydı: `14-calendar-shell-spec.md` → **SR-SHELL-09**.

⚠️ **"Katılımcı" filtresi bilinçli olarak eklenmedi** — hiçbir kararda geçmiyor; eklenmesi
karar alınmamış bir özelliği ürüne sokmak olurdu.

### Etki

- Yeni özellik eklenmedi; dayanağı olmayan iki satır çıkarıldı, korunması kararlaştırılan
  eksen geri getirildi.
- Oda ekseni **yalnızca görünümü daraltır** (BR-SHELL-31d): yetki, müsaitlik ve rezervasyon
  durumu değişmez; odasız etkinlikler etkilenmez.
- `BR-SHELL-32`'nin "kaç öğe gizli" gereği oda ekseninde karşılandı.
- Test sayısı 42 → **45**; demo akışı 27 adım, tamamı geçiyor.

---

## 10. E-posta şablonları denetimi — 1 Eylül 2026

FAZ 8'de 16 şablon üretilmişti ama **yalnız biri gözle kontrol edilmişti.** Hepsi tek tek
denetlendi (render, ölçü, responsive, harici istek, konsol, kopya).

### Düzeltilen teknik hata

⚠️ **16 şablonun tamamında mobilde 249px yatay taşma vardı.** Media query eşleşiyor ve
`.wrap{width:100%!important}` uygulanıyordu, ama kartın **dışındaki** alt satır
`width:600px; max-width:100%` taşıdığı için tablo hücresinin min-content genişliğini 600px'e
kilitliyordu; media query'nin etkisi boşa çıkıyordu. `width:100%; max-width:600px` olarak
düzeltildi, `.wrap`'e `min-width:0` eklendi. **Telefonda okunan her e-posta yatay kayıyordu.**

### Düzeltilen kopya sorunları

| Şablon | Sorun |
|---|---|
| **N-RES-03** | ⚠️ **Gerçek hata:** *"Topkapı bu saat için tekrar müsait durumda değil"* — `BR-APR-19` red sonrası slotun **serbest kaldığını ve odanın tekrar müsait olduğunu** söylüyor. Metin kuralın tersini iddia ediyordu |
| **N-EVT-02** | *"Yalnızca değişiklikten etkilenen katılımcılara gönderildi"* — iç dağıtım kuralı (`BR-NOT-07`) alıcıya sızıyordu. Alıcı odaklı dile çevrildi |
| **N-CAL-02** | *"Takvim sessizce kaybolmadı; bu bildirim erişim değişikliğini açıkça belirtmek içindir"* — kendi tasarım ilkemizi (`ST-CORE-01`) kullanıcıya anlatıyordu. Yararlı bir sonraki adımla değiştirildi |
| **N-EVT-03** | Gereksiz dipnot kaldırıldı |
| **N-SER-01** | Etiket/değer uyuşmazlığı: *"Etkilenen tarih: 6 tekrar"* → *"Etkilenen tarih sayısı"* |

**Örüntü:** spec gerekçelerini kullanıcıya dönük metne yazmışım. E-posta kuralı açıklamaz,
ne olduğunu ve sırada ne olduğunu söyler.

### Doğrulama sonucu (16/16)

| Kontrol | Sonuç |
|---|---|
| Kart genişliği 600px, masaüstünde taşma yok | ✅ |
| 375px'te yatay taşma | ✅ 0 |
| Harici ağ isteği (görsel, font, CDN) | ✅ 0 — hiç `<img>` yok |
| Render/konsol hatası | ✅ 0 |
| Konu satırı + preheader | ✅ hepsinde |
| Spec kodu eşleşmesi | ✅ 16 şablon = `19-notifications-spec.md`'deki 16 domain event |

### 10.1 · Görsel dil yenilendi *(aynı gün)*

Ürün sahibi şablonların **"AI üretimi gibi jenerik"** durduğunu söyledi. Teşhis:

- 16 şablon **birebir aynı iskeleti** kullanıyordu — davet ile red aynı görünüyordu
- Tek tasarım öğesi 4px'lik üst şeritti; gerisi etiket/değer tablosuydu
- ⚠️ **Ürünün kendi görsel dilinden hiçbir şey yoktu:** uygulamadaki gradient tarih kartı,
  renk şeritli etkinlik chip'i, takvim rengi — hiçbiri e-postada karşılık bulmuyordu

Çözüm: uygulamanın imza öğeleri e-postaya taşındı.

| Yeni öğe | Karşılığı |
|---|---|
| **Tarih bloğu** — takvim yaprağı: gün adı / 30px gün numarası / ay | Sol rail'deki tarih kartı |
| **Etkinlik kartı** — renk şeritli saat+oda başlığı, altında detay | Izgaradaki M3.1 etkinlik chip'i |
| **Aksan rengi** üst şerit + tarih bloğu + kart şeridini birlikte boyar | Takvim renkleri ve semantik palet |

Etiket/değer tablosu yalnızca **tarih bloğu ve kartın anlamlı olmadığı** şablonlarda kaldı
(`N-EVT-05`, `N-SER-02`, `N-CAL-02`, `N-RES-04`).

Doğrulama: 16/16 · mobil taşma 0 · harici istek 0 · konsol hatası 0 · HTML kaçış hatası yok.

---

## 11. CRUD tamamlama turu — 1 Eylül 2026

Ürün sahibi iki sorun bildirdi. Biri teşhis düzeltmesi gerektirdi, diğerinde tamamen haklıydı.

### 11.1 · Takvim paylaşımı — eksik değildi, **keşfedilemiyordu**

Paylaşım yüzeyi vardı (`Takvimlerim → ⋯ → Paylaş`) ve demo akışı bunu test edip geçiyordu.
Gerçek sorun görünürlüktü:

- `⋯` ikonu `#B7BDC6` — çok düşük kontrast, etiketsiz
- ⚠️ **Takvimin paylaşılmış olduğu hiçbir yerde görünmüyordu.** Bu göstergeyi canonical'a birebir
  uymak için **ben kaldırmıştım** — hata bendeydi
- Asimetri: alıcı tarafı ("Benimle paylaşılanlar") adlandırılmış ve görünürken veren taraf saklıydı

**Spec boşluğu:** `12` §5.6 paylaşımın kurallarını eksiksiz tanımlıyordu ama **giriş noktasını ve
paylaşılmış durumun gösterimini** hiçbir kural tanımlamıyordu.

→ `BR-CAL-43` (giriş noktası keşfedilebilir olmalı, satırda iz) ve `BR-CAL-44` (iz yalnız sahibe)
yazıldı; gerekçe `SR-CAL-10`.

### 11.2 · Oda ekleme — spec'te vardı, üründe yoktu

`13-rooms-spec` roller tablosu açıkça *"Organizasyon yöneticisi oda **oluşturur**, düzenler,
pasife alır, siler"* diyordu. Ben `+` butonunu "kapsam dışı" mesajıyla geçmiştim.

Aynı ailede beş stub daha vardı; hepsi tamamlandı:

| Yetenek | Kural |
|---|---|
| Takvim oluşturma | `BR-CAL-41` — yalnız ad + palet renk |
| Takvim yeniden adlandırma / renk | `BR-CAL-42` — ikisi aynı form, varsayılan takvim de düzenlenebilir |
| Takvim silme | `SR-CAL-06` **karara bağlandı** — açık seçim, taşıma varsayılan |
| Oda oluşturma | `BR-ROOM-29` — düzenlemeyle aynı form, taslak satır |
| Bina ekleme | `BR-ROOM-30` — oda formundan, ayrı ekran yok |
| Oda silme | `BR-ROOM-31` — rezervasyon kaydı varsa silinmez, pasife alınır |

### 11.3 · Açığa çıkan spec boşluğu

⚠️ `BR-ROOM-04/05/06` binayı kat için **ön koşul** yapıyordu ama **binayı kimin, nereden
oluşturduğu hiçbir spec'te tanımlı değildi.** Oda oluşturma akışı bu boşluğu görünür kıldı.
`BR-ROOM-30` ile kapatıldı: ayrı bir yönetim ekranı açmak `D-028` progressive disclosure
kararına aykırı olurdu.

### 11.4 · Doğrulama

12 uçtan uca kontrol geçti: paylaşım izi ve göstergeden drawer açılışı · takvim oluştur/düzenle/sil ·
etkinlikli takvimde açık seçim · oda taslağı · yeni bina oluşturma ve seçilme · oda listeye ekleme ·
rezervasyonsuz odada silme · rezervasyonlu odada kilit ve sebebin okunması.

Test 45 → **55**. Demo akışı 29 adım, tamamı geçiyor. Konsol hatası 0, tüm kapılar geçiyor.

⚠️ **Not:** demo verisindeki "Ürün" takviminin rengi `#2F6B4F`, `11-system-states-spec`'teki
**Rezerve/olumlu** rengiyle aynı — bu `BR-CAL-05`'in "durum renkleriyle çakışmama" şartına
aykırı. Canonical tasarımdan geldiği için değiştirilmedi; yeni palet bu rengi **içermiyor**.

---

## 12. Navigasyon senkronizasyonu — 1 Eylül 2026

Ürün sahibi tarih kartındaki ileri okuna basınca tarihin ilerlemediğini bildirdi.
Tek bir hata değildi; **sol rail'in aktif görünümü yansıtmaması** diye tarif edilebilecek
dört belirtisi olan bir kusurdu.

| # | Hata | Kural |
|---|---|---|
| 1 | ⚠️ **Tarih kartı sabit `today`'i gösteriyordu.** Oklar `anchorDate`'i değiştiriyordu ama kartta hiçbir şey değişmiyordu — kullanıcıya navigasyon bozukmuş gibi görünüyordu | `BR-SHELL-04a` **(yeni)** |
| 2 | **Mini takvim ana görünümü izlemiyordu.** İmleç yalnız ilk render'da `anchorDate`'ten alınıyor, sonra bağımsız kalıyordu | `BR-SHELL-05a` **(yeni)** |
| 3 | **İleri/geri her modda 1 hafta atlıyordu** — Gün ve Ay görünümünde yanlış *(gözden geçirme listesindeki A2)* | `BR-SHELL-03` (mevcut, uygulanmamıştı) |
| 4 | **Aralık etiketi her modda hafta aralığı gösteriyordu** — Gün görünümünde bir hafta, Ay görünümünde bir hafta | `BR-SHELL-04` (genişletildi) |

3 ve 4, 1 düzeltilince **görünür hâle geliyordu**: kart doğru tarihi gösterdiği anda aylık
görünümde bir hafta atlamanın yanlışlığı ortaya çıkıyor. Bu yüzden dördü birlikte kapatıldı.

**Tasarım notu:** kartta önce bir "bugün" rozeti denendi, ama `Bugün` butonu zaten aynı kartta
duruyordu — aynı bilgiyi iki kez söylemek yerine buton **aktif durum** aldı.

`shiftWeek` aksiyonu `shiftView` ile değiştirildi; adım ve kontrol etiketleri
(`Sonraki gün` / `hafta` / `ay`) aktif moddan türetiliyor.

Doğrulama: hafta/gün/ay adımları · mini takvim senkronu · aralık etiketi · `Bugün` dönüşü ve
aktif durumu · ay kaydırmasında ay sonu taşması (31 Ocak → 28 Şubat). Test 55 → **57**.
Demo akışı 29 adım, tüm kapılar geçiyor.

### 12.1 · Seçili gün kavramı — *(aynı gün, ikinci tur)*

§12'deki düzeltmeden sonra ürün sahibi kartın **24**'ü, mini takvimin **28**'i gösterdiğini
bildirdi. Kök neden §12'den daha derindi:

⚠️ **Durumda "seçili gün" diye bir kavram yoktu.** Yalnız `today` ve hafta anchor'ı vardı;
tarih kartı anchor'ı, mini takvimdeki dolu mavi daire ise `today`'i gösteriyordu —
**tek gösterge sanılan iki farklı kavram.**

İki düzeltme:

| # | Değişiklik | Kural |
|---|---|---|
| 1 | Mini takvimde **seçili gün dolu**, **bugün halka** ile gösterilir; çakıştıklarında yalnız dolu görünür | `BR-SHELL-05b` **(yeni)** |
| 2 | **Haftalık adım gün konumunu korur** — Cuma'dan ileri gidince yine Cuma seçili kalır. Adım hafta başına sabitlendiği için kart Pazartesi'yi, mini takvim Cuma'yı işaretliyordu | `BR-SHELL-03` (netleştirildi) |

Doğrulama: açılışta tek işaret (bugün = seçili) · hafta adımında Cuma → Cuma · geri
gidildiğinde 21 dolu / 28 halkalı ayrı görünüyor · mini takvimden gün seçimi karta, aralığa
ve ızgaraya yansıyor. Test 57 → **58**.

---

## 13. Demo kabuğu — 2 Eylül 2026

Prototip paydaşlara test ettirilecek. "Küçük bir login ekranı" istendi.

⚠️ **Gerçek kimlik doğrulama mümkün değil** — backend yok, şifre kontrolü tarayıcıda çalışır
ve konsolu açan görür. Bu yüzden giriş ekranı **persona seçici** olarak tasarlandı: hem kapı
görevi görür hem test için gerçekten işe yarar.

### Neden persona seçici

Test edilecek en kritik akış onay: *talep oluştur → onayla → takvimde rezerve gör*. Ama
`BR-APR-17a` gereği kimse kendi talebini onaylayamaz. Sahte bir e-posta/şifre formu bunu
çözmezdi; persona seçici doğal olarak çözüyor.

| Persona | Rolü | Test ettiği |
|---|---|---|
| Deniz Aydın | Ürün Yöneticisi | Etkinlik, oda, paylaşım — talebi **oluşturan** taraf |
| Zeynep Aksoy | Tesis Yönetimi | Boğaziçi onaylayıcısı — Deniz'in talebini karara bağlar |
| Ahmet Yıldız | Operasyon | Topkapı onaylayıcısı — Mert'in talebini karara bağlar |
| Mert Kaya | Ürün Müdürü | Paylaşan taraf |

### Eklenenler

| Öğe | Not |
|---|---|
| **Giriş ekranı** | Persona kartları + "neyi test edebilirsiniz" 5 adımlık tur |
| **Demo şeridi** | Üstte: *"Tasarım prototipi · veriler örnektir · yenileme sıfırlar"*. Kapatılabilir |
| **Persona satırı** | Sol rail'in altında, **DEMO** etiketli, sticky. Değişim **veriyi korur** |
| **Doğrudan bağlantı** | `?p=zeynep` giriş ekranını, `&banner=off` şeridi atlar |

⚠️ Üçü de **ürün arayüzü değildir**; canonical 01–08'in kompozisyonuna dokunmaz. Paket ekran
görüntüleri ve tüm doğrulama betikleri `?p=deniz&banner=off` ile üretilir, yani ürün ekranları
demo kabuğu olmadan yakalanır.

### Veri tamamlaması

Zeynep'in hiç takvimi yoktu — onunla girilince ekran boş kalıyordu. Kendisine bir varsayılan
ve bir "Tesis" takvimi eklendi. Diğer personaların takvimleri de artık kendi adlarıyla
("Kişisel") görünüyor; Deniz için bunlar hâlâ yalnız free/busy kaynağıdır (`10` BR-PRM-11).

Doğrulama: 10 uçtan uca kontrol · giriş ekranı · 4 persona · şerit · sabit persona satırı ·
persona değişiminde veri korunumu · Zeynep'in kendi takvimleri · Zeynep'in Kick-off talebini
görüp onaylayabilmesi · doğrudan bağlantı. Demo akışı 29 adım ve tüm kapılar geçmeye devam ediyor.

---

## 14. Paylaşım keşfedilebilirliği ve bildirim yüzeyi — 2 Eylül 2026

Üç kişilik testte ürün sahibi iki soru sordu: *"kendi takvimimi başkasıyla nasıl paylaşacağım"*
ve *"paylaştığımda karşı tarafa bildirim düşmeli"*. İkisi de gerçek eksikti.

### 14.1 · İlk düzeltmenin yanlış yarısını çözmüşüm

§11.1'de satıra paylaşım izi eklemiştim — ama iz yalnız `shareCount > 0` iken görünüyordu:

| Takvim | Görünen |
|---|---|
| Kişisel *(2 kişiyle paylaşılmış)* | `⑄ 2` rozeti |
| Proje · Ekip · Toplantılar | **hiçbir şey** — yalnız `#B7BDC6` renginde etiketsiz `⋯` |

Yani *"hangileri paylaşılmış"* sorusunu çözmüş, *"nasıl paylaşırım"* sorusunu çözmemişim.
Kullanıcının sorduğu ikincisiydi.

**Çözüm:** aynı slot her zaman dolu — paylaşılmamışken **"Paylaş"** (eylem), paylaşılmışken
**"N kişi"** (durum). İkisi de paylaşım yüzeyine götürür. `BR-CAL-43` genişletildi, `SR-CAL-10`
güncellendi.

### 14.2 · Bildirim yüzeyi

`N-CAL-01` **üretiliyordu** ama hiçbir yerde görünmüyordu. Sebebi `19-notifications-spec`'in
bilinçli duruşuydu: *"Bu spec bir yüzey tanımlamaz; uygulama içi bildirim platform bileşenidir."*

Yüzeyin hiç olmaması, spec'te tanımlı olayların çalıştığını **göstermeyi imkânsız kılıyordu.**
Üst çubuğa okunmamış sayacı taşıyan bir çan ve bildirim listesi eklendi. ⚠️ Yeni bildirim türü
üretmez; yalnız spec'te tanımlı olayları gösterir. Yüzeyin gerçek üründe platforma ait olacağı
kararı **değişmedi** — `SR-NOT-09`.

### 14.3 · Çan gelince görünür olan üç eksik

Yüzey eklenince, üretilmeyen bildirimler de görünür hâle geldi:

| # | Eksik | Kural |
|---|---|---|
| 1 | ⚠️ **`BR-NOT-22` ihlali:** alıcı paylaşımı kendi kaldırdığında **kendisine bildirim gidiyordu**. Kural açıkça *"kendi eylemi olduğu için kendisine bildirim gitmez; sahibe de gitmez"* diyor | Düzeltildi |
| 2 | **N-RES-01 hiç üretilmiyordu** — talep oluşuyor ama onaylayıcıya bildirim gitmiyordu | Eklendi |
| 3 | **N-EVT-01, N-EVT-03, N-RES-04** üretilmiyordu | Eklendi |
| 4 | `N-CAL-01/02` spec'in istediği **sahibin adını** taşımıyordu (`19` §5.3) | Düzeltildi |

Harici misafire uygulama içi bildirim üretilmez — kanalı yalnız e-postadır (`BR-NOT-03`).

### 14.4 · Doğrulama

Uçtan uca: dört takvimin hepsinde çip · paylaşılmamışlarda "Paylaş" · çipten drawer açılışı ·
paylaşım sonrası çipin "1 kişi"ye dönmesi · **paylaşanın kendine bildirim almaması** ·
persona değişince alıcıda okunmamış sayacın belirmesi · panelde `N-CAL-01` ve `N-RES-01` ·
alıcının railinde paylaşılan takvimin görünmesi.

Test 58 → **62**. Demo akışı 29 adım, tüm kapılar geçiyor, konsol hatası 0.

⚠️ **Test notu:** backend olmadığı için **her tarayıcının kendi veri kopyası vardır.** Üç kişi
ayrı makinelerden girdiğinde paylaşım karşı tarafta görünmez; akış **tek tarayıcıda persona
değiştirerek** test edilmelidir.

---

## 15. Denetim boşluğu: sağ tık bağlam menüsü — 2 Eylül 2026

Ürün sahibi mevcut Narbulut ürününden bir ekran görüntüsü paylaştı: etkinliğe sağ tıklayınca
**Güncelle · Oda değiştir · Kaldır** menüsü açılıyor.

⚠️ **Bu kalıp hiçbir belgemizde geçmiyordu** — ne bulgu, ne `KEEP` maddesi, ne spec. FAZ 1
denetimi `KEEP-12` ile sağdan açılan drawer kalıbını kaydetmiş ama bunu kaçırmıştı. Yani
"ekleyelim mi" sorusu değil, **kaldırırsak mevcut kullanıcı için regresyon** olacak bir kalıp.

Denetim rev.4 ile güncellendi: **`KEEP-13`** *(kalıbın kendisi)* ve **`UX-54`** *(pasif menü
öğesinin sebebi yazmıyor — ekran görüntüsünde "Oda değiştir" gri ama neden olduğu okunmuyor)*.

### Ortaya çıkan çakışma

Kalıp kapsama girince aynı etkinlik için **üç yüzey** oluştu: hover önizleme kartı (içinde Sil),
sağ tık menüsü, tıklayınca açılan drawer. Ürün sahibinin kararıyla bölünme netleştirildi:

| Yüzey | İşi |
|---|---|
| **Hover** | Oku — salt okunur önizleme |
| **Sağ tık** | Yap — düzenle · oda değiştir · sil |
| **Tıklama** | Tam düzenleme |

⚠️ Bu, 1 Eylül'de karta eklenen **Sil aksiyonunun geri alınması** demekti. Ürün sahibi bu
sonucu bilerek onayladı; `BR-SHELL-45` ilk hâline döndürüldü.

### Uygulanan kurallar

| Kural | İçerik |
|---|---|
| `BR-SHELL-46` | Menü hızlandırıcıdır; her işlem etkinlik yüzeyinden de yapılabilir |
| `BR-SHELL-47` | Paylaşılan salt okunur etkinlikte **hiç açılmaz**, tarayıcı menüsü engellenmez |
| `BR-SHELL-48` | Pasif öğenin sebebi menüde yazılı; engellenmeyen ama sonucu olan aksiyonda sonuç önceden belirtilir *(bekleyen talebi olan etkinlikte oda değiştirme → "Bekleyen talep iptal olur")* |
| `BR-SHELL-49` | Silme açık onay diyaloğundan geçer |
| `BR-SHELL-50` | Mobilde karşılığı yoktur |

Doğrulama: üç aksiyon · bekleyen talepte sebebin görünmesi · kartın salt okunur olması ve
tıklamayı engellememesi · paylaşılan etkinlikte menünün açılmaması · "Oda değiştir" ile oda
seçicinin açılması · silmede onay diyaloğu ve rezervasyon sonucunun yazılı olması.
Konsol hatası 0.

---

## 16. Rakip talep modeli — 2 Eylül 2026

Ürün sahibi bir senaryo sordu: *"İki kullanıcı aynı odaya aynı saate istek attı, birini kabul
ettik. Diğerini kabul edersek ne olur?"*

### Teşhis: senaryo mevcut modelde oluşmuyordu

`BR-APR-13` + `EC-RB-07` gereği ilk talep slotu bloke ediyordu; ikinci kullanıcı odayı
**seçemiyordu bile**. Beş senaryo testle doğrulandı — onay, red, geri çekme sonrası slotun
ne olduğu dahil.

Ama soru, modelin kendisinin sorgulanması gerektiğini gösterdi: *"iki kişi aynı odayı istedi,
hangisi daha acil"* değerlendirmesi yapılamıyordu.

### Karar: D-070

Ürün sahibinin ifadesiyle: *"kullanıcı yine yollayabilsin, oda yöneticisinin kararına kalsın;
otomatik red olmasın, teklif yollayamama gibi bir durum olmasın."*

| | Önce (D-036) | Şimdi (D-070) |
|---|---|---|
| İkinci kullanıcı | Odayı seçemez | **Talep gönderebilir** |
| Bekleyen talep | Slotu bloke eder | **Bloke etmez**, bilgi olarak gösterilir |
| Onay sonrası | — | Diğerleri **otomatik reddedilmez**, `Pending` kalır |
| Çakışma kontrolü | Talep anında | ⚠️ **Karar anında** |

⚠️ **Çözülmesi şart olan nokta:** otomatik red yoksa, yönetici ikinci talebi de onaylarsa aynı
odada iki rezervasyon oluşurdu. Bu ürün sahibine ayrıca soruldu; karar: **ikinci onay
engellenir**, sebebi ve engelleyen rezervasyonun sahibi gösterilir, yönetici isterse önce onu
kaldırır. Böylece `FN-03` *(odalarda "dolu" kavramı yok)* bulgusuna geri dönülmüyor.

Etkilenen kurallar: `BR-APR-11/12/13` yeniden yazıldı, `BR-APR-13a/13b` eklendi,
`16` §4.1 seçilebilirlik matrisi ve `EC-RB-07` güncellendi, `SR-APR-07` gerekçeyi taşıyor.

### İki yüzey eklendi

| Ne | Neden |
|---|---|
| **"Bu odanın takvimi"** — Odalar ekranında, seçili odanın bekleyen talepleri ve rezervasyonları tek listede, satır içi onay/red ile | *"Bu odaya kim ne zaman istek attı"* sorusunun cevabı yoktu. Onay kuyruğu **onaylayıcı** eksenli; soru **oda** ekseninden geliyordu (`BR-APR-25a`) |
| **Üst çubukta karar bekleyen iş rozeti** + Durum kartının vurgulanması | Talepler ekranına tek giriş noktası Odalar'daki soluk bir satırdı. ⚠️ Ayrıca **karar bekleyen iş bildirimden ayrı bir sinyaldir**: bildirim okununca kaybolur, bekleyen talep karar verilene kadar durmalıdır (`BR-APR-25c`) |

Oda takviminde talep eden ve etkinlik adı **yalnız kararı verebilecek veya etkinliği zaten
okuyabilen** kullanıcıya gösterilir; diğerleri için satır yalnız doluluk taşır
(`BR-APR-25b`, `10` BR-PRM-06).

Test 62 → **69**. Uçtan uca: rozet · vurgulu durum kartı · oda takvimi ve satır içi karar ·
oda seçicide rakip talebin engel değil bilgi olması. Konsol hatası 0.
