# 15 — Event Spec

**Cluster:** PC-04 + PC-05 · **Katman:** Core Experience · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-033, D-037, D-038, D-039, D-040, D-041, D-043 · **Scope referansı:** `04-scope-closure.md` §PC-04, §PC-05
**Source of truth:** izinler → `10` · durumlar → `11` · takvim/renk → `12` · oda modeli → `13` · oda seçimi → `16` · müsaitlik → `17`

---

## 1. Purpose

Etkinliğin **tek ürün modeli**, oluşturma ve düzenleme deneyimi, katılımcı yapısı ve tekrar davranışı.

Audit'in 4 numaralı bulgusuna doğrudan cevaptır: bugün formda tarih değiştirilemiyor, bitiş tarihi hiç yok, kozmetik bir kontrol asıl alanın üstünde duruyor ve mevcut bir etkinliğin düzenlenip düzenlenemediği doğrulanmadı (`UX-23`, `UX-24`, `UX-25`, `FN-13`).

---

## 2. Scope

### In Scope
- **Tek Etkinlik modeli** — "Toplantı" / "Etkinlik" tip ayrımı yok (D-037)
- **Quick Create + detaylı form** iki katmanlı oluşturma (D-038)
- Düzenlenebilir tarih ve **bitiş tarihi** → çok günlü etkinlik
- **Tek "Konum" mantığı** — oda seçiliyse konum odadan türer (D-033)
- Katılımcılar: **iç / harici** ve **zorunlu / opsiyonel** (D-040)
- Etkinlik detayı · düzenleme · silme
- Düzenleme/silme yetkisi (D-039)
- **Temel recurrence** ve üçlü seri düzenleme (D-043)
- Validasyon ve geçmiş tarih davranışının **sınıflandırılması**

### Out of Scope
- **Renk seçimi** — renk takvimden gelir, `12` BR-CAL-11/13
- **Etkinlik seviyesinde gizlilik** (D-041)
- Şablon/kopyalama · ek dosya · online toplantı bağlantısı · hatırlatıcı *(`04-scope-closure.md` §PC-04)*
- Gelişmiş recurrence kuralları ("ayın 2. Salısı", istisna günler) (D-043)
- **Oda seçimi ve filtreleri** → `16-room-booking-spec.md`
- **Katılımcı müsaitliği ve Suggested Times** → `17-scheduling-spec.md`
- Katılımcılara düzenleme hakkı (D-039)
- **Drawer / modal / panel gibi sunum kararı** — bağlayıcı ürün kararı yok, §13'e bırakıldı

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Organizatör** | Etkinliği oluşturan. Düzenler, siler, katılımcı yönetir. |
| **Katılımcı (iç kullanıcı)** | Etkinliği görür, yanıtlar. **Düzenleyemez** (D-039). |
| **Harici misafir** | E-posta ile davet edilir. Organizasyonun kullanıcısı değildir; oda erişimi ve free/busy görünürlüğü yoktur (`10` BR-PRM-18). |
| **Organizasyon yöneticisi** | Gerektiğinde etkinliği düzenleyebilir ve silebilir (D-039). |

---

## 4. Concepts / Entities

### 4.1 Etkinlik

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| **Başlık** | metin | ✅ | Formun birincil alanı |
| **Başlangıç tarihi + saati** | tarih-saat | ✅ | **Düzenlenebilir** (D-033 öncesi `UX-23`) |
| **Bitiş tarihi + saati** | tarih-saat | ✅ | Bitiş tarihi ayrı bir alan → çok günlü mümkün |
| **Tüm gün** | anahtar | — | Açıkken saat alanları gizlenir |
| **Konum** | türetilmiş veya metin | — | Tek alan; bkz. §4.2 (D-033) |
| **Oda** | referans | — | `16-room-booking-spec.md` |
| **Takvim** | referans | ✅ | `12-calendars-spec.md`; **zorunlu** (D-065). Quick Create'te alan yok — etkinlik **varsayılan takvime** düşer (BR-CAL-07) |
| **Katılımcılar** | liste | — | §4.3 |
| **Notlar** | metin | — | Serbest metin |
| **Tekrar kuralı** | kural | — | §4.4 |

> **Etkinlik tipi alanı yoktur** (D-037). Etkinliğin davranışını kullanılan alanlar belirler: katılımcı varsa davet üretilir, oda varsa rezervasyon oluşur.

### 4.2 Konum

