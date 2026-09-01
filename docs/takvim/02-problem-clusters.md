# FAZ 2B · Adım 1 — Problem Cluster Map

**Tarih:** 2026-08-27 · **Durum:** ✅ **ONAYLANDI** (v2 — kategori sınıflandırması ve S1/S2/S3 kararları işlendi)
**Girdiler:** `00-current-state-audit.md` rev.3 FINAL · `01-competitor-capability-map.md` v2 FINAL
**Sonraki adım:** Cluster onayından sonra her cluster için 2–3 kapsam seviyesi (A/B/C) üretilecek

> ⚠️ **Bu doküman candidate listesi DEĞİLDİR.** Çözüm alternatifi, kapsam seviyesi, değer/karmaşıklık puanı ve öneri **içermiyor**.
> Yalnızca problemleri kümelere ayırıyor ve bağımlılıklarını gösteriyor.

---

## 1. Cluster'ları nasıl kurdum

Üç kural uyguladım:

**Kural 1 — Zinciri koru, parçalama.**
Benchmark, bazı "özellik"lerin aslında tek bir zincirin halkaları olduğunu gösterdi. `01-...map.md` Bölüm 13 bunu listeliyor. Örneğin oda kapasitesi, kat, özellik ve Room Finder beş bağımsız özellik değil; **Oda Veri Modeli → Oda Keşfi** zincirinin parçaları. Bu yüzden cluster sınırlarını *zincir sınırlarına* göre çizdim.

**Kural 2 — "Temel" cluster'ları ayrı tut.**
Üç cluster başka cluster'ların **ön koşulu**: Oda Veri Modeli, İzin Modeli, Çalışma Zamanı Kuralları. Bunlar tek başlarına kullanıcıya görünür değer üretmeyebilir ama üzerlerine kurulan her şeyin tavanını belirliyorlar. Ayrı tuttum ki kapsam kararı alırken "önce hangisi" sorusu görünür olsun.

**Kural 3 — Bulgunun *yerini* değil *doğasını* esas al.**
Örneğin UX-50 (oda sihirbazında erken "oluşturuldu" mesajı) fiziksel olarak Odalar ekranında. Ama doğası bir **durum iletişimi** problemi, oda yönetimi problemi değil. Bu yüzden birincil cluster'ı PC-12; PC-08'de çapraz referans olarak duruyor.

**Kapsam dışı bıraktıklarım:** Grup B UNKNOWN'ları (B-01…B-19). D-007 gereği çözülmeyecekler, cluster'lanmadılar.

---

## 2. Cluster haritası ve bağımlılıklar

```
                          TEMEL KATMAN (ön koşullar)
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │ PC-06              │  │ PC-08              │  │ PC-11              │
   │ Çalışma Zamanı     │  │ Oda Veri Modeli    │  │ İzin & Erişim      │
   │ Kuralları          │  │ ve Yönetimi        │  │ Modeli             │
   └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘
             │                       │                       │
     ┌───────┼───────────┐           │            ┌──────────┼──────────┐
     ▼       ▼           ▼           ▼            ▼          ▼          ▼
┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PC-01   │ │ PC-07        │ │ PC-09        │ │ PC-10        │ │ PC-13        │
│ Takvim  │ │ Katılımcı ve │ │ Oda Keşfi ve │ │ Rezervasyon  │ │ Bildirim ve  │
│ Kabuğu  │ │ Scheduling   │ │ Rezervasyon  │ │ Kuralları ve │ │ E-posta      │
└─────────┘ └──────────────┘ └──────────────┘ │ Onay         │ └──────────────┘
                                    ▲          └──────┬───────┘        ▲
                                    └─────────────────┘                │
                                                                       │
   BAĞIMSIZ / YATAY                                                    │
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ PC-02   │ │ PC-03    │ │ PC-04    │ │ PC-05    │ │ PC-14    │ │ PC-12        │
│ Etkinlik│ │ Taksonomi│ │ Etkinlik │ │ Tekrar ve│ │ Arama    │ │ Sistem       │
│ Gösterim│ │ Renk     │ │ Oluşturma│ │ Seri     │ │          │ │ Durumları ───┘
└─────────┘ └────┬─────┘ └────┬─────┘ └──────────┘ └──────────┘ └──────────────┘
                 │            │                                  (her cluster'a
                 └────────────┘                                   dokunuyor)
                  PC-03, PC-04'ün                    ┌──────────────┐
                  alan setini belirliyor             │ PC-15        │
                                                     │ Tasarım Dili │
                                                     └──────────────┘
```

