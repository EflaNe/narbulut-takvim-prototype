# 23 — CURRENT HANDOFF (Narbulut Calendar)

> Bu doküman yalnızca **mevcut durumu** belgeler. Yeni ürün kararı, tasarım değişikliği veya refactor içermez.
> Tarih: 31 Ağustos 2026 · Devreden oturum: tasarım (design exploration → canonical screens) oturumu.

---

## 0. ⚠ ÖNCE OKU — BU PROJEDE NE VAR, NE YOK

Bu proje **tasarım (design) projesidir**. Aşağıdaki dokümanlar bu projenin dosya sisteminde **yok**; başka bir oturumda/alanda üretildiler:

`DECISIONS.md` · `04-scope-closure.md` · `10–19 Product Specs` · `20-ux-flows.md` · audit / benchmark / problem clusters dosyaları.

Bu projede fiilen bulunan dosyalar:

```
Narbulut Calendar.dc.html                  ← ARCHIVE (tüm exploration + kanonik set)
Narbulut Calendar - Final Screens.dc.html  ← CURRENT (7 ekranlık review yüzeyi)
Narbulut Calendar Prototype.dc.html        ← CURRENT (tıklanabilir akış)
assets/narbulut-logo.png                   ← tek gerçek marka varlığı
uploads/                                   ← kullanıcının yüklediği logo + referans ekran görüntüleri
docs/takvim/23-CURRENT-HANDOFF.md          ← bu dosya
support.js                                 ← runtime (dokunma)
```

**Sonuç:** yeni oturum spec dosyalarını okumak istiyorsa kullanıcıdan istemeli. Onlar gelmedikçe bu handoff + üç HTML dosyası tek referanstır.

---

## 1. PROJECT STATUS

| Faz | Durum | Not |
|---|---|---|
| Current State Audit | ✅ tamam | başka alanda; sonuçları brief'e girdi |
| Competitor Benchmark | ✅ tamam | Google/Outlook yalnız usability referansı olarak kaldı |
| Problem Clusters | ✅ tamam | 6 kanıtlanmış problem (durum iletişimi, dolu kavramı yok, kabuk kontrolleri, form, renk kaynağı, buton dili) |
| Product Decisions | ✅ tamam | bu projede **değiştirilmedi** |
| Scope Closure | ✅ tamam | kapsam dışı liste korunuyor |
| Product Specs | ✅ tamam | bu projede yalnız **uygulandı**, yeniden yazılmadı |
| UX Flows | ✅ tamam | Quick Create → Detailed → Room Picker → Approval akışı prototipte çalışıyor |
| Design Brief | ✅ tamam | Poppins + #0058B8 + gerçek Narbulut kabuğu |
| **Design Exploration** | ✅ **kapandı** | A/B/C/D → C v2 → E → F/G → etkinlik bloğu M1–M4 → M3.x → popover A–E + B1–B3 → oda seçici S1–S4 |
| **Interaction Prototype** | ✅ tamam | `Narbulut Calendar Prototype.dc.html` |
| **Canonical screens** | 🟡 **ŞU AN BURADAYIZ** | 7 ekran tek review dosyasında toplandı; 01 kanonik, 02–07 polish bekliyor |

**Tam konum:** exploration bitti, kanonik dil seçildi ve tüm ekranlara uygulandı. Sıradaki iş **ekran ekran polish** — yeni yön arama değil.

---

## 2. SOURCE OF TRUTH (öncelik sırası)

1. `DECISIONS.md` *(bu projede yok — kullanıcıdan iste)*
2. `04-scope-closure.md` *(yok)*
3. `10–19 Product Specs` *(yok)*
4. `20-ux-flows.md` *(yok)*
5. **Bu handoff** + `Narbulut Calendar - Final Screens.dc.html` (görsel kanonik)
6. `Narbulut Calendar Prototype.dc.html` (etkileşim/motion kanonik)
7. `Narbulut Calendar.dc.html` → **yalnız arşiv**

⚠ **Eski exploration kararları canonical spec'i override ETMEZ.** Arşiv dosyasındaki A/B/C/D, C v1, E, F/G bölümleri tarihsel kayıttır; çelişki halinde spec ve bu handoff geçerlidir.

---

## 3. CURRENT CANONICAL DESIGN DECISIONS