**Tek alan, iki kaynak** (D-033):

| Durum | Davranış |
|---|---|
| **Oda seçilmiş** | Konum **odadan türetilir** ve **salt okunurdur**. Türetme: oda adı + (varsa) bina ve kat — `13` §4.2. Kullanıcı çelişen serbest metin giremez. |
| **Oda seçilmemiş** | Konum **serbestçe girilebilir** (dış adres, online, harici mekân). |

### 4.3 Katılımcılar

Her katılımcı **iki bağımsız nitelik** taşır (D-040):

| Nitelik | Değerler |
|---|---|
| **Kaynak** | `İç kullanıcı` *(organizasyon üyesi)* · `Harici misafir` *(e-posta ile)* |
| **Gereklilik** | `Zorunlu` · `Opsiyonel` |

> ⚠️ **UI kısıtı değildir (D-040).** İç/harici ayrımı **iş modelinde** korunur; arayüzde iki ayrı dropdown olması **requirement değildir**. Tek bir "Katılımcılar" alanı altında iç kullanıcı araması ile harici e-posta eklemeyi birleştirmek **önerilir** (SR-EVT-02).
>
> Mevcut üç katmanlı tekrar — *Kullanıcılar + Misafir Kullanıcılar + Tüm Katılımcılar özeti* — **korunmaz** (`UX-32`).

### 4.4 Tekrar (recurrence)

| Kavram | Değerler |
|---|---|
| **Sıklık** | `Günlük` · `Haftalık` · `Aylık` |
| **Bitiş koşulu** | `Bitiş tarihi` · `Tekrar sayısı` · `Süresiz` |
| **Seri** | Aynı tekrar kuralından doğan etkinlikler bütünü |
| **Örnek (instance)** | Serinin tek bir tarihteki etkinliği |
| **Sapmış örnek** | Seriden bağımsız olarak değiştirilmiş tek örnek |
| **Düzenleme kapsamı** | `Yalnızca bu etkinlik` · `Bu ve sonraki etkinlikler` · `Tüm seri` |

---

## 5. Business Rules

### 5.1 Etkinlik modeli