**Okunuşu:** Ok, "önce bu çözülmeden diğeri tam çözülemez" demek. Örneğin PC-09 (Oda Keşfi) PC-08 (Oda Veri Modeli) olmadan sadece yüzeysel çözülebilir — çünkü filtreleyecek veri yok.

---

## 2.1 Cluster kategorileri

> Kullanıcı kararı (2026-08-27). Kategori, cluster'ın **nasıl değerlendirileceğini** belirler.

### 🟦 Direct UX / Product Problems
Son kullanıcının doğrudan hissettiği problemler. Değeri kendi başına ölçülür.

`PC-01` Takvim Kabuğu · `PC-02` Etkinlik Gösterimi · `PC-03` Taksonomi & Renk · `PC-04` Etkinlik Oluşturma · `PC-05` Tekrar & Seri · `PC-07` Katılımcılar & Scheduling · `PC-09` Oda Keşfi & Rezervasyon · `PC-10` Rezervasyon Kuralları & Onay ⚠️

### 🔷 Foundation / Enablers
**Son kullanıcı feature'ı gibi değerlendirilmez.** Değeri, *mümkün kıldığı üst seviye deneyimler* üzerinden ölçülür. Tek başlarına ekranda görünmeyebilirler.

`PC-06` Çalışma Zamanı Kuralları · `PC-08` Oda Veri Modeli & Yönetimi · `PC-11` İzin & Erişim Modeli

**Korunacak bağımlılık zincirleri:**
```
PC-08 Oda Veri Modeli → oda müsaitliği → PC-09 Oda Keşfi → PC-10 Rezervasyon Kuralları & Onay
PC-11 İzin Modeli     → free/busy      → PC-07 Scheduling
PC-11 İzin Modeli     → "kim rezerve edebilir" → PC-09 → "kim onaylar" → PC-10
PC-06 Çalışma Zamanı  → müsaitlik hesabı → PC-07 · PC-10 · PC-01 (görsel bastırma)
```

### 🟨 Cross-cutting Capabilities
Tek bir ekrana ait değil; modül geneline yayılıyor.

`PC-12` Sistem Durumları & Geri Bildirim · `PC-13` Bildirim & E-posta · `PC-14` Arama & Bulunabilirlik

### 🟪 Design Brief Inputs
FAZ 2B'de candidate/kapsam seviyesi **üretilmez**. Doğrudan FAZ 6 — Design Brief girdisi olarak taşınır.

`PC-15` Tasarım Dili & Yatay Tutarlılık

---

## 3. Cluster'lar

### PC-01 · Takvim Kabuğu ve Yön Bulma