- **Tipografi:** Poppins (400 / 500 / 600). IBM Plex, Manrope, Archivo **kullanılmaz**. Sayısal alanlarda mono font yerine `font-variant-numeric: tabular-nums`.
- **Marka rengi:** `#0058B8`. Yalnız birincil aksiyon, aktif navigasyon/sekme, odak (focus) ve bugün. Etkinlik kategori rengi **değildir**.
- **Kabuk:** gerçek Narbulut paneli içinde yaşar. Takvim standalone bir SaaS uygulaması gibi görünmez.
  ⚠ Gerçek panel ekran görüntüsü/kod tabanı **elimize ulaşmadı**. Arşivdeki global sidebar bir **varsayımdır** ve öyle etiketlenmiştir. Final Screens dosyasında global HUD çizilmez; yalnız Calendar modül içeriği + modül sekmeleri (Takvim · İzinler · Odalar) gösterilir.
- **Google Calendar:** yalnız hit-area, navigasyon aşinalığı, motion ve etkileşim netliği referansı. Görsel yön değil.
- **Narbulut visual DNA:** sol utility alanı + güçlü tarih navigasyonu + net makro hiyerarşi korunur; eski takvimin görsel stili (büyük cyan kart, gri accordion) taşınmaz.
- **Mini monthly calendar:** sol utility panelinde, gerçek navigasyon görevi görür (tarih seçince ana takvim konumlanır).
- **Etkinlik görsel dili:** **M3.1 — İnce dolu bant.** Detay §4.
- **Embedded Constraint System:** `Constraint as State, not Alert as Component`.
- **Büyük generic warning card'lar kullanılmaz.** Uyarı katmanı yok; kısıt ait olduğu bileşenin durumudur.
- **Radius sistemi:** kontrol 8–9px · kart/panel 10–12px · popover 12–14px · mavi tarih kartı 14px. 16px+ bubble rutin kullanılmaz; pill yalnız semantik olarak pill olan yerde (mini takvimde seçili hafta satırı).
- **Gölge:** yalnız yüzen yüzeylerde (popover, drawer, menü). Kart/panel/satır ayrımı hairline + yüzey tonu ile.

---

## 4. MAIN CALENDAR — canonical base

**Dosya:** `Narbulut Calendar - Final Screens.dc.html` → bölüm `#calendar` (01 Ana Takvim)
**Arşiv kopyası:** `Narbulut Calendar.dc.html` → `dirV` / `dirY` bölümleri (aynı markup, karşılaştırma için)

| Katman | Kanonik karar |
|---|---|
| **Kabuk** | Modül sekmeleri sol panelin en üstünde: Takvim (aktif) · İzinler · Odalar. Global Narbulut HUD çizilmez. |
| **Sol alan (280px)** | Sırayla: modül sekmeleri → **mavi tarih kartı** (Cuma / **28** / Ağustos 2026 + "Bugün" pili + iki yuvarlak ok, arka planda yumuşak şekiller) → **ay kartı** (bugün tam mavi daire, seçili hafta hafif zemin) → **Takvimlerim** (onay kutusu + renk noktası + satır menüsü; Kişisel · Proje · Ekip · Toplantılar · pasif Reddedilenler) → **Filtreler** (açılır: Etkinlik türü, Katılımcı) |
| **Toolbar** | Tek satır, 64px: tarih aralığı (500/16px) + yuvarlak ‹ › · sağda dolgulu segmented view switch (Gün/Hafta/**Ay**/Odalara göre, aktif beyaz) · "Etkinlik ara" yüzey alanı · mavi "Yeni etkinlik" |
| **Week grid** | 56px satır yüksekliği, 52px saat cetveli, hairline `#EDEFF2` ayırıcılar, mesai dışı `#FBFBFA`, hafta sonu `#FAFBFC`, bugün sütunu `rgba(0,88,184,.03)`, bugün başlığı 30px mavi daire, şu-an çizgisi 2px mavi + nokta |
| **Event treatment (M3.1)** | Beyaz kart + 10px radius + `0 1px 3px` gölge. Üstte **20px dolu takvim rengi bant**: solda saat (tabular-nums, `flex:none`), sağda oda etiketi (küçülebilir, ellipsis) ve durum ikonu (bekleyen ⏱ / tekrar ↻, `flex:none`). Altta beyaz gövde: **yalnız başlık** (tek satır, ellipsis). 30 dk etkinlik = tek satır dolu renk blok (başlık + saat, beyaz tipografi). "Rezerve" metni yazılmaz — oda adı zaten rezervasyonu gösterir. |
| **Hover / detail** | Hover: yüzey/kenar hafifçe güçlenir (100–140ms). Seçili: 2px `#0058B8` ring, kart kendi rengini korur. Detay: **B3 popover** — üstte takvim renginde blok (Ekip · Retro · Cuma 28 Ağustos · 15:00 – 16:00), altında beyaz baloncuk gövde (oda, avatarlar + "5 katılımcı", Görüntüle / Düzenle / ⋯). 20px radius, yalnız bu yüzeyde gölge. Hover'dan 160ms sonra açılır, imleç geçişi için tolerans, 150ms opacity + 4px kayma. |

