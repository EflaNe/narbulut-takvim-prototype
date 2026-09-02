# 18 — Reservation Approval Spec

**Cluster:** PC-10 · **Katman:** Core Experience · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-034, D-035, D-036, D-042 · **Scope referansı:** `04-scope-closure.md` §PC-10
**Source of truth:** izinler → `10` · durumlar → `11` · oda modeli → `13` · etkinlik → `15` · oda seçimi → `16` · bildirimler → `19`

---

## 1. Purpose

Bazı odalar ortak ve değerli kaynaklardır; bunlara yapılan rezervasyonun **bir insan kararından geçmesi** gerekebilir. Bu spec o kararın nasıl talep edildiğini, kimin verdiğini ve sonucun ne olduğunu tanımlar.

**Kapsam sınırı (D-034):** onay sistemi **basit ve oda-bazlıdır**. Enterprise kural motoru, çok aşamalı onay ve approval chain **kapsam dışıdır**.

---

## 2. Scope

### In Scope
- **Oda seviyesinde** onay yapılandırması *(alanlar `13-rooms-spec.md`'de)*
- Durum makinesi: **Pending → Approved / Rejected / Cancelled**
- Bekleyen talebin slotu bloke etmesi (D-036)
- **Onay kuyruğu** ve onaylayıcı deneyimi
- **Red gerekçesi**
- Tekrarlayan seri için **tek talep**
- Etkinlik ↔ rezervasyon ilişkisi

### Out of Scope
- **Çok aşamalı onay · approval chain · rule engine · global approver rolü · koşullu politikalar · otomatik öncelik sistemi** (D-034)
- Haftanın gününe göre kural · kullanıcı tipine göre policy · süreye göre approval (D-034)
- **Maksimum süre · önden rezervasyon penceresi · oda mesai penceresi** (D-035c)
- Check-in / no-show / auto-release *(audit karşılığı yok)*
- Onay bayrağı ve onaylayıcı **alanlarının tanımı** → `13-rooms-spec.md`
- Oda seçimi ve çakışma → `16-room-booking-spec.md`
- Bildirim içerikleri → `19-notifications-spec.md`

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Talep eden** | Onay gerektiren bir odayı seçen etkinlik organizatörü. Talebini geri çekebilir. |
| **Onaylayıcı** | Odanın onay yapılandırmasında tanımlı kullanıcı veya grup üyesi. **Yalnızca sorumlu olduğu odaların taleplerini** görür ve karara bağlar. |
| **Organizasyon yöneticisi** | Odanın onay yapılandırmasını yapar (`13`). Onaylayıcı olarak **atanmadıysa** talepleri göremez. |

> ⚠️ **Onaylayıcı genel sistem yetkisi kazanmaz** (D-042, `13` BR-ROOM-13/14). Onaylayıcı olmak; odayı düzenleme, etkinliği düzenleme veya başka odaların taleplerini görme hakkı **vermez**.

---

## 4. Concepts / Entities

### 4.1 Rezervasyon talebi

| Alan | Not |
|---|---|
| **Etkinlik** | Talebi doğuran etkinlik |
| **Oda** | Talep edilen oda |
| **Zaman aralığı** | Etkinlikten türetilir |
| **Tekrar bilgisi** | Seri talebiyse: kural ve occurrence sayısı |
| **Talep eden** | Etkinlik organizatörü |
| **Durum** | `Pending` · `Approved` · `Rejected` · `Cancelled` |
| **Karar veren** | Kararı veren onaylayıcı *(karar sonrası)* |
| **Red gerekçesi** | Reddedildiyse; opsiyonel metin |

### 4.2 Durum makinesi

```
                  ┌──────────────────────────► Approved
                  │        (onaylayıcı onaylar)      │
                  │                                  │ (etkinlik silinir /
   [talep] ─► Pending ────────────────────► Rejected │  rezervasyon kaldırılır)
                  │        (onaylayıcı reddeder)     │
                  │                                  ▼
                  └──────────────────────────► Cancelled
                    (talep eden geri çeker /
                     etkinlik silinir /
                     başlangıç zamanı geçti — BR-APR-42)
```

| Geçiş | Tetikleyen |
|---|---|
| `→ Pending` | Onay gerektiren odaya rezervasyon oluşturulur |
| `Pending → Approved` | Onaylayıcı onaylar |
| `Pending → Rejected` | Onaylayıcı reddeder *(gerekçe opsiyonel)* |
| `Pending → Cancelled` | Talep eden geri çeker · etkinlik silinir (`15` BR-EVT-30) · **etkinliğin başlangıç zamanı geçer** (BR-APR-42) |
| `Approved → Cancelled` | Etkinlik silinir veya odası kaldırılır |

> **`Rejected` ve `Cancelled` terminal durumlardır.** Yeniden talep, **yeni bir talep** oluşturur.

---

## 5. Business Rules

### 5.1 Model

| ID | Kural |
|---|---|
| **BR-APR-01** | **Onay global bir mod değildir.** Her oda kendi `Rezervasyon onayı gerekli` ayarını taşır (D-034, `13` BR-ROOM-11). |
| **BR-APR-02** | ⚠️ **INVARIANT:** Bir odada `Rezervasyon onayı gerekli = açık` ise **en az bir geçerli onaylayıcı kullanıcı veya grup tanımlı olmak zorundadır** (`13` BR-ROOM-12). Bu kural hem oluşturmada hem düzenlemede geçerlidir. |
| **BR-APR-02a** | Onay açık ve onaylayıcı boşken **form kaydedilemez**; alan bazlı açık validasyon gösterilir: *"Rezervasyon onayı açık olduğu için en az bir onaylayıcı seçmelisiniz."* |
| **BR-APR-02b** | Mevcut bir odanın **son onaylayıcısı kaldırılmaya çalışılırsa** ve onay hâlâ açıksa **işlem engellenir**. Kullanıcı ya yeni onaylayıcı ekler ya onayı kapatır. |
| **BR-APR-02c** | **Onay kapatılırsa onaylayıcı zorunluluğu kalkar.** |
| **BR-APR-03** | Onaylayıcı **yalnızca o odanın** onaylayıcısıdır (D-042, `13` BR-ROOM-13). Sistem geneli approver rolü yoktur. |
| **BR-APR-04** | Onaylayıcı olmak **tek bir ek yetki verir**: sorumlu olduğu odanın rezervasyonunu kaldırmak (BR-APR-28). Bunun dışında odayı düzenleyemez, etkinliği düzenleyemez, başka odaların taleplerini göremez (`13` BR-ROOM-14, `15` BR-EVT-27). *(2 Eylül 2026'da D-071 ile daraltılmış biçimde genişletildi; önceki hâli "hiçbir ek yetki vermez" idi.)* |
| **BR-APR-05** | Onay açık bir odada, `Rezerve edebilir` yetkisi fiilen **"talep gönderebilir"** anlamına gelir (D-035a). Yetkisi olmayan talep de gönderemez. |

### 5.2 Talep oluşumu

| ID | Kural |
|---|---|
| **BR-APR-06** | Onay gerektiren bir oda seçildiğinde etkinlik **oluşur**; onaya düşen yalnızca **oda rezervasyonudur** (`16` BR-RB-32). |
| **BR-APR-07** | Talep oluştuğunda kullanıcıya **başarı dili kullanılmaz**: *"Talebiniz gönderildi, onay bekliyor"* (`11` ST-PEND-04, `16` BR-RB-31). |
| **BR-APR-08** | **Seri için tek talep** oluşur; occurrence başına talep üretilmez (`16` BR-RB-29). |
| **BR-APR-09** | Seri talebi gönderilmeden önce **tüm occurrence'larda** çakışma, müsaitlik ve yetki kontrolü yapılır; kısmi problem çözülmeden talep gönderilmez (`16` BR-RB-29a/29b). |
| **BR-APR-10** | Aynı etkinlik + oda için **aynı anda birden fazla `Pending` talep bulunamaz**. |

### 5.3 Pending davranışı

| ID | Kural |
|---|---|
| **BR-APR-11** | ⚠️ **Bekleyen talep zaman aralığını BLOKE ETMEZ** (D-070, D-036'nın bu maddesini geçersiz kılar). Yalnızca **kesinleşmiş rezervasyon** bloke eder. |
| **BR-APR-12** | Aynı aralıkta bekleyen talep varken oda **seçilebilir kalır**; durum kullanıcıya **bilgi olarak** gösterilir: *"Bu saat için N bekleyen talep var. Siz de talep edebilirsiniz; kararı onaylayıcı verir."* (`16` seçilebilirlik matrisi §4.1). |
| **BR-APR-13** | ⚠️ **Aynı slota birden fazla talep oluşturulabilir.** Kullanıcı talep göndermekten engellenmez; **rakip talepler birikir** ve karar onaylayıcıya kalır (D-070). |
| **BR-APR-13a** | ⚠️ **Çakışma karar anında değerlendirilir.** Bir slot kesinleşmişken aynı aralığa düşen başka bir talep **onaylanamaz**; onaylayıcıya **sebebi** ve engelleyen rezervasyonun sahibi gösterilir (`11` ST-DIS-02). Onaylayıcı isterse önce mevcut rezervasyonu kaldırıp sonra onaylar. |
| **BR-APR-13b** | ⚠️ **Bir talebin onaylanması diğer bekleyen talepleri otomatik reddetmez.** Rakip talepler `Pending` kalır; her biri **açık bir kararla** sonuçlanır. Sessiz toplu red yapılmaz (`11` ST-CORE-01). |
| **BR-APR-14** | Bekleyen durum takvimde ve oda görünümlerinde **kalıcı bir rozetle** gösterilir (`11` ST-PEND-01/02, `14` BR-SHELL-20/29). |
| **BR-APR-15** | Bekleyen durum, **kimden ne beklendiğini** söyler (`11` ST-PEND-03). |
| **BR-APR-16** | Talep eden, kendi bekleyen talebini **geri çekebilir** → `Cancelled`. |

### 5.4 Karar

| ID | Kural |
|---|---|
| **BR-APR-17** | Kararı yalnızca **o odanın onaylayıcıları** verebilir (BR-APR-03). |
| **BR-APR-17a** | ⚠️ **Self-approval yasağı: talebi oluşturan kullanıcı kendi rezervasyon talebini onaylayamaz.** Kullanıcı aynı zamanda o odanın onaylayıcısıysa, **kendi talebinde Onayla / Reddet aksiyonları gösterilmez**; kararı başka bir geçerli onaylayıcı vermelidir. |
| **BR-APR-17b** | ⚠️ **ELIGIBLE APPROVER INVARIANT:** Approval-required bir rezervasyon, **talebi oluşturan kullanıcı dışında en az bir eligible approver yoksa `Pending` olarak oluşturulamaz.** Sistem bunu **talep oluşturma aşamasında** yakalar ve **engelleyici (blocking) validasyon** gösterir: *"Bu rezervasyonu onaylayabilecek başka bir kullanıcı bulunmuyor."* |
| **BR-APR-17d** | **Eligible approver** = odanın onaylayıcı listesindeki, **talebi oluşturan kullanıcıdan farklı** bir kullanıcı; veya onaylayıcı bir gruptaysa, o grupta talebi oluşturandan başka en az bir üye. |
| **BR-APR-17e** | Blocking validasyon durumunda kullanıcının kurtarma yolları: **başka bir oda seç** · **onay gerektirmeyen bir oda seç** · **odasız devam et** *(sunulabilir)* · yöneticiden odanın onay yapılandırmasını değiştirmesini iste. ⚠️ **Çözümsüz `Pending` rezervasyon üretilmez.** |
| **BR-APR-17c** | Self-approval'ın organizasyon politikasıyla açılması **kapsam dışıdır**. Delegation sistemi kurulmaz. |
| **BR-APR-18** | **Onay:** talep `Approved` olur, rezervasyon kesinleşir, slot rezerve kalır. |
| **BR-APR-19** | **Red:** talep `Rejected` olur, **slot serbest kalır** ve oda tekrar `Müsait` olur (`16` EC-RB-06). Etkinlik **silinmez**; odasız kalır. |
| **BR-APR-20** | Redde **gerekçe girilebilir** (opsiyonel). Gerekçe girildiyse talep edene iletilir. |
| **BR-APR-21** | Kararlar **tek adımlıdır**. İkinci bir onay aşaması, zincir veya eskalasyon yoktur (D-034). |
| **BR-APR-22** | Bir karar verildikten sonra **geri alınamaz**. Farklı bir sonuç için yeni talep gerekir. *(SR-APR-04)* |
| **BR-APR-23** | Seri talebinde karar **tüm seriye** uygulanır; occurrence bazında kısmi onay yoktur (BR-APR-08). |
| **BR-APR-24** | Onaylayıcı, kararından önce talebin **tam bağlamını** görebilir (§5.5). |

### 5.5 Onay kuyruğu

| ID | Kural |
|---|---|
| **BR-APR-25** | Onaylayıcı için **kendi sorumlu olduğu odaların taleplerini** listeleyen bir kuyruk bulunur. Başka odaların talepleri görünmez (BR-APR-03). |
| **BR-APR-25a** | ⭐ **Oda ekseninde görünüm.** Bir odaya bakarken *"bu odaya kim, ne zaman talep göndermiş"* sorusu **odanın kendi yüzeyinden** cevaplanabilir: yaklaşan rezervasyonlar ve bekleyen talepler tek listede, tarih/saat · talep eden · durum ile. Karar verilebilen satırlarda onay/red aksiyonu bulunur. *(2 Eylül 2026'da eklendi, SR-APR-10.)* |
| **BR-APR-25b** | ⚠️ Oda takviminde **talep eden ve etkinlik adı**, yalnızca kararı verebilecek veya etkinliği zaten okuyabilen kullanıcıya gösterilir. Diğerleri için satır yalnız **doluluk** taşır — `10` BR-PRM-06, BR-APR-27. |
| **BR-APR-25c** | ⚠️ **Karar bekleyen iş, bildirimden ayrı bir sinyaldir.** Bildirim okunduğunda kaybolur; karar bekleyen talep **kararı verilene kadar** görünür kalmalıdır. Onaylayıcı, ilgili yönetim ekranına girmeden de bekleyen iş olduğunu görebilmelidir. |
| **BR-APR-28** | ⭐ **Rezervasyonu kaldırma.** Oda sorumlusu, sorumlu olduğu odadaki `Reserved` bir rezervasyonu kaldırabilir. Kaldırma sonrası slot serbest kalır; bekleyen rakip talepler karar verilebilir hâle gelir (BR-APR-13a). |
| **BR-APR-28a** | ⚠️ Kaldırma, **kararı geri almak değildir** (BR-APR-22 yerinde durur). Talep kaydı `Approved` olarak kalır; durumu değişen **rezervasyondur** (`Cancelled`). Kaldırma kendi gerekçesi ve kendi bildirimiyle izlenen **ayrı bir eylemdir**. |
| **BR-APR-28b** | ⚠️ **Gerekçe zorunludur** ve rezervasyon sahibine iletilir (N-RES-06). *(Red gerekçesinin opsiyonel olmasından — BR-APR-20 — bilinçli olarak ayrışır: red talep edenin **beklediği** bir cevaptır, kaldırma ise sahibinin **hesaba katmadığı** bir müdahaledir.)* |
| **BR-APR-28c** | ⚠️ Kaldıran kullanıcı ve gerekçe **kalıcı olarak saklanır**. Talep kaydı `Approved` göründüğü için, neyin neden düştüğünün tek izi budur. |
| **BR-APR-28d** | Kaldırma etkinliği **silmez**: etkinlik odasız kalır (BR-APR-19 ile aynı davranış). Oda sorumlusunun etkinliğin kendisine — başlık, saat, katılımcı — hiçbir yetkisi yoktur. |
| **BR-APR-28e** | Yetki **oda başınadır**: kullanıcı yalnız sorumlusu olduğu odalarda kaldırabilir. Sorumlu olmayan kullanıcı için aksiyon **gösterilmez**. |
| **BR-APR-26** | Kuyruk satırı **en az** şu bağlamı taşır: **etkinlik · oda · talep eden · tarih/saat · tekrar bilgisi · durum**. |
| **BR-APR-27** | ⚠️ Kuyruk, talep edenin **etkinlik detaylarını** açığa çıkarmaz — yalnızca kararı vermek için gereken bağlam gösterilir. Free/busy detay yasağı (`10` BR-PRM-11) burada da geçerlidir. *(SR-APR-05)* |
| **BR-APR-28** | Kuyrukta **bekleyen talepler öncelikli** görünür; karara bağlanmış talepler geçmiş olarak erişilebilir kalır. |
| **BR-APR-29** | Kuyruk **boşsa** bu açıkça söylenir; boş liste sessizce gösterilmez (`11` ST-EMPTY-01). |
| **BR-APR-30** | Seri talebi kuyrukta **tek satır** olarak görünür ve occurrence sayısını belirtir (BR-APR-08). |

### 5.6 Etkinlik ilişkisi

| ID | Kural |
|---|---|
| **BR-APR-31** | Etkinlik silindiğinde bağlı talep/rezervasyon **`Cancelled`** olur; **silinmez** — audit ve bildirim kaydı korunur (`15` BR-EVT-30). |
| **BR-APR-32** | Etkinlik silme onayında bu sonuç **açıkça gösterilir**; sessiz cascading yapılmaz (`15` BR-EVT-29/30). |
| **BR-APR-33** | Etkinlikten oda kaldırılırsa: `Pending` talep **`Cancelled`** olur; `Approved` rezervasyon düşer ve slot serbest kalır. |
| **BR-APR-34** | Etkinliğin **zamanı değişirse** bekleyen talep **yeniden değerlendirilir**: yeni aralık için çakışma kontrolü çalışır ve talep yeni aralığı bloke eder. Onaylayıcı bilgilendirilir. *(SR-APR-06)* |
| **BR-APR-35** | Onay durumundan bağımsız olarak **etkinlik takvimde görünür**; oda durumu ayrı bir eksende gösterilir (`14` BR-SHELL-20). |

### 5.7 Bekleyen talebin yaşam döngüsü

> ⚠️ **Ayrı bir expiration sistemi, scheduler veya kural motoru kurulmaz.** Bekleyen bir talep yalnızca aşağıdaki dört yoldan terminal duruma geçer.

| ID | Kural |
|---|---|
| **BR-APR-39** | Bekleyen talep **talep eden tarafından iptal edilebilir** → `Cancelled` (BR-APR-16). |
| **BR-APR-40** | Bekleyen talep **onaylayıcı tarafından** `Approved` veya `Rejected` yapılabilir. |
| **BR-APR-41** | **Bağlı etkinlik iptal edilirse** talep `Cancelled` olur (BR-APR-31). |
| **BR-APR-42** | ⚠️ **Etkinliğin başlangıç zamanı geçmiş ve talep hâlâ `Pending` ise**, talep artık **aktif rezervasyon olarak değerlendirilemez** ve terminal duruma geçirilir (`Cancelled` eşdeğeri). Bu, D-036'da işaretlenen "unutulan talepler odayı süresiz kilitlemesin" ihtiyacının karşılığıdır. |
| **BR-APR-43** | Terminal duruma geçen talebin **kaydı silinmez**; audit ve bildirim geçmişi korunur (BR-APR-31 ile aynı ilke). |
| **BR-APR-44** | Terminal duruma geçen talep **slotu bloke etmez**; oda tekrar `Müsait` olur. |

---

### 5.8 Bildirimler

| ID | Kural |
|---|---|
| **BR-APR-36** | **Dört durum geçişi de bildirim üretir:** talep gönderildi · onaylandı · reddedildi · iptal edildi. Detay → `19-notifications-spec.md`. |
| **BR-APR-37** | Talep gönderildiğinde **onaylayıcı(lar)** bilgilendirilir; karar verildiğinde **talep eden** bilgilendirilir. |
| **BR-APR-38** | Red gerekçesi varsa bildirimde **yer alır** (BR-APR-20). |

---

## 6. User Flows

### F-APR-1 · Talep gönderme *(talep eden)*
```
15-event formu → onay gerektiren oda seç → [Oluştur]
→ etkinlik oluşur (BR-APR-06)
→ rezervasyon Pending durumunda başlar
→ bildirim: "Talebiniz gönderildi, onay bekliyor — [onaylayıcı]" (BR-APR-07/15)
→ slot diğer kullanıcılara "Onay bekliyor" görünür ve seçilemez (BR-APR-11/12)
→ onaylayıcı(lar)a bildirim gider (BR-APR-37)
```

### F-APR-2 · Talebi karara bağlama *(onaylayıcı)*
```
Onay kuyruğu → yalnızca sorumlu olunan odaların talepleri (BR-APR-25)
→ satır bağlamı: etkinlik · oda · talep eden · tarih/saat · tekrar · durum (BR-APR-26)
→ [Onayla] → Approved, rezervasyon kesinleşir (BR-APR-18)
     veya
→ [Reddet] → (ops.) gerekçe gir → Rejected, slot serbest kalır (BR-APR-19/20)
→ talep edene bildirim gider (BR-APR-37)
```

### F-APR-3 · Talebi geri çekme *(talep eden)*
```
Etkinlik detayı → bekleyen oda talebi → [Talebi geri çek]
→ onay istenir (yıkıcı işlem, 11 ST-DES-01)
→ Cancelled; slot serbest kalır (BR-APR-16)
→ onaylayıcı bilgilendirilir
```

### F-APR-4 · Seri talebi
```
16-room-booking → seri için onay gerektiren oda seç
→ tüm occurrence'lar önden kontrol edilir (BR-APR-09)
→ kısmi problem varsa çözülmeden talep gönderilmez
→ tek talep oluşur; kuyrukta tek satır, occurrence sayısıyla (BR-APR-08/30)
→ karar tüm seriye uygulanır (BR-APR-23)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-APR-01** | Onay ve red aksiyonları kuyrukta **tek etkileşimle** erişilebilir olmalıdır. |
| **IR-APR-02** | Red aksiyonu **gerekçe girme fırsatı** sunar; gerekçe zorunlu değildir ancak atlanması bilinçli bir seçim olmalıdır. |
| **IR-APR-03** | Onaylayıcı, karar öncesi talebin bağlamını **kuyruktan ayrılmadan** görebilmelidir (BR-APR-24). |
| **IR-APR-04** | Talep eden, bekleyen talebinin durumunu **etkinlik detayından** görebilir; ayrı bir ekrana gitmesi gerekmez. |
| **IR-APR-05** | Karara bağlanmış bir talep için onay/red aksiyonları **pasif** olur ve sebebi okunur (`11` ST-DIS-02, BR-APR-22). |
| **IR-APR-06** | Seri talebinde occurrence sayısı ve tarih aralığı kuyrukta **okunabilir** olmalıdır. |
| **IR-APR-07** | Onaylayıcı aynı anda birden fazla odanın onaylayıcısıysa, kuyrukta **oda bazında filtreleme** yapabilir. |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`.

| State | Davranış |
|---|---|
| **Pending** | Kalıcı rozet; takvimde, oda görünümlerinde ve etkinlik detayında görünür (ST-PEND-01/02). Başarı dili kullanılmaz (ST-PEND-04). |
| **Approved** | Rezervasyon kesinleşti; oda `Rezerve` görünür. |
| **Rejected** | Slot serbest; etkinlik odasız kaldı. Etkinlik detayında **gerekçesiyle birlikte** görünür. |
| **Cancelled** | Talep geri çekildi veya etkinlik silindi. Kayıt korunur (BR-APR-31). |
| **Empty (kuyruk)** | Bekleyen talep yoksa açıkça söylenir (BR-APR-29). |
| **Disabled (karar aksiyonu)** | Karara bağlanmış talepte pasif; sebep okunur (IR-APR-05). |
| **Error (eşzamanlı karar)** | İki onaylayıcı aynı talebi aynı anda karara bağlarsa kaybeden tarafa ne olduğu açıkça söylenir (`11` EC-ST-03). |

---

## 9. Validation

| ID | Kural | Sınıf |
|---|---|---|
| **V-APR-01** | Karara bağlanmış talep tekrar karara bağlanamaz (BR-APR-22) | **Engelleyici** |
| **V-APR-04** | Kaldırma gerekçesi boş olamaz (BR-APR-28b) | **Engelleyici** |
| **V-APR-05** | Yalnız `Reserved` rezervasyon kaldırılabilir; sorumlu olunmayan odada aksiyon yoktur (BR-APR-28/28e) | **Engelleyici** |
| **V-APR-02** | Onaylayıcı olmayan kullanıcı karar veremez (BR-APR-17) | **Engelleyici** — aksiyon zaten görünmez |
| **V-APR-03** | Aynı etkinlik + oda için ikinci `Pending` talep oluşamaz (BR-APR-10) | **Engelleyici** |
| **V-APR-04** | Seri talebinde kısmi çakışma çözülmeden gönderim (BR-APR-09) | **Engelleyici** |
| **V-APR-06** | Talebi oluşturan dışında eligible approver yok (BR-APR-17b) | **Engelleyici** — talep oluşturulmaz |
| **V-APR-05** | Red gerekçesi | **Opsiyonel** — boş bırakılabilir |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-APR-01** | Odanın onay ayarı, bekleyen talep varken **kapatılır** | Bekleyen talep **otomatik onaylanmaz** (`13` BR-ROOM-15); onaylayıcının kararına kalır. Yeni rezervasyonlar onaysız geçer. |
| **EC-APR-02** | Odanın onay ayarı **açılır**, mevcut onaysız rezervasyonlar var | Mevcut rezervasyonlar **etkilenmez**; kural geriye dönük uygulanmaz (`10` SR-PRM-04, `13` SR-ROOM-08 ile aynı ilke). |
| **EC-APR-03** | Tek onaylayıcı organizasyondan çıkarılır | ⚠️ **BR-APR-02 invariant'ı ihlal edilmiş olur.** Oda **uyarı ile işaretlenir** (`13` EC-ROOM-04) ve organizasyon yöneticisinden **yeni onaylayıcı atanması veya onayın kapatılması** istenir. Bekleyen talepler o zamana kadar `Pending` kalır; ancak bu **kalıcı bir durum değil, çözülmesi gereken bir hatadır**. *(SR-APR-03)* |
| **EC-APR-04** | İki onaylayıcı aynı talebi aynı anda karara bağlar | İlk karar geçerlidir; ikinciye ne olduğu açıkça söylenir (`11` EC-ST-03). Sessiz üzerine yazma yapılmaz. |
| **EC-APR-05** | Talep eden, rezervasyon yetkisini bekleyen talebi varken kaybeder | Talep **otomatik iptal edilmez**; onaylayıcının kararına bırakılır (`10` EC-PRM-05). |
| **EC-APR-06** | Onaylanmış rezervasyonun sahibi rezervasyon yetkisini kaybeder | Rezervasyon **geçerli kalır** (`10` EC-PRM-06). |
| **EC-APR-07** | Oda pasife alınır, bekleyen talepler var | Talepler durur ve **karara bağlanabilir kalır**; yeni talep oluşturulamaz (`13` BR-ROOM-07, EC-ROOM-05). |
| **EC-APR-08** | Etkinliğin zamanı, talep beklerken değişir | Talep yeni aralık için yeniden değerlendirilir; yeni aralık bloke edilir, onaylayıcı bilgilendirilir (BR-APR-34). Çakışma varsa kullanıcı engelleyici hata görür (`16` BR-RB-20). |
| **EC-APR-09** | Seri talebi bekliyorken seri düzenlenir | Kapsam seçimi (`15` BR-EVT-34) talebi etkiler; etkilenecek occurrence sayısı kapsam isteminde belirtilir ve talep yeniden değerlendirilir. |
| **EC-APR-10** | Talep reddedildikten sonra kullanıcı aynı odayı tekrar seçer | **Yeni bir talep** oluşur (BR-APR-22); önceki red kaydı korunur. |
| **EC-APR-12** | Oda sorumlusu **kendi** rezervasyonunu kaldırır | İzin verilir — çıkar çatışması yoktur (BR-APR-17a self-approval yasağı **onaya** özgüdür). Kendine bildirim gitmez (`19` BR-NOT-22). |
| **EC-APR-13** | Rezervasyon kaldırıldıktan sonra sahibi aynı odayı tekrar ister | **Yeni bir talep** oluşur; kaldırma kaydı korunur (BR-APR-28c). Aynı slot boşsa engel yoktur. |
| **EC-APR-14** | Kaldırılan rezervasyonun etkinliği seri bir occurrence'a aitse | Yalnız **o occurrence** odasız kalır; serinin diğer occurrence'ları etkilenmez (`17` BR-SER-14 ile tutarlı). |
| **EC-APR-11** | Onaylayıcı, kendi oluşturduğu etkinliğin talebini görür | ⚠️ **Karara bağlayamaz** (BR-APR-17a). Kuyrukta talep görünür ancak Onayla/Reddet aksiyonları **gösterilmez**; başka bir onaylayıcı karar vermelidir. *(SR-APR-07)* |
| **EC-APR-13** | Odanın tek onaylayıcısı, talebi oluşturan kişinin kendisi | ⚠️ **Talep OLUŞTURULMAZ.** Engelleyici validasyon: *"Bu rezervasyonu onaylayabilecek başka bir kullanıcı bulunmuyor"* (BR-APR-17b). Kullanıcı başka oda seçer, onaysız oda seçer veya odasız devam eder (BR-APR-17e). Çözümsüz `Pending` üretilmez. |
| **EC-APR-14** | Bekleyen talebin etkinlik zamanı geçti | Talep terminal duruma geçer, slot serbest kalır, kayıt korunur (BR-APR-42/43/44). |
| **EC-APR-12** | Etkinlik silinir, talep `Pending` durumda | Talep `Cancelled` olur, kayıt silinmez, onaylayıcı bilgilendirilir (BR-APR-31, `15` BR-EVT-30). |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | `Rezerve edebilir` → "talep gönderebilir" dönüşümü (D-035a); onaylayıcının ek yetki kazanmaması |
| `11-system-states-spec.md` | Pending kalıcı durumu; boş kuyruk; disabled; eşzamanlı karar |
| `13-rooms-spec.md` | **Onay bayrağı ve onaylayıcı alanlarının kaynağı** |
| `15-event-spec.md` | Etkinlik silme ↔ talep iptali; seri kapsam seçimi |
| `16-room-booking-spec.md` | Talebin doğduğu yer; slot bloke etme; seri ön kontrolü |
| `19-notifications-spec.md` | Dört durum geçişinin bildirimleri |

---

## 12. Responsive Expectations

Desktop-first (D-047). **"Rezervasyon durumunu görme" mobil zorunlu akışlardandır** — ancak *onaylama* değildir.

| ID | Kural |
|---|---|
| **RS-APR-01** | Talep eden, kendi talebinin durumunu mobilde **görebilmelidir**. |
| **RS-APR-02** | Onay kuyruğu mobilde **erişilebilir** olmalıdır; ancak karar verme masaüstü için optimize edilir. |
| **RS-APR-03** | Kuyruk satırının bağlamı (BR-APR-26) mobilde kısaltılabilir, ancak talep eden ve tarih/saat kaybolmamalıdır. |

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Onay kuyruğu yeni bir yüzey.** Nerede yaşayacağı bir IA kararı: Odalar sekmesi altında mı, ayrı bir yüzey mi? Mevcut sistemde HTML taslağı "Odalar › Rezervasyon Talepleri" öneriyordu — ama bu bağlayıcı değil.
- **Onaylayıcı yalnızca kendi odalarını görüyor** (BR-APR-25). Kuyruk boşken bu, "hiç talep yok" ile "hiçbir odanın onaylayıcısı değilim" arasında ayrım gerektirir.
- **Üç rezervasyon durumu dört yerde görünüyor:** takvim chip'i · oda seçici · Odalara Göre görünümü · onay kuyruğu. Aynı görsel dil şart (`11` ST-PEND-02).
- **Red gerekçesi opsiyonel ama teşvik edilmeli** (IR-APR-02) — gerekçesiz red, talep edeni bilgisiz bırakır.
- **Seri talebi tek satır** ama N occurrence'ı temsil ediyor (BR-APR-30). Satırın bu ölçeği taşıması gerekiyor.
- Kuyruk, etkinlik detaylarını **sızdırmamalı** (BR-APR-27) — hangi bilginin gösterileceği dikkatli bir tasarım kararı.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-APR-01 | Onay yalnızca odada `Rezervasyon onayı gerekli` açıkken devreye girer; global bir mod yoktur. |
| AC-APR-02 | Onaylayıcı yalnızca sorumlu olduğu odaların taleplerini görür. |
| AC-APR-03 | Onaylayıcı olmak, odayı veya etkinliği düzenleme yetkisi vermez. |
| AC-APR-04 | Onay gerektiren odada etkinlik oluşur ancak rezervasyon `Pending` başlar ve başarı dili kullanılmaz. |
| AC-APR-05 | Bekleyen talep slotu bloke eder; diğer kullanıcılar odayı "Onay bekliyor" görür ve seçemez. |
| AC-APR-06 | Aynı slota ikinci bir bekleyen talep oluşturulamaz. |
| AC-APR-07 | Red sonrası slot serbest kalır ve etkinlik silinmez, odasız kalır. |
| AC-APR-08 | Redde opsiyonel gerekçe girilebilir ve gerekçe talep edene iletilir. |
| AC-APR-09 | Karara bağlanmış bir talep tekrar karara bağlanamaz. |
| AC-APR-10 | Talep eden kendi bekleyen talebini geri çekebilir. |
| AC-APR-11 | Kuyruk satırı etkinlik, oda, talep eden, tarih/saat, tekrar bilgisi ve durumu gösterir. |
| AC-APR-12 | Seri talebi kuyrukta tek satır olarak görünür ve occurrence sayısını belirtir. |
| AC-APR-13 | Seri kararı tüm seriye uygulanır; kısmi onay yoktur. |
| AC-APR-14 | Etkinlik silindiğinde bekleyen talep `Cancelled` olur; kayıt silinmez. |
| AC-APR-15 | Dört durum geçişi de bildirim üretir. |
| AC-APR-16 | Boş kuyruk açıkça belirtilir. |
| AC-APR-17 | Çok aşamalı onay, approval chain veya koşullu kural arayüzü bulunmaz. |
| AC-APR-18 | Onay açıkken onaylayıcı seçilmeden oda kaydedilemez; alan bazlı hata gösterilir. |
| AC-APR-19 | Onay açıkken son onaylayıcı kaldırılamaz; işlem engellenir. |
| AC-APR-20 | Onay kapatıldığında onaylayıcı zorunluluğu kalkar. |
| AC-APR-21 | Talep eden, kendi talebinde Onayla/Reddet aksiyonlarını görmez. |
| AC-APR-22 | Talebi oluşturan dışında eligible approver yoksa rezervasyon `Pending` olarak oluşturulmaz; engelleyici validasyon gösterilir ve kurtarma yolları sunulur. |
| AC-APR-23 | Başlangıç zamanı geçmiş bekleyen talep terminal duruma geçer ve slotu bloke etmez. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-APR-01 | `Rejected` sonrası etkinlik ne olur? | **Silinmez, odasız kalır** (BR-APR-19) | Etkinlik ve rezervasyon ayrı varlıklar; reddedilen oda talebi toplantıyı iptal etmemeli |
| SR-APR-02 | Red gerekçesi zorunlu mu? | **Opsiyonel** (BR-APR-20) | Benchmark'ta Skedda'da da opsiyonel `[O]`; zorunlu tutmak reddi geciktirir. Ancak UI teşvik etmeli (IR-APR-02) |
| SR-APR-03 | Onaylayıcısız kalan oda | ⚠️ **Bu durum bir invariant ihlalidir ve önlenir** (BR-APR-02/02a/02b). Yalnızca kullanıcı silinmesi gibi dolaylı yollarla oluşabilir; oluşursa **çözülmesi gereken hata** olarak işaretlenir | Onaylayıcısız approval-required oda **kalıcı broken-state** üretir; form seviyesinde engellenmeli |
| SR-APR-04 | Karar geri alınabilir mi? | **Hayır; yeni talep gerekir** (BR-APR-22) | Geri alma, durum makinesini ve bildirim akışını karmaşıklaştırır; D-034'ün basit tutma kısıtına aykırı |
| SR-APR-05 | Kuyruk ne kadar bilgi gösterir? | **Karar için gereken minimum bağlam** (BR-APR-27) | Onaylayıcı, talep edenin takvim detaylarına erişim kazanmamalı — `10` BR-PRM-11'in sızıntı kanalı olmamalı |
| SR-APR-09 | Aynı slota birden fazla talep gelebilir mi? | ✅ **Evet — rakip talepler birikir** (BR-APR-11/12/13). Kullanıcı engellenmez; çakışma **karar anında** değerlendirilir (BR-APR-13a) ve onay diğerlerini **otomatik reddetmez** (BR-APR-13b) | D-036 ilk gelenin slotu kapatmasını seçmişti; pratikte "iki kişi aynı odayı istedi, hangisi daha acil" değerlendirmesi yapılamıyordu. Ürün sahibi kararıyla model değişti — **D-070**. ⚠️ Otomatik red bilinçli olarak **yok**: onaylanmayan talebin akıbetini yönetici açıkça belirler. Fiziksel çakışma yine imkânsız, çünkü ikinci onay engellenir |
| SR-APR-10 | "Bu odaya kimin isteği var" nerede görünür? | **Odanın kendi yüzeyinde** (BR-APR-25a) | Onay kuyruğu *onaylayıcı* eksenlidir: tüm odaların talepleri karışık gelir. Soru odadan başladığında cevap da odada olmalı. Detay görünürlüğü BR-PRM-06 ile sınırlandırıldı |
| SR-APR-11 | Onaylanmış rezervasyon sonradan kaldırılabilir mi? | ✅ **Evet — oda sorumlusu, zorunlu gerekçeyle** (BR-APR-28). ⚠️ Bu, BR-APR-22'nin ihlali **değildir**: karar geri alınmaz, rezervasyon düşer | D-070 otomatik reddi kaldırınca ikinci onayı engelleyen mesaj *"önce o rezervasyonu kaldırın"* diyordu, ama böyle bir yol yoktu — kullanıcıya **yapamayacağı** bir eylem öneriliyordu. Ayrıca bakım/acil durumda oda serbest bırakılamazsa, sahibi ulaşılamaz olduğunda oda süresiz kilitlenir. Yetkiyi **tek bir eyleme ve tek bir odaya** daraltmak, BR-APR-04'ün *"onaylayıcı ayrıcalıklı kullanıcı değildir"* ilkesini korur — **D-071** |
| SR-APR-12 | Kaldırma gerekçesi neden zorunlu, red gerekçesi opsiyonelken? | **Kaldırma beklenmeyen bir müdahaledir** (BR-APR-28b) | Red, talep edenin **cevap beklediği** bir kararın sonucudur; sessiz kalınsa bile bağlam bellidir. Kaldırma ise sahibinin planına **girmiş** bir rezervasyonu geri alır: gerekçe olmadan yalnız *"odam gitti"* bilgisi kalır ve bu bir destek çağrısına dönüşür |
| SR-APR-06 | Etkinlik zamanı değişirse talep? | **Yeniden değerlendirilir, iptal edilmez** (BR-APR-34) | Otomatik iptal kullanıcıyı sürprizle karşılar; onaylayıcının bilgilendirilmesi yeterli |
| SR-APR-07 | Kendi talebini onaylama | ⚠️ **Engellenir** (BR-APR-17a); ayrıca **eligible approver yoksa talep hiç oluşturulmaz** (BR-APR-17b) | Onay bağımsız bir karar mekanizmasıdır. Talep oluşturulup karara bağlanamaması **çözümsüz Pending** üretirdi; engelleme talep aşamasına alındı. Self-approval politikası kapsam dışı (BR-APR-17c) |
