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