**Problem:** Kullanıcı takvime girdiğinde "neredeyim, bugüne nasıl dönerim, hangi aralığa bakıyorum" sorularını cevaplayamıyor; ızgara günün başında açıldığı için ilk gördüğü şey boş gece saatleri.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-01 (Bugün yok) · UX-02 (aralık etiketi ve navigasyon yok) · UX-03 (iki zaman bağlamı) · UX-04 (00:00'da açılma) · UX-05 (zayıf bugün göstergesi) · UX-09 (saat etiketleri) · UX-11 (görünüm anahtarında karışık taksonomi) · UX-13 (Pazar-başı hafta) · UX-15 (sol rail alan kullanımı) |
| IA | IA-06 (üst bardaki takvim ikonu) |
| Aday | U-01 · U-02 · U-10 |
| Korunacak | KEEP-03 (sol rail'in dört filtreleme ekseni) |
| Belirsiz | A-11 (timezone ihtiyacı) |

**Benchmark teması:** T-1. `[O]` Notion `T` kısayolu; Outlook/Google toolbar yerleşimi `[I]`.
**Bağımlılık:** PC-06 (mesai saati verisi) — mesai vurgusu için.
**Not:** Bu cluster'daki çoğu madde **pattern seviyesinde**, feature seviyesinde değil (bkz. benchmark Bölüm 13, satır 1).

---

### PC-02 · Etkinlik Gösterimi ve Izgara Yoğunluğu

**Problem:** Etkinlik chip'i yalnızca kırpılmış bir başlık taşıyor; saat, oda, katılımcı ve durum görünmüyor. 15 dakikalık varsayılan süre chip'i okunamayacak kadar inceltiyor. Yoğun bir takvimin nasıl davrandığı bilinmiyor.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-07 (mesai/hafta sonu ayrımı yok) · UX-08 (all-day şeridi belirsiz) · UX-10 (chip bilgi yoksunluğu) · UX-12 (mini takvimde yoğunluk göstergesi yok) · UX-21 (gri chip'in anlamı) |
| Aday | U-04 (sürükle-bırak/resize) · U-05 (hover önizleme) · U-06 (tüm gün ve çok günlü) |
| Belirsiz | *(yoğun render davranışı Grup B'de — çözülmeyecek)* |

**Benchmark teması:** T-1, kısmen T-10.
**Bağımlılık:** PC-03 (chip'in rengi ve tipi nereden geliyor?), PC-06 (mesai vurgusu).
**Not:** UX-08 hâlâ `[I]`; all-day şeridinin mevcut olup olmadığı bilinmiyor. Bu cluster'da **yeniden tasarlanacağı için** bu belirsizlik bloke edici değil (D-006).

---

### PC-03 · Etkinlik Taksonomisi, Takvimler ve Renk

**Problem:** "Toplantı" ile "Etkinlik" arasındaki fark tanımsız; filtre lejantı ızgaradaki renklerle eşleşmiyor; renk en az üç ayrı kaynaktan geliyor (tip, özel takvim, kullanıcının serbest seçimi) ve önceliği belirsiz. Yani **sistemde kaç tür varlık olduğu ve nasıl kodlandığı** belli değil.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-18 (ayırt edilemeyen filtre etiketleri) · UX-19 (lejant ≠ chip rengi) · UX-20 (üç renk kaynağı) · UX-21 (gri chip) · UX-22 (filtre kontrolleri) · UX-14 (akordeon durum özeti) · UX-36 ("Özel Takvim Adı" label/kontrol) |
| Fonksiyonel | FN-01 (özel takvim oluşturma kırık — HTTP 500) |
| Korunacak | KEEP-08 (özel takvim + renk kavramı) |
| Belirsiz | **A-05** (Toplantı ≠ Etkinlik gerçek bir iş ayrımı mı?) · **A-06** (Özel Takvim nedir?) · A-13 (renk önceliği ne olmalı?) |

**Benchmark teması:** T-10. İncelenen ürünlerde çakışan çoklu renk kaynağına rastlanmadı `[I]`.
**Bağımlılık:** Yok, ama **PC-04'ün alan setini belirliyor** — form neyi soracak, önce bu netleşmeli.
**⚠ FAZ 3 blokajı:** A-05 ve A-06 cevaplanmadan bu cluster'ın çözümü tasarlanamaz. Bunlar iş kuralı soruları, tasarım soruları değil.

---

### PC-04 · Etkinlik Oluşturma ve Düzenleme

**Problem:** Formda tarih değiştirilemiyor ve bitiş tarihi hiç yok. Görsel hiyerarşi ters — kozmetik "Renk Değiştir" birincil alan "Konu"nun üstünde. Üç koyu buton birincil aksiyon gibi görünüyor. Saat seçiciler dropdown. Üç katılımcı kavramı üst üste. Mevcut bir etkinliğin düzenlenip düzenlenemediği bile doğrulanmadı.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-23 (tarih değiştirilemiyor) · UX-24 (bitiş tarihi yok) · UX-25 (ters hiyerarşi) · UX-26 (çoklu birincil buton) · UX-27 (belirsiz tip kontrolü) · UX-28 (dropdown saat) · UX-29 (15 dk varsayılan) · UX-31 (oda ↔ lokasyon ilişkisi) · UX-32 (üç katılımcı kavramı) · UX-33 (etiketsiz `(+)`) · UX-34 · UX-35 · UX-37 · UX-38 |
| Fonksiyonel | FN-06 (zorunlu alan işareti / hata satırı yok) · FN-13 (düzenleme/silme doğrulanmadı) |
| Aday | U-17 (kopyalama/şablon) · U-18 (ek dosya) · U-19 (online toplantı linki) |
| Korunacak | KEEP-06 (iç/misafir ayrımı) · KEEP-07 ("Ben de katılıyorum") · KEEP-12 (drawer kalıbı) |
| Belirsiz | **A-09** (etkinliği kim düzenleyebilir/silebilir? — iş kuralı) |

**Benchmark teması:** T-2. Google `[O]`, Notion `[O]`, Outlook `[I]`.
**Bağımlılık:** PC-03 (hangi alanlar olacak), PC-09 (oda seçimi formun içinden tetikleniyor), PC-07 (katılımcı seçimi).
**Not:** UX-30 (Oda Seç checkbox'ı) burada değil, **PC-09'da** — çünkü doğası oda keşfi problemi.

---

### PC-05 · Tekrar ve Seri Yönetimi

**Problem:** Tekrarlayan etkinlik yok; her etkinlik tek tek oluşturuluyor. Bu eklenirse beraberinde bir seri düzenleme sözlüğü ve durum modeli getiriyor.

| Tip | Audit ID'leri |
|---|---|
| Fonksiyonel | FN-04 (recurrence yok) |
| İç aday | C-2 (HTML taslağındaki recurrence önerisi) |
| Aday | U-11 (seri düzenleme: bu / bu ve sonrakiler / tümü) |

**Benchmark teması:** T-11. Üçlü kapsam seçimi bu sette güçlü ortak yaklaşım (Google `[O]`, Outlook `[I]`). **Google'ın kendi dokümanı platformlar arası etiket tutarsızlığını kabul ediyor `[O]`** — sözlük önceden sabitlenmeli.
**Bağımlılık:** PC-04 (form alanı), PC-09 (tekrarlayan etkinlikte oda çakışması nasıl hesaplanır?), PC-10 (tekrarlayan rezervasyon onayı seri bazında mı, örnek bazında mı?).
**Not:** Küçük görünen ama **bağımlılığı en yüksek** cluster'lardan biri. Kapsam kararı, PC-09 ve PC-10'un karmaşıklığını doğrudan değiştiriyor.

---

### PC-06 · Çalışma Zamanı Kuralları  🔷 TEMEL

**Problem:** Mesai saati, tatil ve geçmiş tarih kavramlarının hiçbiri yok. Geçmiş tarihe etkinlik oluşturmak engellenmiyor (2020-01-01 kabul edilmiş). Bu, hem takvimin görsel okunabilirliğini hem müsaitlik hesabını hem rezervasyon kurallarını besleyen bir **veri katmanı**.

| Tip | Audit ID'leri |
|---|---|
| Fonksiyonel | FN-02 (geçmiş tarih engellenmiyor) · FN-07 (tarih/süre doğrulaması bilinmiyor) |
| UX | UX-07 (mesai/hafta sonu görsel ayrımı yok) |
| İç aday | C-6 (resmi tatiller) · C-7 (mesai dışı rezervasyon engeli) |
| Aday | U-08 (mesai saati tanımı) |

**Benchmark teması:** Google'ın **"Working hours & location"** ayarı `[O]` ve Outlook'un mesai dışını açık gri gösterimi `[O]` aynı şeyi söylüyor: **mesai saati görsel bir vurgu değil, müsaitlik hesabının girdisi.**
**Beslediği cluster'lar:** PC-01 (görsel bastırma), PC-02, PC-07 (öneri motoru), PC-10 (mesai dışı rezervasyon kısıtı).
**Not:** Tek başına kullanıcıya görünür bir "özellik" değil — ama üç cluster'ın tavanını belirliyor.

---

### PC-07 · Katılımcılar ve Scheduling

**Problem:** Katılımcı ekleniyor ama ne davet üretiyor mu, ne müsaitlik gösteriliyor, ne yanıt alınıyor. Zorunlu/opsiyonel ayrımı yok. "1 Katılım" bir sayı gösteriyor ama yanıt arayüzü yok.

| Tip | Audit ID'leri |
|---|---|
| Fonksiyonel | FN-08 (katılımcı çakışma kontrolü) · FN-14 (davet/RSVP doğrulanmadı) |
| UX | UX-32 (üç katılımcı kavramı — çapraz: PC-04) |
| Aday | U-12 (RSVP) · U-13 (free/busy) · U-14 (önerilen saat) · U-15 (zorunlu/opsiyonel) |
| Korunacak | KEEP-06 · KEEP-07 |
| Belirsiz | **A-02** (kullanıcılar birbirlerinin takvimini görebiliyor mu?) |

**Benchmark teması:** T-4, T-7. **Zincir:** `Free/busy altyapısı → Scheduling Assistant → Suggested times` — üç ayrı kapsam seviyesi (benchmark Bölüm 13, satır 5).
**Bağımlılık:** **PC-11 (izin modeli)** — benchmark'ın en net bulgusu: *free/busy, karşı tarafın takvimini paylaşmasına bağlı; paylaşım yoksa özellik sessizce boş çalışıyor.* Yani **izin modeli olmadan scheduling çalışmaz.** Ayrıca PC-06 (mesai saatleri öneri motorunun girdisi).
**⚠ FAZ 3 blokajı:** A-02 cevaplanmadan bu cluster'ın kapsamı belirlenemez.

---

### PC-08 · Oda Veri Modeli ve Yönetimi  🔷 TEMEL

**Problem:** Odanın yalnızca üç alanı var (ad, lokasyon, açıklama). Kapasite, donanım, kat/bina, rezervasyon kuralı — hiçbiri yok. Erişim varsayılan olarak herkese açık. Oluşturulan bir odanın düzenlenip düzenlenemediği görünmüyor. Sihirbaz üç adımda 3 metin alanı + 1 checkbox + 2 dropdown topluyor.

| Tip | Audit ID'leri |
|---|---|
| IA | IA-02 (iki anlamda "Odalar") · IA-04 (create-first sekme) · IA-05 ("Nasıl Kullanılır?" paneli) |
| UX | UX-41 (sihirbaz ağırlığı) · UX-42 (satır aksiyonu yok) · UX-44 (sıralama anahtarı) · UX-45 (boş durum) · UX-46 (izin kolonları) · UX-47 (alan kullanımı) · UX-48 (yazım hatası) · UX-49 (değiştirilemeyen politika metni) · UX-52 (etiket uyuşmazlığı) · UX-53 (alan adı tutarsızlığı) |
| Fonksiyonel | FN-11 (paylaşımlı oda semantiği) · FN-16 (rezervasyon kuralı kavramı yok) · FN-17 (varsayılan herkese açık) |
| Aday | U-21…U-24 (kapasite, donanım, hiyerarşi, fotoğraf) · U-27 (düzenleme/silme) · U-29 (oda durumu) |
| Korunacak | KEEP-05 (herkese açık ↔ belirli grup ikiliği) |
| Belirsiz | **A-07** (paylaşımlı oda = "tüm kullanıcılar erişebilir" mi?) |
| Çapraz | UX-50, UX-51 → birincil cluster PC-12 |

**Benchmark teması:** T-3. **En net benchmark dersi:** Microsoft'un dokümanı, City/Floor/Capacity doldurulmazsa Room Finder filtrelerinin çalışmadığını açıkça yazıyor `[O]`. **Oda arama deneyimi, oda veri modelinin doğrudan fonksiyonudur.**
**Beslediği cluster'lar:** PC-09 (keşif), PC-10 (kural ve onay).
**Not:** Kapasite/kat/özellik burada **beş bağımsız özellik değil, tek bir veri modeli kararı.**

---

### PC-09 · Oda Keşfi ve Rezervasyonu

**Problem:** Odayı görmek için önce bir checkbox işaretlemek gerekiyor. Oda ile Lokasyon'un ilişkisi tanımsız. Çakışma kontrolü yok — aynı oda aynı saatte iki kez rezerve edilebiliyor. "Odalara Göre" görünümü var ama içeriği ve çakışmayı gösterip göstermediği bilinmiyor.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-30 (Oda Seç checkbox) · UX-31 (oda ↔ lokasyon) |
| Fonksiyonel | FN-03 (oda çakışma kontrolü yok) · FN-12 ("Odalara Göre" içeriği bilinmiyor) |
| İç aday | C-3 (çakışma kontrolü önerisi) |
| Aday | U-25 (room finder) |
| Korunacak | KEEP-02 (kaynak ekseni görünümünün varlığı) |
| Belirsiz | **A-08** ("Odalara Göre"nin mevcut iş değeri) |

**Benchmark teması:** T-4. **Zincir:** `Oda veri modeli → Oda müsaitliği → Room Finder`. Dört farklı felsefe gözlemlendi: filtrele (Outlook) / öner (Google, Robin) / haritadan seç (Envoy) / ızgaradan seç (Skedda).
**Bağımlılık:** **PC-08 zorunlu ön koşul.** Filtrelenecek veri yoksa keşif yüzeysel kalır. Ayrıca PC-04 (form içinden tetikleniyor), PC-05 (tekrarlayan etkinlikte çakışma).
**Not:** Öneri motoru katmanı (Google/Robin) `[O]` ama **her ikisinde de admin/ürün ayarına bağlı** (benchmark 6.1).

---

### PC-10 · Rezervasyon Kuralları ve Onay

> ⚠️ **CONDITIONAL — FAZ 3 BUSINESS VALIDATION REQUIRED**
> **Karar (S3):** FAZ 2B'de kapsam seviyeleri üretilecek, **ancak FAZ 3'te iş gereksinimi doğrulanmadan seçilmiş özellik kabul edilmeyecek.** Bu cluster'ın tamamı AKM'nin kamu kurumu ihtiyacından doğuyor ve D-002 gereği bu otomatik requirement değildir. Gerekçe (kapsam seviyesi yine de üretiliyor): PC-08'in kapsam kararı, PC-10'un gerekip gerekmediğine bağlı — önce görmek gerekiyor.

**Problem:** Rezervasyon onay akışı hiç yok. Odada onay gerekliliği, maksimum süre, önden rezervasyon penceresi gibi hiçbir kural alanı bulunmuyor. Etkinlik durumu kavramı (beklemede/onaylı/reddedildi) mevcut değil.

| Tip | Audit ID'leri |
|---|---|
| Fonksiyonel | FN-05 (onay akışı yok) · FN-16 (kural alanı yok — çapraz: PC-08) |
| İç aday | C-4 (Rezervasyon Talepleri alt sekmesi — HTML'in tek "YENİ" maddesi) |
| Aday | U-26 (rezervasyon kuralları) · U-31 (etkinlik durumu) · U-34 (oda seviyesinde onay bayrağı) |
| Belirsiz | **A-01** (oda erişim yetkisi ne veriyor?) |

**Benchmark teması:** T-5. **En değerli tekil fikir Skedda'dan `[O]`:** kurallar *önleyici*, onay *insan kararı* — ve iyi kurulmuş kurallar onay yükünü azaltır. Durum makinesi dört durumlu (Pending → Approved / Rejected / Cancelled). Onaylayan, onaylamadan önce düzenleyebiliyor. Red notu opsiyonel ama var.
**Bağımlılık:** **PC-08** (odada kural alanları olmalı) + **PC-11** (kim onaylar?) + PC-13 (dört durum değişimi de bildirim üretiyor) + PC-05 (seri rezervasyonda onay nasıl işler?).
**⚠ Not:** C-4, HTML taslağındaki tek "YENİ" madde.

---

### PC-11 · İzin ve Erişim Modeli  🔷 TEMEL

**Problem:** İzinler sekmesi arayüzde var ama pasif. Yetki yönetiminin tek girişi oda oluşturma sihirbazı. Model **tipsiz bir erişim listesi** — "görüntüle / rezerve et / onayla / düzenle" ayrımı yok. Kullanıcıların birbirlerinin takvimini görüp göremediği bilinmiyor.

| Tip | Audit ID'leri |
|---|---|
| IA | IA-01 (pasif İzinler sekmesi) · IA-03 (yönetim ve günlük kullanım aynı seviyede) |
| Fonksiyonel | FN-09 (İzinler pasif) · FN-10 (ACL, matris değil) |
| İç aday | C-1 (rol × yetki matrisi) |
| Aday | U-16 (etkinlik gizliliği) · U-30 (paylaşılan takvim / delegasyon) |
| Korunacak | KEEP-04 ⚠ (ACL kavramı — rev.3'te zayıfladı) · KEEP-11 (grup bazlı yetkilendirme) |
| Belirsiz | **A-01** (erişim ne veriyor?) · **A-02** (takvim paylaşımı) · **A-03** (panel/tenant/rol yapısı) |

**Benchmark teması:** T-6, T-7. **Zincir:** `tipsiz ACL → tipli yetki (görünürlük ≠ rezervasyon) → rol matrisi` — üç kapsam seviyesi. Skedda'nın açık ifadesi `[O]`: *"bir mekânı görebilmek onu rezerve edebilme yetkisi anlamına gelmez."*
**Beslediği cluster'lar:** PC-07 (free/busy), PC-09, PC-10 (onaylayan kim).
**⚠ rev.3 uyarısı:** HTML taslağı C-1 için *"Odalar sihirbazıyla aynı yetki modelini paylaşır"* diyor — **bu artık yanlış olarak biliniyor.** Mevcut model tipsiz; matris yeni bir model demek. C-1'in karmaşıklığı yukarı revize edilmeli.
**⚠ FAZ 3 blokajı:** A-01, A-02, A-03 cevaplanmadan bu cluster'ın kapsamı belirlenemez. **En çok FAZ 3 bağımlılığı olan cluster.**

---

### PC-12 · Sistem Durumları ve Geri Bildirim

**Problem:** Audit'in 1 numaralı bulgusu. Modülde durum iletişimi güvenilmez: bir yerde hata sessizce yutuluyor (HTTP 500'de kullanıcıya hiçbir şey denmiyor), başka bir yerde işlem bitmeden "Tebrikler, oluşturuldu!" deniyor. İki uçta da kullanıcı gerçek durumu bilmiyor.

| Tip | Audit ID'leri |
|---|---|
| Geri bildirim | FB-01 (sessiz hata — **Kritik**) · FB-02 · FB-03 · FB-04 · FB-05 · FB-06 · FB-07 · FB-08 |
| UX | UX-39 (dört farklı birincil buton görünümü) · UX-50 (erken başarı mesajı) · UX-51 (eksik gözden geçirme) |
| Fonksiyonel | FN-01 (HTTP 500) · FN-06 (validasyon işaretleri yok) |
| UX | *(devam)* UX-16 (boş "Takvimlerim" durumu açıklamasız) — ✅ karar: PC-12'ye bağlandı |
| Aday | U-32 (undo) |
| Belirsiz | **A-10** (HTTP 500 bu çalışmanın kapsamında mı?) |

**Benchmark teması:** T-9. Rakiplerde durum makinesi açık ve **her geçiş bildirim üretiyor** — Skedda dört anın dördünde de `[O]`.
**Bağımlılık:** Yok — ama **her cluster'a dokunuyor.** Yatay bir cluster.
**Not:** UX-39 (buton dili) burada mı PC-15'te mi tartışılır. Ben burada tuttum çünkü asıl problem *estetik tutarlılık değil, durum okunabilirliği*: pasif/aktif ayrımı okunamıyor.

---

### PC-13 · Bildirim ve E-posta

**Problem:** Platformda "Bildirimler" menüsü var ama takvimin buna bağlı olup olmadığı bilinmiyor. Takvimden herhangi bir e-posta çıkıp çıkmadığı da bilinmiyor.

| Tip | Audit ID'leri |
|---|---|
| Fonksiyonel | FN-15 (takvim bildirimi/e-postası doğrulanmadı) · FN-14 (davet üretiliyor mu?) |
| İç aday | C-5 (hatırlatıcı/bildirim — nottaki kanca: *"zaten Bildirimler menüsü var"*) |
| Korunacak | KEEP-09 (platform kabuğuyla bütünlük) |
| Belirsiz | **A-04** (mevcut notification/email entegrasyonu) |

**Benchmark teması:** T-8. Olay sınıfları bu sette büyük ölçüde örtüşüyor; asıl tasarım problemi **hangi olayın kime gideceği**. Gürültü kontrolü birinci sınıf mesele (Outlook'un "sadece değişen katılımcılara gönder" `[O]`, Skedda'nın "mekân bildirimlerini kapat" `[O]`).
**Bağımlılık:** PC-10 (rezervasyon durum değişimleri), PC-07 (davet/RSVP), PC-05 (seri değişikliğinde kime ne gider?).
**⚠ FAZ 3 blokajı:** A-04 cevaplanmadan bu cluster'a girilemez. FAZ 8'in tamamı buna bağlı.

---

### PC-14 · Arama ve Bulunabilirlik

**Problem:** Gözlemlenen hiçbir yüzeyde arama yok — ne etkinlik araması, ne oda araması, ne global arama.

| Tip | Audit ID'leri |
|---|---|
| UX | UX-17 (takvimde arama yok) · UX-43 (oda listesinde arama yok) |
| Aday | U-03 (etkinlik araması) · U-28 (oda listesinde arama) |

**Bağımlılık:** PC-08 (oda araması neyi arayacak? — veri modeline bağlı).
**✅ Karar (S1):** Ayrı cluster olarak kalıyor. Gerekçe: arama bir yüzey değil, modül geneline yayılan bir yetenek; dağıtılırsa iki yerde yarım çözülme riski var. Kategori: 🟨 Cross-cutting.

---

### PC-15 · Tasarım Dili ve Yatay Tutarlılık

**Problem:** Modül içinde yoğunluk ve görsel dil tutarsız. Dark mode ve responsive davranış bilinmiyor.

| Tip | Audit ID'leri |
|---|---|
| Genel | GN-01 (© 2022) · GN-02 (yoğunluk tutarsızlığı) · GN-03 (dark mode) · GN-04 (responsive) |
| Aday | U-33 (mobil/responsive) |
| Korunacak | KEEP-09 (platform kabuğu) · KEEP-01 (modül iskeleti) · KEEP-10 (onboarding niyeti) |
| Belirsiz | **A-12** (mobil/responsive gereksinim var mı?) |

**Bağımlılık:** Yok; yatay.
**✅ Karar (S2):** 🟪 **Design Brief Input.** FAZ 2B'de candidate veya kapsam seviyesi **üretilmeyecek**; doğrudan FAZ 6 — Design Brief girdisi olarak taşınacak.

---

## 4. Kapsam denetimi — hiçbir bulgu kaybolmadı

| Tip | Toplam | Cluster'lanan | Kapsam dışı | Gerekçe |
|---|---|---|---|---|
| **IA** | 6 | 6 | 0 | — |
| **UX** | 53 | 51 | 2 | UX-06, UX-40 |
| **FB** | 8 | 8 | 0 | — |
| **FN** | 17 | 17 | 0 | — |
| **GN** | 4 | 4 | 0 | — |
| **A (Grup A UNKNOWN)** | 13 | 13 | 0 | Hepsi bir cluster'a bağlandı; FAZ 3'te sorulacak |
| **B (Grup B UNKNOWN)** | 19 | 0 | 19 | **D-007 gereği çözülmeyecek** |
| **C (iç aday)** | 8 | 8 | 0 | — |
| **U (doğrulanmamış aday)** | 34 | 33 | 1 | U-09 |
| **KEEP** | 12 | 12 | 0 | İlgili cluster'lara "korunacak" olarak bağlandı |

**Kapsam dışı bırakılan 3 madde ve gerekçeleri:**

| ID | Neden cluster'lanmadı |
|---|---|
| **UX-06** ("şimdi" çizgisi) | Grup B'ye taşınmıştı — mevcut durumu bilinmiyor, yeni tasarımda PC-01/PC-02 içinde zaten yeniden karar verilecek |
| ~~**UX-16**~~ | ✅ **Karar: PC-12 System States altına bağlandı.** Artık kapsam dışı değil. |
| **UX-40** (drawer'daki 25/08 tarih tutarsızlığı) | Grup B — doğrulanmamış legacy davranış |
| **U-09** (ICS import/export, harici takvim aboneliği) | Hiçbir audit problemine bağlanmıyor. **"Rakipte var" tek başına candidate oluşturmaz** kuralı gereği ayrı tutuldu (bkz. Bölüm 6) |

---

## 5. Yapısal kararlar (kullanıcı, 2026-08-27)

**S1 ✅ — PC-14 (Arama) ayrı cluster olarak kalıyor.**
İki audit ID'si var. Alternatif: takvim araması PC-01'e, oda araması PC-08'e dağıtılır. **Önerim: ayrı kalsın** — çünkü arama bir *yüzey* değil, modül geneline yayılan bir yetenek; dağıtılırsa iki yerde yarım çözülme riski var.

**S2 ✅ — PC-15 için FAZ 2B'de kapsam seviyesi ÜRETİLMEYECEK; Design Brief Input.**
İçeriğinin çoğu FAZ 6 ve FAZ 7'nin girdisi; A/B/C kapsam seviyesi üretmek şu aşamada anlamsız olabilir. **Önerim: PC-15 için candidate üretmeyelim**, doğrudan FAZ 6 brief'ine girdi olarak taşıyalım.

**S3 ✅ — PC-10 FAZ 2B'de kalıyor, CONDITIONAL statüsünde.**
D-002 gereği AKM'nin kamu kurumu ihtiyacı otomatik requirement değil ve bu cluster'ın tamamı o ihtiyaçtan doğuyor. İki yol var: **(a)** FAZ 2B'de kapsam seviyelerini yine de üretelim, FAZ 3'te "gerek yok" dersen düşürürüz; **(b)** FAZ 3'te ihtiyaç doğrulanana kadar hiç dokunmayalım. **Önerim: (a)** — çünkü PC-08'in (oda veri modeli) kapsam kararı, PC-10'un gerekip gerekmediğine bağlı; önce görmek gerekiyor.

---

## 6. FAZ 2B'de bağlayıcı olacak kurallar

Sonraki adımda uyacağım kurallar, buraya yazıyorum ki denetleyebilesin:

1. **"Rakipte var" tek başına candidate oluşturmaz.** Audit karşılığı olmayan her aday **açıkça işaretlenecek** (şu an: U-09, T-12/check-in).
2. **Pattern ile feature aynı seviyede değerlendirilmeyecek** (benchmark Bölüm 13).
3. **Yalnızca Robin/Envoy'a dayanan bir öneri "güçlü benchmark sonucu" sayılmayacak**; yüksek öncelikli bir öneri bu durumdaysa ayrıca belirtilecek.
4. **Koşullu davranışlar** (admin ayarı, plan, tenant) referans verilirken koşulu birlikte yazılacak (benchmark 6.1).
5. **Kesin ürün kararı verilmeyecek.** FAZ 3'e taşınması gereken iş kuralı soruları açıkça `⚠ FAZ 3` olarak işaretlenecek.
6. **Zincirler bozulmayacak.** Kapsam seviyeleri (A/B/C) zincirin halkaları üzerinde kurulacak, bağımsız özellikler olarak değil.

---

## 7. Faz kapısı

**Bu dokümanda yer almayan şeyler:**
❌ Candidate ID'leri · ❌ Çözüm alternatifleri (A/B/C) · ❌ Değer/karmaşıklık puanı · ❌ P0/P1/P2 · ❌ Seçim tablosu · ❌ Product Spec · ❌ Kod

**Durum:** ✅ Cluster yapısı onaylandı. Kapsam seviyeleri `03-solution-options.md` içinde üretiliyor (ilk parti: PC-04, PC-08, PC-09, PC-11).