**Eski direction'lar (A · B · C v1 · D · E · F · G, M1/M2/M4, M3.2–M3.4, popover A/C/D/E, B1/B2, oda seçici S1/S3/S4) artık yalnız exploration'dır** — arşiv dosyasında karşılaştırma amacıyla durur, canonical değildir.

---

## 5. ROOM PICKER — canonical: **S2 (Uygun Saat Çipleri)**

**Dosya:** `Narbulut Calendar - Final Screens.dc.html` → `#room-picker`

Yapı: oda satırı (ad · kapasite · lokasyon · durum) + altında **seçilebilir başlangıç saati çipleri**. Seçili saat mavi, dolu saatler üstü çizili/pasif, onay gerekli oda saat ikonuyla işaretli, yetkisiz odada çip yerine "Saat bilgisi paylaşılmıyor".

**Neden S2 seçildi:**
1. Kullanıcının gerçek sorusunu doğrudan cevaplıyor: "bu oda ne zaman boş?" — soyut doluluk şeridini okumaya gerek kalmıyor.
2. Çakışma çözümünü aynı yüzeyde veriyor: dolu odada bile alternatif saat görünür, kullanıcı oda değiştirmek zorunda kalmıyor.
3. Dört durumu (müsait · onay gerekli · dolu · yetki yok) grafik dili şişirmeden taşıyor; şeritli versiyonun "patlayan" görsel yoğunluğu ortadan kalktı.

**S1 (durum önce) · S3 (duruma göre gruplu) · S4 (iki kolon kart)** → exploration olarak arşivde kalır (`dirX`).

---

## 6. FINAL SCREENS PLAN

