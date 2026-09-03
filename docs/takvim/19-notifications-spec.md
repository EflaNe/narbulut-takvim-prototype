# 19 — Notifications Spec

**Cluster:** PC-13 · **Katman:** Output / Communication · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-044, D-034, D-036, D-039, D-040, D-043 · **Scope referansı:** `04-scope-closure.md` §PC-13
**Source of truth:** izinler → `10` · durumlar → `11` · etkinlik → `15` · oda seçimi → `16` · onay → `18`

---

## 1. Purpose

Bu spec tek bir soruyu cevaplar:

> **Hangi domain event bir iletişim olayı doğurur, kime gider ve hangi bilgiyi taşımak zorundadır?**

**Bu spec e-posta tasarımı yapmaz.** Konu satırı, metin, HTML şablonu, görsel tasarım ve nihai kanal matrisi **FAZ 8'e aittir** (D-044).

---

## 2. Scope

### In Scope
- **Bildirim üreten domain event'lerinin envanteri** *(etkinlik · seri · **takvim paylaşımı** · rezervasyon)*
- Her olay için **alıcı kümesi**
- Her olayın **taşımak zorunda olduğu bilgi** *(içerik değil, bilgi gereksinimi)*
- **Kanal gereksinimi işaretleme** — özellikle e-posta zorunlu olan olaylar
- Gürültü kontrolü ilkeleri
- Bildirimin taşıyamayacağı bilgi *(gizlilik sınırı)*

### Out of Scope — **FAZ 8'e ait**
- **E-posta konu satırı ve metin (copy)**
- **HTML şablonu ve görsel tasarım**
- **Nihai kanal matrisi** — hangi olay hangi kanaldan (D-044)
- Bildirim tercih/ayar yüzeyinin tasarımı
- Gönderim zamanlaması, toplu gönderim, dijest davranışı

