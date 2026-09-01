# FAZ 3 — Decision Summary

**Tarih:** 2026-08-28 · **Durum:** FAZ 3 kapanış önerisi sunuldu
**Kaynak:** `DECISIONS.md` D-025 … D-047
**Toplam ürün/iş kararı:** 20 *(bütçe hedefi 12–18; 2 karar üstünde — gerekçe Bölüm 4'te)*

---

## 1. Alınan kararlar

### 1.1 Kapsam ve model temeli

| ID | Karar |
|---|---|
| **D-025** ⚠️ | **Organizasyon = temel çalışma sınırı.** Takvimler, odalar, gruplar, kullanıcılar aynı organizasyon context'inde. Bayi çapraz-organizasyon görünürlüğü ve bayi için bağımsız takvim çekirdek kapsam dışı. **PROVISIONAL** — bayilerin bağımsız takvim/oda kullanımı doğrulanırsa yeniden açılır. |
| **D-046** | **Tek timezone**, organizasyon seviyesinde. Kullanıcı bazlı timezone core scope dışı; ancak model, ileride geçişi zorlaştırmayacak şekilde tasarlanacak. |
| **D-047** | **Responsive, desktop-first.** Mobilde en az 6 temel akış kullanılabilir olmalı; mobil grid birebir küçültme zorunda değil (agenda/day/list uygun). Native app kapsam dışı. |

### 1.2 İzin ve görünürlük

| ID | Karar |
|---|---|
| **D-026** | **Oda erişimi iki tipe ayrılır: Görebilir / Rezerve edebilir.** Rezerve edilemeyen oda listeden kaybolmaz — müsaitlik görünür, aksiyon kapalı. Migration: mevcut erişimler → her ikisi. |
| **D-027** | **Organizasyon içinde varsayılan free/busy.** Yalnızca *müsait / meşgul*; başlık, katılımcı, oda, not görünmez. PC-07'nin temel visibility modeli. Kademeli paylaşım eklenmedi. |
| **D-030** | **Yeni odalar varsayılan olarak herkese açık** (görülebilir + rezerve edilebilir). Kısıtlama istisnadır. |
| **D-041** | **Event-level privacy eklenmez.** Normal/Özel/Gizli seviyeleri yok. Takvimde görünmeyen "gizli" event istenmiyor — free/busy ve conflict detection'ı bozar. |
| **D-042** | **"Onaylayabilir" genel permission tipi olarak eklenmez.** Onaylayıcı, oda seviyesinde tanımlanır — kişi sistem geneli approver değil, belirli odaların onaylayıcısı olur. |
| **D-039** | **Etkinliği organizatör + organizasyon yöneticisi düzenler/siler.** Katılımcılara düzenleme hakkı yok. Oda onaylayıcısının event düzenleme hakkı bundan türemez. |

### 1.3 Oda modeli ve rezervasyon

| ID | Karar |
|---|---|
| **D-028** | **Bina + Kat yapısal modeli, ancak zorunlu değil.** Progressive disclosure: veri tanımlı değilse ilgili filtreler arayüzde gösterilmez. Serbest çoklu etiket sistemi eklenmedi. |
| **D-031** | **Dolu odalar kaybolmaz** — "Dolu" olarak görünür, seçilemez. Sonraki müsait zaman gösterimi şimdilik yok. |
| **D-032** | **Oda oluşturma/düzenleme tek ekran**, bölümlere ayrılmış form. Sihirbaz kaldırılabilir; gözden geçirme işlevi inline özet/doğrulamaya döner. |
| **D-034** ⚠️ | **PC-10 gate AÇILDI. Onay sistemi var, basit ve oda-bazlı.** Odada *Rezervasyon onayı gerekli* açılıp kapatılabilir; onaylayıcı kullanıcı/grup tanımlanır. Akış: **Talep → Beklemede → Onaylandı / Reddedildi.** **Kapsam dışı:** gün bazlı kural, kullanıcı tipine göre policy, süreye göre approval, approval chain, çok aşamalı onay. |
| **D-035** | D-034 türevleri: **(a)** onay açıkken *Rezerve edebilir* fiilen "talep gönderebilir"e döner · **(b)** → D-042 · **(c)** D-034 yalnızca *onay bayrağı + onaylayıcı*'yı açar; **maksimum süre / rezervasyon penceresi / mesai penceresi kural alanları kapsam dışı**. |
| **D-036** | **Bekleyen rezervasyon zaman aralığını geçici olarak tutar.** Oda durumu: **Müsait · Onay bekliyor · Rezerve.** Expiration/auto-cancel mini-spec'te öneri olarak gelecek. |

### 1.4 Etkinlik modeli

| ID | Karar |
|---|---|
| **D-037** | **"Toplantı"/"Etkinlik" ayrımı kaldırılır. Tek "Etkinlik" modeli.** Davranışı kullanılan alanlar belirler. Kategori ihtiyacı çıkarsa event type değil **etiket/kategori sistemi** olarak değerlendirilir. |
| **D-038** | **İki katmanlı oluşturma.** Quick Create (başlık · tarih/saat · Oluştur) → "Daha fazla seçenek" → detaylı form. Drawer/modal davranışı ayrıca netleştirilecek. |
| **D-040** | **Zorunlu / Opsiyonel katılımcı ayrımı eklenir.** İç/harici ayrımı iş modelinde korunur. Üç katmanlı tekrar kaldırılır. ⚠️ İki ayrı dropdown UI requirement **değil**. |
| **D-033** | **Tek "Konum" mantığı.** Oda seçilmişse konum odadan türetilir, çelişen serbest metin oluşamaz; oda yoksa serbest girilir. |
| **D-043** | **Temel recurrence.** Günlük/haftalık/aylık + bitiş tarihi / tekrar sayısı / süresiz. Seri düzenleme: bu / bu ve sonrakiler / tüm seri. Gelişmiş kurallar kapsam dışı. |

### 1.5 Zaman ve bildirim

| ID | Karar |
|---|---|
| **D-045** | **Organizasyon mesai saatleri.** Takvim mesai saatlerine scroll eder, mesai dışını geri plana atar. ⚠️ **Mesai dışı oluşturma engellenmez.** Tatil takvimi ve mesai dışı yasak kapsam dışı. |
| **D-044** | **E-posta + uygulama içi, iki kanal.** Her olayın her iki kanaldan gitmesi requirement değil — dağılım **FAZ 8**'de. Misafir kullanıcılar için e-posta temel kanal. |

---

## 2. Cluster'lar hangi kapsam seviyesine oturdu

| Cluster | Kategori | Oturduğu seviye | Dayanak |
|---|---|---|---|
| **PC-04** Etkinlik Oluşturma | 🟦 | **A + B** *(C dışarıda)* | D-038, D-039, D-040, D-033, D-037 |
| **PC-05** Tekrar & Seri | 🟦 | **Temel** *(gelişmiş kurallar dışarıda)* | D-043 |
| **PC-06** Çalışma Zamanı | 🔷 | **B** *(görsel + navigasyon; C dışarıda)* | D-045 |
| **PC-07** Katılımcılar & Scheduling | 🟦 | **Kısmi** — free/busy katmanı açık; üst katman **açık soru** | D-027, D-040 · ⚠️ P-021 |
| **PC-08** Oda Veri Modeli | 🔷 | **B + C'den ince dilim** *(onay bayrağı + onaylayıcı)* | D-028, D-032, D-034, D-035(c) |
| **PC-09** Oda Keşfi | 🟦 | **B** *(öneri motoru dışarıda)* | D-026, D-028, D-031 |
| **PC-10** Rezervasyon Onayı | 🟦⚠️→✅ | **Basit oda-bazlı** *(rule engine dışarıda)* | D-034, D-036, D-042 |
| **PC-11** İzin Modeli | 🔷 | **B** *(event privacy hariç; C açılmadı)* | D-026, D-027, D-041, D-042 |
| **PC-13** Bildirim & E-posta | 🟨 | **İki kanal onaylandı; matris FAZ 8'de** | D-044 |
| PC-01, 02, 03, 12, 14 | 🟦🟨 | **Kapsam seviyesi henüz üretilmedi** — çoğu mevcut kararlarla ağır şekilde kısıtlandı | — |
| PC-15 Tasarım Dili | 🟪 | **Design Brief Input** — kapsam üretilmiyor | D-018 |

### ⚠️ Türetilmiş varsayım — itiraza açık

**PC-08 B'nin "kapasite + özellikler/donanım" bileşenleri ayrıca sorulmadı.** D-028 (yapısal lokasyon) + D-031 (dolu oda filtreleme) + PC-09 B seçimi bunları kuvvetle ima ediyor ve benchmark'ta çekirdek filtreler bunlar `[O]`. **Varsayım: PC-08 B kapasite ve özellik alanlarını içerir.** İtiraz edilirse PC-09 B'nin filtre kapsamı daralır.

---

## 3. Mini-spec'e bırakılan küçük UX kararları

D-029 gereği ayrı soru olarak sorulmadı; audit + benchmark + alınan kararlar doğrultusunda *recommended davranış* olarak belirlenip mini-spec review'da topluca sunulacak.

**Form ve kontrol davranışı:** tek birincil buton + buton durum dili (`UX-26`, `UX-39`) · zorunlu alan işareti ve alan altı hata satırı (`FN-06`) · saat seçicinin yazılabilir olması (`UX-28`) · varsayılan etkinlik süresi (`UX-29`) · drawer katman/örtüşme düzeltmesi (`UX-38`)

**Takvim kabuğu:** hafta başlangıcının Pazartesi'ye alınması (`UX-13`) · saat etiketi formatı (`UX-09`) · bugün göstergesinin güçlendirilmesi (`UX-05`) · mini takvimde yoğunluk göstergesi (`UX-12`) · sol rail akordeon durum özeti (`UX-14`) · filtre tümünü seç/temizle (`UX-22`) · etkinlik chip bilgi yoğunluğu (`UX-10`)

**Odalar:** liste-öncelikli sekme sırası (`IA-04`) · liste satır aksiyonları (`UX-42`) · varsayılan sıralama anahtarı (`UX-44`) · "Nasıl Kullanılır?" panelinin konumu (`IA-05`) · sıfır kayıtta sayfalama gösterimi (`UX-45`)

**Metin ve durum:** boş durum metinleri ve CTA (`UX-45`, `UX-16`) · terminoloji ve yazım düzeltmeleri (`UX-34`, `UX-35`, `UX-37`, `UX-48`, `UX-52`, `UX-53`) · gözden geçirme özetinin erişim bilgisini göstermesi (`UX-51`)

**Karar notlarından doğan mini-spec konuları:** rezervasyon talebi expiration/auto-cancel (D-036) · seri boyunca oda çakışması ve seri onayı etkileşimi (D-043) · etkinlik silindiğinde oda rezervasyonuna ne olacağı (D-039)

---

## 4. Hâlâ açık — gerçekten blocker olanlar

> Bütçe dolduğu için **soru olarak açılmadı.** İlgili modül spec'inin girişinde çözülmeli.

| ID | Açık karar | Neyi bloke ediyor | Ne zaman çözülmeli |
|---|---|---|---|
| **P-020** | **A-06 — "Özel Takvim" nedir?** Kişisel kategori mi, paylaşılabilir takvim mi? | **PC-03 renk/taksonomi modeli.** D-037 event type'ı kaldırdığı için renk kaynağı artık büyük ölçüde *takvim* — ama takvimin ne olduğu tanımsız. | FAZ 4, Calendar Shell / Taksonomi spec girişinde |
| **P-021** | **PC-07 üst katmanı:** free/busy ötesine geçilecek mi? (formda katılımcı müsaitliği gösterimi, suggested times) | **Scheduling modül spec'i.** D-027 ve D-040 temeli kurdu ama üst katman kararsız. | FAZ 4, Scheduling spec girişinde |
| **P-022** | A-08 ("Odalara Göre" bugün kullanılıyor mu) · A-10 (HTTP 500 bu çalışmanın kapsamında mı) | Düşük etki. A-08, `KEEP-02`'nin geçerliliğini doğrular. | Fırsat oldukça |
| **P-015** | D-025'in doğrulanması: bayilerin bağımsız takvim/oda kullanımı var mı? | D-025 provisional kalmaya devam ediyor | Şirket bilgisi geldiğinde |

**Bütçe notu:** 20 karar alındı, hedef 12–18 idi. Aşımın sebebi, Paket 1'de PC-10 gate'inin açılması (D-034) — bu, D-035, D-036 ve D-042'yi zorunlu türev kararlar olarak getirdi. Gate kapalı kalsaydı toplam 16 olurdu.

---

## 5. FAZ 3 kapanabilir mi? — Öneri

**Evet, kapanabilir.** Gerekçe:

1. **Dört öncelikli cluster'ın (PC-04, 08, 09, 11) tamamı kapsam seviyesine oturdu** ve hiçbirinde bloke edici belirsizlik kalmadı. PC-11'in üç blocker'ı (A-01, A-02, A-03) kapandı.
2. **Foundation zincirleri çözüldü:** `PC-08 B → PC-09 B` ve `PC-11 B → PC-07 free/busy` bağımlılıkları artık kararla besleniyor, varsayımla değil.
3. **PC-10 CONDITIONAL kapısı açıldı ve sınırı çizildi** — en büyük belirsizlik kaynağı ölçülü bir kapsamla kapandı.
4. Açık kalan iki blocker (**P-020**, **P-021**) **modül-yerel**: yalnızca kendi spec'lerini bloke ediyorlar, diğer modüllerin yazımını engellemiyorlar. Modül spec'inin ilk sorusu olarak çözülmeleri daha verimli — bağlam o an taze olur.

**Önerilen sonraki adım:** FAZ 2B'ye kısa bir dönüş. Kalan cluster'lar (PC-01, 02, 03, 05, 06, 07, 10, 12, 13, 14) için kapsam seviyeleri üretilecek — ancak artık bunların **çoğu alınan kararlarla ağır şekilde kısıtlandı**, dolayısıyla ilk parti kadar geniş bir A/B/C üretimi gerekmeyecek. Ardından FAZ 4 Product Spec.

---

## 6. Faz kapısı

**Bu dokümanda yer almayan şeyler:**
❌ Product Spec · ❌ Modül spec'leri · ❌ UX flow · ❌ Tasarım · ❌ Kod · ❌ Yeni ürün kararı

**Durum:** FAZ 3 kapanış onayı bekleniyor.