**Dosya OLUŞTURULDU** ve şu an current: `Narbulut Calendar - Final Screens.dc.html`
*(Not: istenen ad em-dash'li `— Final Screens` idi; dosya sistemi bu karaktere izin vermediği için tire ile yazıldı. Aynı dosyadır.)*

Yapı:

| # | Bölüm id | Ekran |
|---|---|---|
| 01 | `#calendar` | Ana Takvim (Hafta) |
| 02 | `#event` | Etkinlik oluştur / düzenle |
| 03 | `#room-picker` | Oda Seç (S2) |
| 04 | `#rooms` | Odalar (oda yönetimi) |
| 05 | `#permissions` | İzinler |
| 06 | `#requests` | Talepler |
| 07 | `#mobile` | Mobil (390px) |

- Üstte review navigatörü var; **bir seferde tek ekran** görünür (`:target`, varsayılan `#calendar`). Bu navigatör ürün UI'sı **değil**, review aracıdır.
- **Exploration history bu dosyada gösterilmez.** Tüm exploration `Narbulut Calendar.dc.html` içinde kalır.
- Sayfanın altında kısa audit bloğu var (hangi ekranda ne polish gerekiyor).

---

## 7. SCREEN STATUS (gerçek duruma göre düzeltilmiş)

| # | Ekran | Durum | Bilinen polish maddeleri |
|---|---|---|---|
| 01 | Ana Takvim | ✅ **canonical** | Kalan iş yok. İleride ayrı state olarak: çakışan etkinlik çifti, mesai dışı etkinlik. |
| 02 | Etkinlik | 🟡 needs polish | Katılımcı listesi hâlâ tabloya yakın; alan genişlik ritmi (tarih 132 / saat 82) kırık; "Uygun zamanlar" bloğu forma daha organik bağlanabilir. |
| 03 | Oda Seç (S2) | 🟡 S2 canonical / final polish | Çip satırı yoğunluğu, panel genişliği, filtre hiyerarşisi. |
| 04 | Odalar | 🟡 needs polish | Sol liste ↔ sağ form dengesi zayıf; bölüm başlıkları ve kaydetmeden önceki özet satırı güçlendirilmeli. |
| 05 | İzinler | 🟡 **taslak kuruldu** (statü düzeltmesi: "eksik" değil) | Bu oturumda ilk kez tasarlandı: oda × (Görebilir / Rezerve edebilir) tablosu, kullanıcı + grup kayıtları, seçili oda için kayıt listesi, "erişim eklemelidir / deny yok" açıklaması. **Yeni izin modeli üretilmedi**, mevcut modelden türetildi. Polish + spec doğrulaması gerekiyor. |
| 06 | Talepler | 🟡 needs polish | Satırlar tabloya yakın; başlık–oda–zaman hiyerarşisi ve red gerekçesi alanının yerleşimi. |
| 07 | Mobil | 🟡 needs polish | Dokunma hedefleri, bekleyen durum girişi, oda girişi ikinci planda kalıyor. |

---

## 8. IMPORTANT PRODUCT RULES (tasarımda kazara bozulmaması gerekenler)

1. **Etkinlik tipi kavramı yoktur** — tek bir "Etkinlik" modeli.
2. **Quick Create** yalnız başlık + tarih/saat + oluştur. Takvim, oda, katılımcı, tekrar alanı yok.
3. Quick Create → Detailed geçişinde **veri ve bağlam kaybolamaz**.
4. Detaylı formda **başlık birincil alan**, yüzeyde **tek birincil aksiyon**.
5. Tarih ve saat düzenlenebilir; **bitiş tarihi ayrı alan** (çok günlü etkinlik). Saat **yazılarak** girilebilir.
6. **Etkinlik başına renk seçimi yok.** Renk tek kaynaktan gelir: atandığı takvim. Filtre lejantı ile ızgara chip rengi birebir aynı.
7. Katılımcı iki nitelik taşır: iç kullanıcı / harici misafir **ve** zorunlu / opsiyonel. İç ve harici için iki ayrı alan zorunlu değil.
8. **free/busy** yalnız **müsait · meşgul · bilinmiyor** gösterir. Başlık, katılımcı, oda, not hiçbir koşulda görünmez. **Bilinmiyor asla müsait gibi görünmez** (renk dışı işaret şart).
9. **Suggested Times form içinde** çalışır, ayrı ekran yok. Deterministik: süre + zorunlu/opsiyonel müsaitlik + mesai saatleri + seçiliyse oda. **AI yok, öğrenme yok.**
10. Oda seçici **doğrudan** çalışır (önce işaretlenecek onay kutusu yok) ve **etkinliğin o anki aralığına göre** gelir; aralık değişince yeniden değerlendirilir. **Tek oda** seçilebilir.
11. **Dolu odalar gizlenmez** — görünür, işaretli, seçilemez. **Yetkisiz odalar da gizlenmez** — görünür, sebebiyle, seçilemez. **Dolu ≠ Yetki yok**: ayrı görünüm, ayrı gerekçe, ayrı karar yolu.
12. Filtreler: kapasite · özellik · bina · kat. İlgili veri organizasyonda tanımlı değilse **o filtre hiç render edilmez** (pasif de gösterilmez).
13. **İzin modeli:** oda seviyesinde iki ayrı kural — **Görebilir** ve **Rezerve edebilir**. Kayıtlar eklemelidir (kullanıcı veya grup); **deny kaydı yok**. Yeni odada ikisi de "Tüm kullanıcılar". **Rol × izin matrisi yok.**
14. **Onay oda seviyesinde** ayarlanır, global mod değil. Onay açık odada rezervasyon "Onay bekliyor" başlar; **etkinliğin kendisi oluşur**. Bu durumda **başarı dili kullanılmaz**.
15. **Bekleyen talep slotu bloke eder** — başkalarına "onay bekliyor" görünür ve seçilemez.
16. Durumlar: Beklemede → Onaylandı / Reddedildi / İptal edildi. **Red etkinliği silmez** — etkinlik odasız kalır, slot serbest kalır. Red gerekçesi opsiyoneldir.
17. **Kendi talebini onaylayamazsın** — satır görünür, aksiyonlar gösterilmez, sebebi okunur. Onaylayıcı **yalnız kendi odalarını** görür ve **ek yetki kazanmaz**. **Çok aşamalı onay zinciri yok.**
18. **Tekrar:** günlük/haftalık/aylık + bitiş koşulu; kural tanımlanırken önizleme; düzenleme/silmede üç kapsam (yalnız bu · bu ve sonrakiler · tüm seri) ve **her birinin etkisi sayıyla**. Seri oda seçiminde özet ("18 tarihten 15'inde müsait, 3'ünde dolu").
19. **Mesai saatleri:** ızgara mesai başlangıcına konumlanmış açılır; mesai dışı görsel olarak bastırılır ama **etkileşime açık kalır**. Hafta **Pazartesi** başlar, tek zaman dilimi.
20. **Mobil**, masaüstü hafta ızgarasının küçültülmüş hali **değildir** — gün/ajanda listesi. Ayrıca: **hover'a hapsedilmiş sebep yok**, durum yalnız renkle anlatılamaz, tek buton durum paleti (birincil/ikincil/yıkıcı × aktif/pasif/yükleniyor).

**Kapsam dışı (eklenmez):** AI scheduling · tam ekran scheduling assistant · oda öneri motoru · kat planı/oda haritası · çoklu oda rezervasyonu · sürükle-bırak taşıma · gelişmiş takvim paylaşımı · etkinlik gizlilik seviyeleri · toplantı şablonları · dosya ekleri · online toplantı entegrasyonu · analitik/dashboard · check-in/no-show · kullanıcı bazlı zaman dilimi · resmî tatil takvimi · undo · etkinlik hatırlatıcısı.

---

## 9. DO NOT REOPEN

Bunlar **kapanmıştır**; yeniden exploration'a açılmaz (yalnız küçük polish yapılabilir):

- **Poppins** tipografi kararı
- **#0058B8** marka rengi ve kullanım sınırı
- **Genel ürün kapsamı** (§8 kuralları ve kapsam dışı liste)
- **Room Picker S2 — Uygun Saat Çipleri**
- **Embedded Constraint System** (`Constraint as State, not Alert as Component`)
- **Onaylanan Main Calendar base**: kabuk + sol panel + toolbar + week grid + M3.1 etkinlik bloğu + B3 popover

Yeni bir görsel yön, yeni bir etkinlik bloğu modeli veya yeni bir uyarı bileşeni **üretilmez**.

---

## 10. FILE MAP

| Dosya | Statü | İçerik |
|---|---|---|
| `docs/takvim/23-CURRENT-HANDOFF.md` | **CURRENT** | bu doküman |
| `Narbulut Calendar - Final Screens.dc.html` | **CURRENT — ana çalışma alanı** | 7 kanonik ekran + review navigatörü + audit notları |
| `Narbulut Calendar Prototype.dc.html` | **CURRENT** | tıklanabilir akış: slot → Quick Create → Drawer → Room Picker → çakışma → çözüm → kayıt → takvimde etkinlik. Motion tokenları burada yaşıyor. |
| `Narbulut Calendar.dc.html` | **ARCHIVE** | tüm exploration: `dirA–dirD` (ilk 4 yön), C v2, `dirE/F/G` (hibrit + workspace), `dirT/dirU` (etkinlik bloğu M1–M4, M3.1–M3.4), `dirR/dirS` (popover A–E, B1–B3), `dirX` (oda seçici S1–S4), `dirV/dirY` (kanonik set). **Canonical değil.** |
| `assets/narbulut-logo.png` | CURRENT | tek gerçek marka varlığı |
| `uploads/` | referans | kullanıcının yüklediği logo + mevcut panel/takvim ekran görüntüleri |
| `support.js` | runtime | dokunulmaz |
| `DECISIONS.md`, `04-scope-closure.md`, `10–19 specs`, `20-ux-flows.md` | **YOK (bu projede)** | kullanıcıdan istenmeli; geldiğinde §2 sırası geçerli |

---

## 11. NEXT TASK

**Sıradaki iş:** yeni `Final Screens` çalışma alanında ekranları birbirinden ayırmak (✅ yapıldı), kanonik tasarımları oraya taşımak (✅ yapıldı) ve **sonrasında ekran ekran polish yapmak** (⬅ buradan devam).

İlk detaylı polish sırası:

1. **02 Etkinlik**
2. **03 Oda Seç (S2)**
3. **04 Odalar**
4. **05 İzinler**
5. **06 Talepler**
6. **07 Mobil**

**01 Ana Takvim** yalnız gerekiyorsa son mikro polish alır — yeniden tasarlanmaz.

---

## 12. HANDOFF RULE

Yeni oturum **ilk açılışta tasarım üretmeye başlamaz.**

Sıra:
1. Bu handoff'u ve (varsa) §2'deki source-of-truth dosyalarını oku.
2. Üç HTML dosyasını (Final Screens · Prototype · Archive) gözden geçir.
3. Kullanıcıya bir **Handoff Understanding Summary** sun: mevcut aşama, kanonik kararlar, ekran statüleri, sıradaki iş ve varsa açık sorular.
4. **Kullanıcı onayladıktan sonra** polish çalışmasına başla.