### Out of Scope — kapsam dışı
- **Etkinlik hatırlatıcısı** *(`04-scope-closure.md` §PC-13; C-5 iç kaynaklı aday, FAZ 8'de yeniden değerlendirilebilir)*
- Uygulama içi bildirim merkezinin kendisi *(platform bileşeni)*
- RSVP akışının ürün tasarımı — bu spec yalnızca **bildirim boyutunu** tanımlar

---

## 3. Actors

| Aktör | Bildirim ilişkisi |
|---|---|
| **Organizatör** | Kendi etkinliğiyle ilgili sonuçları alır *(RSVP yanıtları, rezervasyon kararları)* |
| **Katılımcı (iç kullanıcı)** | Davet, güncelleme ve iptal alır. **Uygulama içi + e-posta** mümkündür. |
| **Harici misafir** | Uygulamada **yoktur**. ⚠️ **Tek kanalı e-postadır** (D-044). |
| **Onaylayıcı** | Sorumlu olduğu odaların talep olaylarını alır (`18` BR-APR-37) |
| **Organizasyon yöneticisi** | Bu modülde **özel bir alıcı değildir**; yalnızca organizatör veya katılımcı olduğu etkinlikler için bildirim alır. *(SR-NOT-05)* |

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Domain event** | Sistemde gerçekleşen ve iletişim gerektirebilecek durum değişikliği. |
| **Bildirim olayı** | Bir domain event'in bir alıcı kümesine iletilmesi. |
| **Alıcı kümesi** | Olaydan haberdar edilmesi gereken aktörler. |
| **Kanal** | `Uygulama içi` · `E-posta`. İkisi de desteklenir (D-044). |
| **Zorunlu e-posta** | Alıcının uygulamada bulunmaması nedeniyle e-postanın **tek seçenek** olduğu durum. |
| **Bilgi gereksinimi** | Bildirimin taşımak *zorunda* olduğu asgari bilgi. Metin değil, bilgi. |

---

## 5. Business Rules

### 5.1 Genel

| ID | Kural |
|---|---|
| **BR-NOT-01** | **İki kanal desteklenir:** e-posta ve uygulama içi bildirim (D-044). |
| **BR-NOT-02** | **Her olayın her iki kanaldan gitmesi zorunlu değildir.** Olay–kanal dağılımı **FAZ 8**'de belirlenir (D-044). |
| **BR-NOT-03** | **Harici misafirler için e-posta tek kanaldır** (D-044, `10` BR-PRM-18). Harici katılımcısı olan hiçbir olay yalnızca uygulama içi bildirime bırakılamaz. |
| **BR-NOT-04** | Bildirim, alıcının **görme hakkı olmayan** hiçbir bilgiyi taşıyamaz. Free/busy detay yasağı (`10` BR-PRM-11) bildirimlerde de geçerlidir. |
| **BR-NOT-05** | **Kullanıcının kendi eylemi kendisine bildirim üretmez.** Sonucu ekranda zaten görür (`11` ST-SUC-02). |
| **BR-NOT-06** | Kullanıcının **başlatmadığı** bir durum değişikliği **her zaman** bildirim üretir (`11` IR-ST-04). |
| **BR-NOT-07** | **Gürültü kontrolü birinci sınıf gereksinimdir.** Yalnızca değişiklikten **fiilen etkilenen** alıcılara gönderilir *(benchmark: Outlook'un "sadece eklenen/çıkarılan katılımcılara gönder" seçeneği `[O]`)*. |
| **BR-NOT-08** | Bir kullanıcı eylemi birden fazla domain event doğuruyorsa, alıcı başına **tek bir birleşik bildirim** üretilir. *(SR-NOT-01)* |

### 5.2 Etkinlik olayları

| # | Domain event | Alıcı | Taşımak zorunda | E-posta zorunlu mu? |
|---|---|---|---|---|
| **N-EVT-01** | **Etkinliğe davet edildin** | Katılımcılar *(iç + harici)* | Etkinlik adı · tarih/saat · yer veya oda · organizatör · **zorunlu/opsiyonel** olduğu (D-040) | ✅ **Harici katılımcı varsa** |
| **N-EVT-02** | **Etkinlik güncellendi** | **Yalnızca değişiklikten etkilenen** katılımcılar (BR-NOT-07) | Neyin değiştiği · yeni değer | ✅ Harici varsa |
| **N-EVT-03** | **Etkinlik iptal edildi / silindi** | Tüm katılımcılar | Etkinlik adı · iptal edilen tarih/saat | ✅ Harici varsa |
| **N-EVT-04** | **Katılımcı eklendi** | Yalnızca **eklenen** katılımcı | N-EVT-01 ile aynı bilgi | ✅ Eklenen harici ise |
| **N-EVT-05** | **Katılımcı çıkarıldı** | Yalnızca **çıkarılan** katılımcı | Etkinlik adı · artık davetli olmadığı | ✅ Çıkarılan harici ise |
| **N-EVT-06** | **RSVP yanıtı verildi** | Organizatör | Kim · hangi yanıt · zorunlu mu opsiyonel mi | ❌ *(organizatör iç kullanıcı)* |

> **Not — N-EVT-06:** RSVP akışının ürün tasarımı bu spec'in kapsamı dışındadır (§2). Buradaki tek iddia: **RSVP yanıtı verilirse organizatöre bildirim gitmelidir.**

### 5.3 Tekrarlayan seri olayları

| # | Domain event | Alıcı | Taşımak zorunda | E-posta zorunlu mu? |
|---|---|---|---|---|
| **N-SER-01** | **Seri güncellendi** | Etkilenen katılımcılar | **Uygulanan kapsam** *(bu / bu ve sonrakiler / tüm seri)* · etkilenen occurrence sayısı · neyin değiştiği | ✅ Harici varsa |
| **N-SER-02** | **Seri iptal edildi** | Tüm katılımcılar | Uygulanan kapsam · iptal edilen occurrence sayısı ve tarih aralığı | ✅ Harici varsa |
| **N-SER-03** | **Tek occurrence seriden ayrıldı veya iptal edildi** | Etkilenen katılımcılar | Hangi tarihin etkilendiği · seriye ait olduğu | ✅ Harici varsa |

| ID | Kural |
|---|---|
| **BR-NOT-09** | **Seri değişikliği occurrence başına bildirim üretmez.** N occurrence değiştiyse alıcı **tek bildirim** alır ve kapsam bilgisini taşır (BR-NOT-08). *(SR-NOT-01)* |
| **BR-NOT-10** | Seri bildirimi, `15` BR-EVT-34'teki **kapsam sözlüğünü birebir aynı** kullanır (BR-EVT-36). |
| **BR-NOT-11** | ⚠️ **"Tüm seri" geçmiş occurrence'ları etkilediyse bu bildirimde belirtilir** (`15` BR-EVT-34a). |

### 5.4 Takvim paylaşım olayları

| # | Domain event | Alıcı | Taşımak zorunda | E-posta zorunlu mu? |
|---|---|---|---|---|
| **N-CAL-01** | **Takvim seninle paylaşıldı** | Paylaşım alıcısı | Takvim adı · **sahibin adı** · erişimin kapsamı *(etkinlik detayları, salt okunur)* | ❌ *(alıcı iç kullanıcı)* |
| **N-CAL-02** | **Takvim paylaşımı kaldırıldı** | Eski paylaşım alıcısı | Takvim adı · sahibin adı · erişimin sona erdiği | ❌ |

| ID | Kural |
|---|---|
| **BR-NOT-21** | Paylaşım ve paylaşım kaldırma **her zaman bildirim üretir** — sahibin eylemidir, alıcıya ulaşır (`19` BR-NOT-06, `12` BR-CAL-37). |
| **BR-NOT-22** | Paylaşımı **sahip kaldırdığında** alıcı bildirim alır (N-CAL-02). **Alıcı kendisi kaldırdığında** (`12` BR-CAL-34) kendi eylemi olduğu için kendisine bildirim gitmez (BR-NOT-05); **sahibe de gitmez.** *(SR-NOT-07)* |
| **BR-NOT-23** | Takvim **silindiğinde** paylaşımlar düştüğü için alıcılar N-CAL-02 alır (`12` EC-CAL-09). |
| **BR-NOT-24** | Takvim sahibi organizasyondan ayrıldığında paylaşımlar kaldırılır (D-066); alıcılara **N-CAL-02 gönderilir**. *(SR-NOT-08)* |
| **BR-NOT-25** | ⚠️ Paylaşım bildirimleri **etkinlik detayı taşımaz** — yalnızca takvim adı, sahip ve erişim kapsamı. Detaya erişim takvimin kendisinden sağlanır (BR-NOT-04). |

---

### 5.5 Rezervasyon ve onay olayları

| # | Domain event | Alıcı | Taşımak zorunda | E-posta zorunlu mu? |
|---|---|---|---|---|
| **N-RES-01** | **Rezervasyon talebi gönderildi** | **Onaylayıcı(lar)** | Oda · tarih/saat · talep eden · seri ise occurrence sayısı | ❌ *(onaylayıcı iç kullanıcı)* |
| **N-RES-02** | **Rezervasyon onaylandı** | Talep eden | Oda · tarih/saat · kararı veren | ❌ |
| **N-RES-03** | **Rezervasyon reddedildi** | Talep eden | Oda · tarih/saat · kararı veren · **varsa red gerekçesi** (`18` BR-APR-20/38) | ❌ |
| **N-RES-04** | **Rezervasyon iptal edildi** | Karşı taraf: talep eden geri çektiyse **onaylayıcı**, etkinlik silindiyse **onaylayıcı** | Oda · tarih/saat · iptal sebebi *(geri çekildi / etkinlik silindi)* | ❌ |
| **N-RES-05** | **Bekleyen talebin etkinlik zamanı değişti** | Onaylayıcı | Oda · eski ve yeni tarih/saat (`18` BR-APR-34) | ❌ |
| **N-RES-06** ⚠️ | **Rezervasyon oda sorumlusu tarafından kaldırıldı** | Rezervasyon sahibi | Oda · tarih/saat · etkinlik · kaldıran · **zorunlu gerekçe** (`18` BR-APR-28b) · *"etkinliğiniz duruyor, odasız kaldı"* | ❌ |
| **N-RES-07** ⚠️ | **Tekrar talep daveti** *(reddedilmiş talep için)* | Reddedilen talebin sahibi | Oda · tarih/saat · etkinlik · daveti gönderen · **zorunlu gerekçe** (`18` BR-APR-29b). ⚠️ Metin, reddin **kalktığını ima etmemelidir** — yeni talebi kullanıcı gönderir (BR-APR-29a) | ❌ |

| ID | Kural |
|---|---|
| **BR-NOT-12** | **Dört rezervasyon durum geçişi de bildirim üretir:** gönderildi · onaylandı · reddedildi · iptal edildi (`18` BR-APR-36). |
| **BR-NOT-13** | Talep gönderildiğinde **onaylayıcı**, karar verildiğinde **talep eden** bilgilendirilir (`18` BR-APR-37). |
| **BR-NOT-14** | Seri talebi **tek talep** olduğu için **tek bildirim** üretir; occurrence başına bildirim gitmez (`18` BR-APR-08). |
| **BR-NOT-15** | ⚠️ **Rezervasyon bildirimleri etkinlik detayını sızdırmaz.** Onaylayıcı, karar için gereken bağlamı alır — talep edenin takvim detaylarını değil (`18` BR-APR-27, `10` BR-PRM-11). |
| **BR-NOT-16** | Rezervasyon **onaya düşmeden doğrudan gerçekleştiyse** ayrı bir bildirim üretilmez; sonuç etkinlik oluşturma bildiriminin parçasıdır (BR-NOT-05, `11` ST-SUC-04). |

### 5.6 Gizlilik sınırları

| ID | Kural |
|---|---|
| **BR-NOT-17** | Bildirim, alıcının **erişemeyeceği bir etkinliğin** adını, katılımcılarını veya detayını taşıyamaz (BR-NOT-04). |
| **BR-NOT-18** | Oda çakışması nedeniyle üretilen hiçbir bildirim, **çakışan diğer etkinliğin** bilgisini içermez (`16` BR-RB-22). |
| **BR-NOT-19** | Harici misafire giden bildirim, **organizasyonun iç yapısını** (grup adları, diğer odalar, iç kullanıcı listeleri) açığa çıkarmaz. *(SR-NOT-04)* |
| **BR-NOT-20** | Free/busy bilgisi hiçbir bildirimde **detaylandırılmaz** (D-027, `10` BR-PRM-11). |

---

## 6. User Flows

> Bu spec kullanıcı akışı tanımlamaz; olay akışı tanımlar. Aşağıdakiler diğer spec'lerin akışlarının iletişim boyutudur.

### F-NOT-1 · Etkinlik oluşturma sonrası
```
15-event → etkinlik oluşturuldu
→ katılımcı var mı?
   ├── iç kullanıcı → N-EVT-01
   └── harici misafir → N-EVT-01, kanal: E-POSTA ZORUNLU (BR-NOT-03)
→ oda seçildi ve onay gerekiyor mu?
   └── evet → N-RES-01 (onaylayıcıya)
→ organizatöre ayrıca bildirim GİTMEZ (BR-NOT-05); sonuç ekranda gösterilir (11 ST-SUC-04)
```

### F-NOT-2 · Etkinlik güncelleme
```
15-event → değişiklik kaydedildi
→ değişiklikten fiilen etkilenenler belirlenir (BR-NOT-07)
   ├── yalnızca katılımcı listesi değiştiyse → yalnızca eklenen/çıkarılana (N-EVT-04/05)
   └── zaman/oda/başlık değiştiyse → tüm katılımcılara (N-EVT-02)
→ seri değişikliğiyse → tek bildirim + kapsam bilgisi (N-SER-01, BR-NOT-09/10/11)
→ bekleyen oda talebi etkilendiyse → onaylayıcıya (N-RES-05)
→ hepsi alıcı başına TEK bildirimde birleşir (BR-NOT-08)
```

### F-NOT-3 · Rezervasyon kararı
```
18-reservation-approval → onaylayıcı karar verir
   ├── Onayla → N-RES-02 (talep edene)
   └── Reddet → N-RES-03 (talep edene, varsa gerekçeyle)

oda sorumlusu reddedilmiş talebe davet gönderdi (18 BR-APR-29)
   └── N-RES-07 (talep edene, ZORUNLU gerekçeyle)
       ⚠️ talep hâlâ Rejected — bildirim bunu ima etmemeli
       ⚠️ bir talebe yalnız bir kez (BR-APR-29c)

oda sorumlusu kesinleşmiş rezervasyonu kaldırdı (18 BR-APR-28)
   └── N-RES-06 (rezervasyon sahibine, ZORUNLU gerekçeyle)
       ⚠️ kendi rezervasyonunu kaldırana bildirim gitmez (BR-NOT-22)
       ⚠️ katılımcılara ayrıca bildirim gitmez — oda değişikliği
          katılımcıya görünürse N-EVT-02 kapsamına girer (EC-NOT-08 ile aynı ilke)
→ karar veren kişiye bildirim GİTMEZ (BR-NOT-05)
```

### F-NOT-4 · Etkinlik silme
```
15-event → etkinlik silindi
→ N-EVT-03 tüm katılımcılara (harici varsa e-posta zorunlu)
→ bağlı rezervasyon Cancelled oldu mu? → N-RES-04 onaylayıcıya (18 BR-APR-31)
→ seriyse → N-SER-02, kapsam ve occurrence sayısıyla
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-NOT-01** | Uygulama içi bildirim, kullanıcıyı **ilgili etkinliğe veya talebe** götürebilmelidir. |
| **IR-NOT-02** | Bir bildirim okunduğunda veya karşılık gelen aksiyon yapıldığında **artık bekleyen bir iş gibi görünmemelidir**. |
| **IR-NOT-03** | Onaylayıcı için bekleyen talep bildirimleri, onay kuyruğuyla **tutarlı** olmalıdır — kuyrukta olmayan bir talep bildirimde bekliyor görünmemelidir (`18` BR-APR-28). |
| **IR-NOT-04** | Bildirim gönderimi başarısız olursa bu **sessizce yutulmaz**; kullanıcı işlemin sonucunu görürken gönderim sorununu da öğrenir (`11` ST-CORE-01, EC-ST-05). |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`.

| State | Davranış |
|---|---|
| **Gönderildi** | İşlem sonucu bildiriminde yan etki olarak belirtilir: *"3 kişiye davet gönderildi"* (`11` ST-SUC-04). |
| **Kısmen gönderilemedi** | Etkinlik başarısı bildirilir, gönderim sorunu **ayrıca ve açıkça** belirtilir (`11` EC-ST-05). |
| **Bekleyen (onaylayıcı için)** | Bekleyen talep bildirimi, karar verilene kadar **aktif iş** olarak kalır (IR-NOT-02/03). |

---

## 9. Validation

Bu modül kullanıcı girdisi almaz. Tek doğrulama alanı harici katılımcı e-postasıdır ve `15` V-EVT-04'te tanımlıdır.

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-NOT-01** | Etkinlik oluşturuldu, oda onaya düştü, harici katılımcı var | **Tek birleşik bildirim** (BR-NOT-08): davet + oda durumunun beklemede olduğu. Harici için e-posta (BR-NOT-03). |
| **EC-NOT-02** | Yalnızca etkinlik notu değişti | Katılımcılar **etkilenmiş sayılır mı?** → Değişiklik katılımcıya görünür bir alan ise bildirim gider; görünmeyen bir alansa gitmez (BR-NOT-07). *(SR-NOT-02)* |
| **EC-NOT-03** | Katılımcı eklendi **ve** zaman değişti, aynı kayıtta | Eklenen kişi tek bildirim alır *(davet)*; mevcut katılımcılar tek bildirim alır *(güncelleme)* (BR-NOT-08). |
| **EC-NOT-04** | Organizatör kendi etkinliğine katılımcı olarak da dahil | Kendi eylemi için bildirim almaz (BR-NOT-05); başkasının yaptığı değişiklik için alır (BR-NOT-06). |
| **EC-NOT-05** | Organizasyon yöneticisi başkasının etkinliğini düzenler (D-039) | Katılımcılar N-EVT-02 alır. **Organizatör de alır** — kendi başlatmadığı bir değişikliktir (BR-NOT-06). *(SR-NOT-03)* |
| **EC-NOT-06** | Katılımcı organizasyondan çıkarıldı, etkinlik hâlâ duruyor | Etkinlik bildirimlerinden **düşürülür**; ancak katılımcı listesinden sessizce silinmez (`15` EC-EVT-06). |
| **EC-NOT-07** | Onaylayıcı olmayan biri odanın onaylayıcısı yapıldı, bekleyen talepler var | Yeni onaylayıcı bekleyen talepler için bildirim alır — kuyruğuyla tutarlı olması gerekir (IR-NOT-03). |
| **EC-NOT-09** | Rezervasyonu kaldıran, aynı zamanda sahibi | Bildirim **gitmez** (BR-NOT-22). Eylemin sonucu zaten ekranda görünür. |
| **EC-NOT-08** | Oda talebi reddedildi, etkinlik odasız kaldı | Talep edene N-RES-03 gider. **Katılımcılara ayrıca bildirim gitmez** — oda değişikliği katılımcıya görünürse N-EVT-02 kapsamına girer. *(SR-NOT-02 ile tutarlı)* |
| **EC-NOT-09** | Süresiz seri iptal edilir | N-SER-02, occurrence sayısı yerine **tarih aralığı** ile ifade edilir (`15` BR-EVT-38). |
| **EC-NOT-10** | Harici misafirin e-posta adresi geçersiz / ulaşmıyor | Gönderim sorunu **açıkça bildirilir** (IR-NOT-04). Etkinlik yine de geçerlidir. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | Gizlilik sınırı (BR-PRM-11); harici misafirin uygulamada olmaması (BR-PRM-18) |
| `11-system-states-spec.md` | Başarı bildiriminin yan etkileri (ST-SUC-04); kısmi başarı (EC-ST-05); IR-ST-04 |
| `15-event-spec.md` | Etkinlik olayları; katılımcı modeli; seri kapsam sözlüğü |
| `16-room-booking-spec.md` | Çakışma bilgisinin sızdırılmaması (BR-RB-22) |
| `18-reservation-approval-spec.md` | Dört rezervasyon durum geçişi; onaylayıcı bağlam sınırı |
| `12-calendars-spec.md` | **N-CAL-01 / N-CAL-02** paylaşım olaylarının kaynağı (`12` BR-CAL-37) |
| **FAZ 8** | **Calendar Email & Notification Matrix** — kanal dağılımı, konu satırı, metin, şablon, görsel tasarım |

---

## 12. Responsive Expectations

Bu spec bir yüzey tanımlamaz. Uygulama içi bildirim platform bileşenidir; e-posta istemcide render edilir.

⚠️ **Prototip notu (2 Eylül 2026):** yüzeyin hiç olmaması, üretilen olayların doğrulanamamasına
yol açtı — paylaşım yapılıyor, bildirim üretiliyor, ama hiçbir yerde görünmüyordu. Prototipe
**minimum bir karşılık** eklendi: üst çubukta okunmamış sayacı taşıyan bir çan ve bildirim
listesi. ⚠️ Bu yüzey **yeni bildirim türü üretmez**; yalnız bu spec'te tanımlı olayları gösterir.
Gerçek üründe yüzeyin platforma mı ait olacağı kararı değişmedi (SR-NOT-09).

Tek kısıt: **bildirimden ilgili etkinliğe/talebe gidiş mobilde de çalışmalıdır** (IR-NOT-01) — "rezervasyon durumunu görme" mobil zorunlu akışlardandır (D-047).

---

## 13. Design Implications *(FAZ 8'e taşınacak)*

> ⚠️ Bu maddeler **FAZ 6 Design Brief'e değil, FAZ 8 Email Design System'e** girdidir.

- **Bu spec'in ürettiği envanter, FAZ 8'in kanal matrisinin satır kümesidir:** 6 etkinlik + 3 seri + **2 takvim paylaşımı** + 5 rezervasyon olayı = **16 domain event**.
- **E-posta zorunlu olan olaylar önceden belirlidir:** harici katılımcı içeren tüm etkinlik olayları (N-EVT-01…05, N-SER-01…03). Rezervasyon **ve takvim paylaşımı** olaylarının hiçbirinde e-posta yapısal olarak zorunlu değil — tüm alıcıları iç kullanıcı.
- **Birleşik bildirim gereksinimi (BR-NOT-08) şablon tasarımını etkiler:** tek bir bildirim birden fazla değişikliği taşıyabilmeli.
- **Seri bildirimleri kapsam bilgisini taşımak zorunda** (BR-NOT-10/11) ve sözlük `15` ile birebir aynı olmalı.
- **Gizlilik sınırları şablonda kodlanmalı** (BR-NOT-17…20): çakışan etkinlik adı, free/busy detayı ve iç organizasyon yapısı hiçbir şablonda yer alamaz.
- Gürültü kontrolü (BR-NOT-07) için "kim etkilendi" hesabı **gönderim öncesi** yapılmalıdır.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-NOT-01 | 16 domain event'in tamamı bir alıcı kümesi ve bilgi gereksinimi ile tanımlıdır. |
| AC-NOT-02 | Harici katılımcı içeren her etkinlik olayı e-posta üretir. |
| AC-NOT-03 | Kullanıcının kendi eylemi kendisine bildirim üretmez. |
| AC-NOT-04 | Kullanıcının başlatmadığı her durum değişikliği bildirim üretir. |
| AC-NOT-05 | Yalnızca katılımcı listesi değiştiğinde bildirim yalnızca eklenen/çıkarılan kişilere gider. |
| AC-NOT-06 | Seri değişikliği occurrence başına değil, alıcı başına tek bildirim üretir ve kapsam bilgisini taşır. |
| AC-NOT-07 | "Tüm seri" geçmiş occurrence'ları etkilediyse bildirim bunu belirtir. |
| AC-NOT-08 | Dört rezervasyon durum geçişi de bildirim üretir. |
| AC-NOT-09 | Red bildirimi, gerekçe girildiyse gerekçeyi taşır. |
| AC-NOT-10 | Seri rezervasyon talebi tek bildirim üretir. |
| AC-NOT-11 | Hiçbir bildirim, alıcının erişemeyeceği bir etkinliğin adını veya detayını taşımaz. |
| AC-NOT-12 | Çakışma kaynaklı hiçbir bildirim, çakışan diğer etkinliğin bilgisini içermez. |
| AC-NOT-13 | Bir kullanıcı eylemi birden çok olay doğurduğunda alıcı başına tek birleşik bildirim üretilir. |
| AC-NOT-14 | Bildirim gönderimi başarısız olduğunda bu sessizce yutulmaz. |
| AC-NOT-16 | Takvim paylaşımı ve paylaşımın kaldırılması bildirim üretir. |
| AC-NOT-17 | Paylaşım bildirimi takvim adı, sahip ve erişim kapsamını taşır; etkinlik detayı taşımaz. |
| AC-NOT-15 | Bu spec e-posta konusu, metni, şablonu veya görsel tasarımı içermez. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-NOT-01 | Bir eylem birden çok olay doğurursa | **Alıcı başına tek birleşik bildirim** (BR-NOT-08) | Benchmark'ta gürültü kontrolü birinci sınıf mesele `[O]`. Beş ayrı e-posta, bir kullanıcı eyleminin sonucu olmamalı |
| SR-NOT-02 | Hangi güncelleme bildirim üretir? | **Katılımcıya görünür alan değiştiyse** (BR-NOT-07, EC-NOT-02) | "Her değişiklik bildirim" gürültü üretir; "hiçbiri" tutarsız takvim üretir. Görünürlük doğal sınır |
| SR-NOT-03 | Yönetici düzenlerse organizatör bildirim alır mı? | **Evet** (EC-NOT-05) | D-039 yöneticiye müdahale hakkı verdi; organizatörün kendi etkinliğindeki değişiklikten habersiz kalması kabul edilemez |
| SR-NOT-04 | Harici misafire ne kadar bilgi? | **Organizasyonun iç yapısı açığa çıkmaz** (BR-NOT-19) | Harici misafir organizasyon üyesi değil (`10` BR-PRM-18); grup adları ve iç kullanıcı listeleri sızmamalı |
| SR-NOT-05 | Organizasyon yöneticisi özel alıcı mı? | **Hayır** | D-039 yöneticiye *yetki* verdi, *abonelik* değil. Tüm etkinlik bildirimlerini yöneticiye göndermek gürültü üretir |
| SR-NOT-06 | Onaya düşmeyen rezervasyon | **Ayrı bildirim üretmez** (BR-NOT-16) | Sonuç etkinlik oluşturma bildiriminin parçası; ayrı bildirim gereksiz gürültü |
| SR-NOT-07 | Alıcı paylaşımı kendisi kaldırırsa sahip bilgilendirilir mi? | **Hayır** (BR-NOT-22) | Sahibin aksiyon alması gerekmiyor; `19` BR-NOT-07 gürültü kontrolüyle tutarlı. Sahip paylaşım listesinden zaten görebilir |
| SR-NOT-09 | Uygulama içi bildirim yüzeyi kimin işi? | **Karar değişmedi: platformun.** Prototipte yalnızca doğrulanabilirlik için minimum bir karşılık bulunur (üst çubukta çan + liste) | Yüzeyin hiç olmaması, spec'te tanımlı olayların çalıştığını göstermeyi imkânsız kılıyordu. Prototipteki karşılık bir ürün kararı değil, **test edilebilirlik** gereğidir; gerçek üründe Narbulut kabuğunun bildirim merkezine bağlanması beklenir |
| SR-NOT-08 | Sahip organizasyondan ayrılınca alıcılar bilgilendirilir mi? | **Evet, N-CAL-02** (BR-NOT-24) | Alıcının başlatmadığı bir erişim kaybı — BR-NOT-06 gereği bildirim zorunlu. Sessiz kaybolma `11` ST-CORE-01 ihlali olurdu |