| ID | Kural |
|---|---|
| **BR-EVT-60** | ⚠️ **Tarih alanı tıklandığında takvim açılır.** Yerleşik tarih alanı bazı tarayıcılarda (macOS/Chrome) tıklamayla yalnız odaklanır — takvim ancak alanın kendi ikonuna basılınca açılır. Görsel dile uyması için o ikon gizlendiğinden takvim **programatik** açılmalıdır; klavyeyle (Enter/Space) de açılır. |
| **BR-EVT-01** | Sistemde **tek bir etkinlik türü** vardır. Tip alanı, tip seçici ve tipe bağlı davranış yoktur (D-037). |
| **BR-EVT-02** | Etkinlik **başlık, başlangıç ve bitiş** olmadan oluşturulamaz. |
| **BR-EVT-03** | **Bitiş, başlangıçtan sonra olmalıdır.** Eşit veya önce olamaz. |
| **BR-EVT-04** | Bitiş tarihi başlangıçtan farklı bir gün olabilir → **çok günlü etkinlik** (`UX-24`'ün çözümü). |
| **BR-EVT-05** | **Tüm gün** açıkken saat bileşenleri yok sayılır; etkinlik tüm gün şeridinde render edilir — `14` BR-SHELL-23. |
| **BR-EVT-06** | Etkinliğin rengi **atandığı takvimin rengidir**. Etkinlik başına renk seçimi yoktur (`12` BR-CAL-11/13). |
| **BR-EVT-07** | **Etkinlik seviyesinde gizlilik yoktur**; her etkinlik sahibinin free/busy'sinde meşgul görünür (D-041, `10` BR-PRM-13). |

### 5.2 Konum ve oda

| ID | Kural |
|---|---|
| **BR-EVT-08** | Konum **tek bir alandır** (D-033). |
| **BR-EVT-09** | Oda seçildiğinde konum odadan türetilir ve **salt okunur** olur; kullanıcı çelişen değer giremez. |
| **BR-EVT-10** | Oda kaldırıldığında konum alanı **serbest hale döner ve boşaltılır** — türetilmiş değer kalıcı olmaz. Kullanıcı bilgilendirilir. *(SR-EVT-03)* |
| **BR-EVT-11** | Oda seçimi, filtreleme ve müsaitlik davranışı **bu spec'in konusu değildir** → `16-room-booking-spec.md`. |

### 5.3 Katılımcılar

| ID | Kural |
|---|---|
| **BR-EVT-12** | Her katılımcı bir **kaynak** (iç/harici) ve bir **gereklilik** (zorunlu/opsiyonel) niteliği taşır (D-040). |
| **BR-EVT-13** | **Varsayılan gereklilik: Zorunlu.** *(SR-EVT-04)* |
| **BR-EVT-14** | Harici misafir yalnızca **e-posta adresiyle** eklenir; organizasyon dizininde aranmaz. |
| **BR-EVT-15** | **Organizatör etkinliğin sahibidir.** Organizatörün toplantıya **katılımcı olarak dahil olup olmadığı ayrı bir davranıştır** ve otomatik varsayılmaz. Mevcut Narbulut kavramı ("Ben de katılıyorum") korunur — `KEEP-07`. ⚠️ **UI'ın checkbox olması gerekmez**; daha iyi bir etkileşim FAZ 6'da tasarlanabilir (SR-EVT-08). |
| **BR-EVT-16** | Katılımcı ekleme, **davet ve bildirim üretir** → `19-notifications-spec.md`. |
| **BR-EVT-17** | Katılımcı listesi tekrarsızdır; aynı kişi iki kez eklenemez. |
| **BR-EVT-18** | Katılımcı müsaitliğinin gösterimi **bu spec'in konusu değildir** → `17-scheduling-spec.md`. |

### 5.4 Oluşturma katmanları

| ID | Kural |
|---|---|
| **BR-EVT-19** | **Quick Create** alanları: **başlık · tarih/saat · oluştur** (D-038). Takvim, oda, katılımcı ve tekrar alanları içermez. |
| **BR-EVT-20** | Quick Create'ten **"Daha fazla seçenek"** ile detaylı forma geçilir; **girilen veri korunur**. |
| **BR-EVT-21** | Detaylı formda **tek birincil aksiyon** vardır — `11` ST-CORE-04. *(`UX-26` — bugün üç koyu buton birincil görünüyor.)* |
| **BR-EVT-22** | Formun birincil alanı **Başlık**tır ve en üstte konumlanır. Kozmetik kontroller birincil alanın üstünde yer alamaz (`UX-25`). |
| **BR-EVT-23** | Saat alanları **yazılarak girilebilir**; yalnızca listeden seçim zorunlu değildir (`UX-28`). |
| **BR-EVT-24** | Zorunlu alanlar kaydetme denenmeden önce işaretlidir — `11` ST-VAL-01 (`FN-06`). |

### 5.5 Düzenleme ve silme

| ID | Kural |
|---|---|
| **BR-EVT-25** | Etkinliği **organizatör** ve **organizasyon yöneticisi** düzenleyebilir ve silebilir (D-039). |
| **BR-EVT-26** | **Katılımcıların düzenleme hakkı yoktur** (D-039). |
| **BR-EVT-26a** | ⚠️ **Takvim paylaşımından düzenleme hakkı türemez.** Kendisiyle bir takvim paylaşılan kullanıcı o takvimdeki etkinlikleri **görür ama düzenleyemez** (D-067, `12` BR-CAL-27). |
| **BR-EVT-27** | **Oda onaylayıcısı olmak, etkinliği düzenleme hakkı vermez** (D-039, `13` BR-ROOM-14). Onaylayıcı yalnızca rezervasyon kararını yönetir. |
| **BR-EVT-28** | **Oluşturma ve düzenleme aynı detaylı formu kullanır.** |
| **BR-EVT-29** | Etkinlik silme yıkıcı işlemdir; onay ister ve **etkilenecek katılımcı sayısını, oda rezervasyonunun akıbetini ve (seriyse) kapsamı** belirtir — `11` ST-DES-01/02/03. |
| **BR-EVT-30** | **Etkinlik silindiğinde bağlı oda rezervasyonu da düşer.** ⚠️ **Sessiz cascading delete yasaktır:** yıkıcı onay diyaloğu sonucu açıkça söyler — *"Bu etkinliği silerseniz bağlı oda rezervasyonu da iptal edilecek."* Bekleyen bir talep varsa **`Cancelled` durumuna geçer** (silinmez); geçmiş audit ve bildirim kaydı korunur. Onaylayıcı bilgilendirilir. *(SR-EVT-05)* |

### 5.6 Tekrar ve seri

| ID | Kural |
|---|---|
| **BR-EVT-31** | Tekrar sıklığı: **Günlük · Haftalık · Aylık**. Gelişmiş kurallar yoktur (D-043). |
| **BR-EVT-32** | Bitiş koşulu üç değerden biridir: **bitiş tarihi · tekrar sayısı · süresiz** (D-043). |
| **BR-EVT-33** | Tekrar kuralı tanımlanırken **önizleme satırı** gösterilir (ör. "Her Pazartesi 10:00–11:00, 31 Ara'ya kadar — 18 etkinlik"). |
| **BR-EVT-34** | Seri düzenleme ve silmede kullanıcı üç kapsamdan birini seçer (D-043). **Semantikleri farklıdır ve birbirine indirgenemez:** <br>**• Yalnızca bu etkinlik** — sadece seçilen occurrence değişir. <br>**• Bu ve sonrakiler** — seçilen occurrence **ve ondan sonraki** occurrence'lar değişir; **önceki occurrence'lar değişmez.** <br>**• Tüm seri** — serinin **geçmiş ve gelecek tüm** occurrence'ları series-level değişiklikten etkilenebilir. |
| **BR-EVT-34a** | ⚠️ **"Tüm seri" geçmiş occurrence'ları değiştirecekse kullanıcıya açık uyarı gösterilir** ve kaç geçmiş occurrence'ın etkileneceği belirtilir. Bu, "Bu ve sonrakiler" ile "Tüm seri"nin aynı davranışa dönüşmesini engeller. |
| **BR-EVT-34b** | **Yıkıcı seri işlemlerinde (silme, iptal) kapsam ve etkilenecek occurrence sayısı açıkça gösterilir** — geçmiş ve gelecek ayrı ayrı belirtilir (`11` ST-DES-02/03). |
| **BR-EVT-35** | **Kapsam seçimi işlemden sonra sorulur** — kullanıcı önce değişikliği yapar, sonra kapsamı seçer. Kapsam isteminde **her seçeneğin etkileyeceği occurrence sayısı** gösterilir. *(Benchmark: Google'ın kaydetme anındaki istemi `[O]`.)* |
| **BR-EVT-36** | **Kapsam sözlüğü tüm yüzeylerde birebir aynıdır.** Düzenleme, silme ve onay diyaloglarında aynı üç etiket kullanılır. *(Benchmark uyarısı: Google kendi platformlar arası etiket tutarsızlığını kabul ediyor `[O]`.)* |
| **BR-EVT-37** | "Yalnızca bu etkinlik" ile değiştirilen örnek **sapmış örnek** olur; sonraki seri değişiklikleri onu **ezmez**. *(SR-EVT-06)* |
| **BR-EVT-38** | Süresiz tekrar için sistem **sonlu bir ufuk** içinde örnek üretir; kullanıcı ufkun ötesine gezindiğinde üretim devam eder. Ürün seviyesinde sınır tanımlanmaz. |
| **BR-EVT-39** | **Seri + oda rezervasyonu etkileşimi** → `16-room-booking-spec.md` §5.4'te tanımlıdır. Bu spec yalnızca kapsam seçimini sağlar. |

---

## 6. User Flows

### F-EVT-1 · Quick Create
```
Izgarada boş slot'a tıkla  (14-calendar-shell IR-SHELL-01)
→ Quick Create: başlık · tarih/saat  [tarih ve saat düzenlenebilir]
→ [Oluştur]  → etkinlik oluşur, başarı bildirimi (11 ST-SUC-02)
     veya
→ [Daha fazla seçenek] → detaylı form, girilen veri korunur (BR-EVT-20)
```

### F-EVT-2 · Detaylı oluşturma
```
Detaylı form
→ Başlık (birincil alan, en üstte)
→ Tarih/saat · tüm gün anahtarı
→ (ops.) Takvim  →  12-calendars-spec
→ (ops.) Oda     →  16-room-booking-spec  → seçilirse Konum odadan türer (BR-EVT-09)
→ (ops.) Konum   [oda seçilmemişse serbest]
→ (ops.) Katılımcılar: iç/harici · zorunlu/opsiyonel  → müsaitlik: 17-scheduling-spec
→ (ops.) Tekrar kuralı + önizleme (BR-EVT-33)
→ (ops.) Notlar
→ [Oluştur]
→ oda onay gerektiriyorsa sonuç "Onay bekliyor" olarak bildirilir (11 ST-SUC-03, ST-PEND-04)
```

### F-EVT-3 · Seri düzenleme
```
Seriye ait bir etkinliği aç → Düzenle → değişiklikleri yap → [Kaydet]
→ kapsam istemi (BR-EVT-35), her seçeneğin etkisi sayıyla:
   ( ) Yalnızca bu etkinlik            → 1 occurrence
   ( ) Bu ve sonraki etkinlikler       → seçilen + sonraki N occurrence
   ( ) Tüm seri                        → geçmiş M + gelecek N occurrence
→ "Tüm seri" geçmişi etkiliyorsa açık uyarı gösterilir (BR-EVT-34a)
→ oda rezervasyonu etkileniyorsa bu da belirtilir (16-room-booking §5.4)
→ onayla
```

### F-EVT-4 · Etkinlik silme
```
Etkinlik detayı → Sil
→ onay: katılımcı sayısı + "bağlı oda rezervasyonu da iptal edilecek" (BR-EVT-29/30)
→ seriye aitse kapsam ve etkilenecek occurrence sayısı bu adımda (BR-EVT-34b)
→ onayla → sonuç bildirilir, katılımcılara iptal bildirimi gider (19-notifications)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-EVT-01** | Quick Create açıldığında odak **Başlık** alanındadır. |
| **IR-EVT-02** | Quick Create'te tıklanan slot'un tarihi ve saati **önceden doldurulur ve düzenlenebilirdir**. |
| **IR-EVT-03** | Quick Create → detaylı form geçişinde **veri ve bağlam kaybolmaz** (BR-EVT-20). ⚠️ Geri dönüş davranışının olup olmadığı **bağlayıcı bir ürün kuralı değildir** — drawer/modal/katlama/geri seçeneği FAZ 6'da tasarlanır (§13). |
| **IR-EVT-04** | Bitiş saati, başlangıç değiştiğinde **süreyi koruyarak** kayar. |
| **IR-EVT-05** | Oda seçimi kaldırıldığında konum alanının boşaldığı kullanıcıya bildirilir (BR-EVT-10). |
| **IR-EVT-06** | Katılımcı eklerken iç kullanıcı araması ve harici e-posta girişi **aynı giriş noktasından** yapılabilir (SR-EVT-02). |
| **IR-EVT-07** | Katılımcının zorunlu/opsiyonel niteliği **liste içinde tek etkileşimle** değiştirilebilir. |
| **IR-EVT-08** | Tekrar kuralı değiştirildiğinde önizleme satırı **anında** güncellenir. |
| **IR-EVT-09** | Seri kapsam istemi **iptal edilebilir**; iptal edildiğinde hiçbir değişiklik uygulanmaz. |
| **IR-EVT-10** | Etkinlik detayı, düzenleme yetkisi olmayan kullanıcıya **düzenleme aksiyonlarını göstermez** veya sebebiyle pasif gösterir — `11` ST-DIS-01/02. |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`. Bu modüle özgü olanlar:

| State | Davranış |
|---|---|
| **Pending (oda onayı)** | Etkinlik oluştu ancak oda rezervasyonu onay bekliyor. Etkinlik detayında ve chip üzerinde kalıcı olarak gösterilir — `11` ST-PEND-01/02. Başarı dili kullanılmaz (ST-PEND-04). |
| **Disabled (düzenleme)** | Yetkisi olmayan kullanıcıda düzenle/sil pasif; sebep okunur (IR-EVT-10). |
| **Error (kaydetme)** | Form kapanmaz, veri korunur, hata kaynağına yakın gösterilir — `11` ST-ERR-01/03. |
| **Warning (engelleyici olmayan)** | Mesai dışı (D-045) ve geçmiş tarih (BR-EVT-40) uyarıları; birincil aksiyon **aktif kalır** — `11` ST-VAL-05. |
| **Sapmış örnek** | Seriden ayrılmış örnek, detayında ve chip'inde ayırt edilebilir (BR-EVT-37, `14` EC-SHELL-08). |

---

## 9. Validation

`11-system-states-spec.md` ST-VAL-06 gereği, **hangi koşulun engelleyici olduğu bu spec'te sınıflandırılır.**

| ID | Kural | Sınıf | Davranış |
|---|---|---|---|
| **BR-EVT-40** | **Geçmiş tarihe etkinlik oluşturma** | ⚠️ **Engelleyici olmayan uyarı** | Uyarı gösterilir, kaydetme **engellenmez**. *(SR-EVT-01 — `FN-02`'nin çözümü)* |
| **V-EVT-01** | Başlık zorunludur | Engelleyici | Alan altı hata |
| **V-EVT-02** | Başlangıç ve bitiş zorunludur | Engelleyici | Alan altı hata |
| **V-EVT-03** | Bitiş > başlangıç (BR-EVT-03) | Engelleyici | Alan altı hata; hangi alanın hatalı olduğu belirtilir |
| **V-EVT-04** | Harici katılımcı geçerli e-posta olmalıdır | Engelleyici | Alan altı hata |
| **V-EVT-05** | Aynı katılımcı iki kez eklenemez | Sessiz | Tekrar eklenmez, hata gösterilmez |
| **V-EVT-06** | Tekrar bitiş tarihi başlangıçtan sonra olmalıdır | Engelleyici | Alan altı hata |
| **V-EVT-07** | Tekrar sayısı pozitif tam sayı olmalıdır | Engelleyici | Alan altı hata |
| **V-EVT-08** | **Mesai saatleri dışı** | ⚠️ **Engelleyici olmayan uyarı** | D-045 bağlayıcı |
| **V-EVT-09** | **Oda çakışması** | **Engelleyici** | → `16-room-booking-spec.md` |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-EVT-01** | Çok günlü etkinlik + tüm gün anahtarı | Geçerli kombinasyon; tüm gün şeridinde birden fazla günü kapsayan blok olarak render edilir — `14` BR-SHELL-23. |
| **EC-EVT-02** | Organizatör organizasyondan çıkarılır | Etkinlik silinmez. Organizasyon yöneticisi düzenleyebilir/silebilir (D-039). Organizatör devri kapsam dışıdır. |
| **EC-EVT-03** | Süresiz tekrar + oda rezervasyonu | Oda rezervasyonu sonlu ufukla sınırlıdır (BR-EVT-38); kullanıcıya bu sınır **açıkça bildirilir** → `16-room-booking-spec.md` §5.4. |
| **EC-EVT-04** | "Bu ve sonraki" ile değiştirilen seri, daha önce sapmış örnek içeriyor | Sapmış örnekler **korunur**, ezilmez (BR-EVT-37). Kullanıcıya kaç örneğin korunduğu bildirilir. |
| **EC-EVT-05** | Kapsam "Tüm seri" seçilir ve seride geçmiş occurrence'lar var | Geçmiş occurrence'lar **etkilenebilir** (BR-EVT-34); ancak kullanıcıya kaç geçmiş occurrence'ın değişeceği **açık uyarı** olarak gösterilir (BR-EVT-34a). *(SR-EVT-07)* |
| **EC-EVT-06** | Katılımcı, etkinlik oluşturulduktan sonra organizasyondan çıkarılır | Katılımcı listesinden düşürülmez; etkinlikte "artık organizasyonda değil" olarak görünür. Sessiz kaldırma yapılmaz. |
| **EC-EVT-07** | Oda seçiliyken oda pasife alınır | Mevcut etkinlik etkilenmez (`13` BR-ROOM-07). Etkinlik düzenlenirken oda seçici o odayı listelemez; mevcut atama korunur ve durumu belirtilir. |
| **EC-EVT-08** | Etkinliğin takvimi silinir | `12` BR-CAL-22 geçerlidir; kullanıcı taşıma veya silme kararını verir. Sessiz silme yapılmaz. |
| **EC-EVT-09** | Aynı etkinliği organizatör ve yönetici aynı anda düzenler | `11` EC-ST-03 geçerlidir; sessiz üzerine yazma yapılmaz. |
| **EC-EVT-10** | Bekleyen oda talebi varken etkinlik silinir | Talep iptal edilir, onaylayıcı bilgilendirilir (BR-EVT-30). |
| **EC-EVT-11** | Tüm katılımcılar kaldırılır | Etkinlik geçerli kalır — katılımcı zorunlu değildir (BR-EVT-01: davranışı alanlar belirler). |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | Harici misafirin sınırları (BR-PRM-18) |
| `11-system-states-spec.md` | Validasyon sunumu, yıkıcı işlem, pending, hata |
| `12-calendars-spec.md` | Takvim alanı (**zorunlu** — D-065), renk kaynağı, varsayılan takvim ataması; **paylaşılan takvimde salt okunurluk** (`12` BR-CAL-27) |
| `13-rooms-spec.md` | Konumun türetildiği oda modeli (§4.2) |
| `14-calendar-shell-spec.md` | Slot tıklama → Quick Create; chip render'ı |
| `16-room-booking-spec.md` | Oda seçimi, çakışma, seri × rezervasyon etkileşimi |
| `17-scheduling-spec.md` | Katılımcı müsaitliği ve Suggested Times |
| `18-reservation-approval-spec.md` | Pending durumunun kaynağı |
| `19-notifications-spec.md` | Davet, güncelleme, iptal bildirimleri |

---

## 12. Responsive Expectations

Desktop-first (D-047). **Etkinlik oluşturma/düzenleme mobil zorunlu akışlardandır.**

| ID | Kural |
|---|---|
| **RS-EVT-01** | Quick Create mobilde **tam olarak kullanılabilir** olmalıdır — mobilin birincil oluşturma yolu budur. |
| **RS-EVT-02** | Detaylı form mobilde tek sütuna iner; alan sırası masaüstüyle **aynı önceliği** korur (BR-EVT-22). |
| **RS-EVT-03** | Tarih/saat girişi mobilde platform seçicilerine devredilebilir; ancak yazarak giriş imkânı kaybolmamalıdır (BR-EVT-23). |
| **RS-EVT-04** | Seri kapsam istemi mobilde tam ekran olabilir; üç seçenek de aynı anda görünür olmalıdır. |

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- ⚠️ **Detay yüzeyinin sunumu (drawer / modal / tam sayfa) bağlayıcı bir ürün kararı DEĞİLDİR.** D-038 yalnızca iki katmanlı yapıyı belirledi. Mevcut sistemde sağdan açılan drawer var ve `KEEP-12` olarak korunmaya değer bulunmuştu — ancak bu bir tasarım kararı olarak FAZ 6'da verilmelidir. Kısıt: Quick Create'ten detaya geçiş **bağlam kaybı yaratmamalı** ve girilen veri korunmalıdır (BR-EVT-20).
- **Form alan sırası tersine dönüyor:** bugün "Renk Değiştir" birincil buton olarak Başlık'ın üstünde (`UX-25`). Yeni sırada Başlık en üstte ve renk kontrolü **hiç yok** (`12` BR-CAL-13).
- **Katılımcı alanı birleştirilebilir** (SR-EVT-02): tek giriş noktası, iç kullanıcı araması + harici e-posta. Zorunlu/opsiyonel işaretleme liste içinde tek etkileşimle olmalı (IR-EVT-07).
- **Tekrar önizleme satırı** (BR-EVT-33) formda kalıcı bir yer ister; kural değiştikçe güncellenir.
- **Seri kapsam istemi** üç yerde çıkacak (düzenleme, silme, oda etkisi) ve sözlüğü birebir aynı olmalı (BR-EVT-36) — tek bir paylaşılan bileşen gerekir.
- Mesai dışı ve geçmiş tarih uyarıları **birincil aksiyonu engellemediği** için hata dilinden görsel olarak ayrılmalıdır (`11` ST-VAL-05).

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-EVT-01 | Formda etkinlik tipi seçici bulunmaz. |
| AC-EVT-23 | Her etkinliğin bir takvimi vardır; takvim seçilmezse varsayılan takvime atanır. |
| AC-EVT-24 | Kendisiyle takvim paylaşılan kullanıcı o takvimdeki etkinlikleri düzenleyemez veya silemez. |
| AC-EVT-02 | Tarih ve saat formda düzenlenebilir; başlangıç ve bitiş ayrı ayrı ayarlanabilir. |
| AC-EVT-03 | Bitiş tarihi başlangıçtan farklı bir gün seçilerek çok günlü etkinlik oluşturulabilir. |
| AC-EVT-04 | Formda renk seçme kontrolü bulunmaz. |
| AC-EVT-05 | Quick Create yalnızca başlık ve tarih/saat alanlarını içerir; "Daha fazla seçenek" ile geçişte veri korunur. |
| AC-EVT-06 | Detaylı formda Başlık birincil alandır ve tek birincil aksiyon vardır. |
| AC-EVT-07 | Saat alanları yazılarak girilebilir. |
| AC-EVT-08 | Oda seçildiğinde konum odadan türetilir ve salt okunur olur; oda kaldırıldığında serbest hale döner. |
| AC-EVT-09 | Katılımcılar iç/harici ve zorunlu/opsiyonel olarak ayrıştırılabilir. |
| AC-EVT-10 | Organizatörün kendisini katılımcı olarak dahil edip etmediği açıkça seçilebilir. |
| AC-EVT-11 | Etkinliği yalnızca organizatör ve organizasyon yöneticisi düzenleyebilir/silebilir. |
| AC-EVT-12 | Oda onaylayıcısı, onaylayıcı olduğu için etkinliği düzenleyemez. |
| AC-EVT-13 | Tekrar kuralı günlük/haftalık/aylık ve üç bitiş koşulunu destekler; önizleme satırı gösterilir. |
| AC-EVT-14 | Seri düzenleme ve silmede üç kapsam seçeneği aynı etiketlerle sunulur. |
| AC-EVT-15 | "Yalnızca bu etkinlik" ile değiştirilen örnek, sonraki seri değişikliklerinde ezilmez. |
| AC-EVT-19 | Üç kapsam seçeneği farklı sonuç üretir: "Bu ve sonrakiler" geçmiş occurrence'ları değiştirmez, "Tüm seri" değiştirebilir. |
| AC-EVT-20 | "Tüm seri" geçmiş occurrence'ları etkileyecekse kullanıcı açık uyarı görür ve etkilenecek sayıyı okur. |
| AC-EVT-21 | Etkinlik silme onayı, bağlı oda rezervasyonunun iptal edileceğini açıkça belirtir; sessiz cascading delete yapılmaz. |
| AC-EVT-22 | Silinen etkinliğin bekleyen talebi `Cancelled` durumuna geçer; kayıt silinmez. |
| AC-EVT-16 | Geçmiş tarihe etkinlik oluşturmak uyarı üretir ancak engellenmez. |
| AC-EVT-17 | Etkinlik silme onayı, katılımcı sayısını ve oda rezervasyonunun akıbetini belirtir. |
| AC-EVT-18 | Etkinlik silindiğinde bekleyen oda talebi iptal edilir ve onaylayıcı bilgilendirilir. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-EVT-01 | **Geçmiş tarihe etkinlik** | **Engelleyici olmayan uyarı** (BR-EVT-40) | `FN-02` doğrulanmış boşluk. Engellemek meşru kullanımı (geçmiş toplantıyı kayda geçirme) keser; D-045'in mesai dışı için aldığı tutumla da tutarlı. `11` ST-VAL-06 gereği sınıflandırma bu spec'in işi |
| SR-EVT-02 | Katılımcı giriş noktası | **Tek alan; iç arama + harici e-posta birlikte** | D-040 açıkça "iki dropdown requirement değil" dedi; `UX-32`'nin çözümü |
| SR-EVT-03 | Oda kaldırılınca konum | **Boşalır, kalıcı olmaz** (BR-EVT-10) | Türetilmiş değeri serbest metne dönüştürmek D-033'ün "çelişen değer oluşamaz" amacını bozar |
| SR-EVT-04 | Varsayılan gereklilik | **Zorunlu** | Davet edilen kişinin varsayılan olarak beklendiği varsayımı daha yaygın; opsiyonel bilinçli bir işaretlemedir |
| SR-EVT-05 | Etkinlik silinince rezervasyon | **Rezervasyon düşer; bekleyen talep iptal edilir** (BR-EVT-30) | Odanın boşta kalmaması gerekiyor; onaylayıcının hayalet talep görmemesi için bilgilendirme şart |
| SR-EVT-06 | Sapmış örnek korunur mu? | **Evet, ezilmez** (BR-EVT-37) | Kullanıcının bilinçli tekil değişikliğini sessizce geri almak veri kaybıdır |
| SR-EVT-07 | "Tüm seri" geçmişi etkiler mi? | **Evet, etkileyebilir — ama açık uyarıyla** (BR-EVT-34/34a) | Üç kapsamın semantiği farklı olmalı; "Tüm seri" geçmişi hiç etkilemezse "Bu ve sonrakiler" ile aynı davranışa iner ve seçenek anlamsızlaşır |
| SR-EVT-08 | Organizatörün katılımı nasıl ifade edilir? | **Kavram korunur, UI biçimi FAZ 6'ya bırakılır** (BR-EVT-15) | `KEEP-07` mevcut Narbulut kavramı; ancak checkbox olması bağlayıcı değil |
