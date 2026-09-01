# 20 — UX Flows

**Faz:** 5 · **Durum:** ✅ **FAZ 5 FINAL** · **rev.2 (2026-08-31):** F6 Calendar Sharing eklendi (D-067); F5 arama kapsamı güncellendi (D-069)
**Girdi:** `10–19` spec seti (FAZ 4 FINAL) · `DECISIONS.md` D-025…D-055

> ⚠️ **Bu doküman yeni ürün requirement'ı üretmez.** Product Spec'leri yeniden anlatmaz.
> Amacı tek: **FAZ 4'te tanımlanan modüllerin gerçek kullanıcı yolculuklarında birbirine nasıl bağlandığını** göstermek.
> Her davranışın kaynağı ilgili spec'e ID ile referans verilir.

---

## İçindekiler

| # | Flow | Kapsadığı spec'ler |
|---|---|---|
| **F1** | Yeni Etkinlik + Scheduling + Oda | `14` `15` `16` `17` `18` `19` |
| **F2** | Reservation Approval | `18` `16` `15` `19` |
| **F3** | Recurring Event | `15` `16` `17` `18` `19` |
| **F4** | Room Administration & Permissions | `13` `10` `18` `11` |
| **F5** | Search / Navigation / Recovery | `14` `16` `17` `11` |
| **F6** ⭐ | **Calendar Sharing** *(D-067)* | `12` `14` `19` |

> ⚠️ Bildirim üretmeyen akışlar: **F4** *(oda yönetimi — D-057 gereği bilinçli)* ve **F5**.
| — | **Design Handoff Questions** | → FAZ 6 |

---

# FLOW 1 — Yeni Etkinlik + Scheduling + Oda

## Goal
Kullanıcı, katılımcıların müsait olduğu bir zamanda ve uygun bir odada yeni bir toplantı oluşturmak istiyor.

## Primary Actor
Etkinlik organizatörü *(normal kullanıcı)*

## Preconditions
- Kullanıcı organizasyona ait *(D-025)*
- En az bir oda tanımlı ve kullanıcının `Görebilir` yetkisi var *(`10` BR-PRM-06)*
- Organizasyon mesai saatleri tanımlı *(`14` BR-SHELL-10; tanımlı değilse `14` BR-SHELL-11)*

## Happy Path

```
1. Takvim açılır
   → son görünüm ve tarih geri yüklenir            [14 BR-SHELL-07]
   → scroll mesai başlangıcına konumlanır          [14 BR-SHELL-08]

2. Boş slot'a tıklanır                             [14 IR-SHELL-01]
   → Quick Create açılır, odak Başlık'ta           [15 IR-EVT-01]
   → tarih/saat önceden dolu VE düzenlenebilir     [15 IR-EVT-02]

3. Başlık yazılır
   ├─ yeterliyse → [Oluştur] → AKIŞ BİTER
   └─ değilse → [Daha fazla seçenek]               [15 BR-EVT-19/20]
      → veri korunur                               [15 BR-EVT-20]

4. Detaylı form
   → Başlık birincil alan, tek birincil aksiyon    [15 BR-EVT-21/22]

5. Katılımcılar eklenir (iç + harici)
   → her biri Zorunlu/Opsiyonel                    [15 BR-EVT-12/13]
   → müsaitlik satırda belirir                     [17 BR-SCH-06]
   → özet: "3 müsait · 2 meşgul (1 zorunlu) · 1 bilinmiyor"  [17 BR-SCH-08/09]

6. (opsiyonel) [Uygun zaman öner]                  [17 BR-SCH-16..24]
   → sınırlı sayıda öneri, her biri gerekçesiyle
   → seçilirse SADECE başlangıç/bitiş değişir      [17 BR-SCH-24]

7. Oda seçilir
   → liste zaman aralığına göre gelir              [16 BR-RB-02]
   → (varsa) kapasite/özellik/bina/kat filtreleri  [16 BR-RB-10/11]
   → durumlar okunur: Müsait/Onay bekliyor/Rezerve [16 BR-RB-09]
   → seçilemez satırlar SEBEBİYLE görünür          [16 BR-RB-06]
   → Konum odadan türetilir, salt okunur           [15 BR-EVT-09]

8. [Oluştur]
   → kaydetme anında çakışma yeniden kontrol      [16 BR-RB-23]
```

## Branches

### A — Onay gerektirmeyen oda
```
[Oluştur]
  → Etkinlik oluşur + rezervasyon kesinleşir
  → Oda durumu: RESERVED
  → Başarı bildirimi YAN ETKİLERİYLE               [11 ST-SUC-04]
     "Etkinlik oluşturuldu · Oda rezerve edildi · 3 kişiye davet gönderildi"
  → Bildirim olayları: N-EVT-01                    [19]
     (harici katılımcı varsa E-POSTA ZORUNLU       [19 BR-NOT-03])
```

### B — Onay gerektiren oda
```
[Oluştur]
  → Etkinlik OLUŞUR                                [18 BR-APR-06]
  → Rezervasyon: PENDING
  → Slot bloke olur, diğerlerine "Onay bekliyor"   [18 BR-APR-11/12]
  → ⚠️ BAŞARI DİLİ KULLANILMAZ                     [18 BR-APR-07]
     "Talebiniz gönderildi, onay bekliyor — [onaylayıcı]"
  → Etkinlik takvimde görünür, oda durumu AYRI eksende  [18 BR-APR-35]
  → Bildirim olayları: N-EVT-01 + N-RES-01         [19]

  ⚠️ ÖN KONTROL — Eligible approver:
     Talebi oluşturan dışında en az bir eligible approver var mı?  [18 BR-APR-17b/17d]
     └─ YOKSA → ⛔ REZERVASYON OLUŞTURULMAZ (blocking)
        "Bu rezervasyonu onaylayabilecek başka bir kullanıcı bulunmuyor."
        Kurtarma yolları:  başka oda · onaysız oda · odasız devam et  [18 BR-APR-17e]
        ⚠️ Çözümsüz Pending rezervasyon ÜRETİLMEZ
```

## Failure / Recovery

| Durum | Davranış |
|---|---|
| **Oda form açıkken doluyor** | Kaydetmede engelleyici hata; veri korunur, form kapanmaz `[16 EC-RB-01, 11 ST-ERR-03]` |
| **Eligible approver yok** | ⛔ **Engeller** — rezervasyon oluşturulmaz `[18 BR-APR-17b]` |
| **Zorunlu katılımcı meşgul** | ⚠️ **Engellemez** — uyarı, birincil aksiyon aktif `[17 BR-SCH-11]` |
| **Kapasite yetersiz** | ⚠️ **Engellemez** — güçlü uyarı, sebep sayısal `[16 BR-RB-18]` |
| **Mesai dışı** | ⚠️ **Engellemez** — uyarı `[D-045, 15 V-EVT-08]` |
| **Geçmiş tarih** | ⚠️ **Engellemez** — uyarı `[15 BR-EVT-40]` |
| **Kaydetme başarısız** | Form kapanmaz, veri korunur, hata görünür, tekrar dene `[11 ST-ERR-01/03/04]` |
| **Davet gönderilemedi** | Etkinlik başarısı bildirilir, gönderim sorunu **ayrıca** belirtilir `[11 EC-ST-05]` |

## State Transitions

```
Oda:     Available ──(A)──► Reserved
         Available ──(B)──► Pending ──► (FLOW 2)

Etkinlik: (yok) ──► Created     ← her iki dalda da oluşur
```

## Notifications Triggered
`N-EVT-01` *(davet)* · **B dalında ek olarak** `N-RES-01` *(talep gönderildi → onaylayıcı)*
Organizatöre bildirim **gitmez** — kendi eylemi `[19 BR-NOT-05]`

## Specs Referenced
`14-calendar-shell` · `15-event` · `16-room-booking` · `17-scheduling` · `18-reservation-approval` · `19-notifications`

## Design Questions → FAZ 6
- Quick Create hangi yüzeyde açılır? *(popover / inline / küçük panel)*
- "Daha fazla seçenek" geçişi nasıl olur — aynı yüzey büyür mü, yeni yüzey mi?
- Oda seçici formun içinde mi, açılan bir katman mı?
- Suggested Times formda nasıl belirir — inline liste mi, açılır panel mi?
- Dört uyarı türü *(katılımcı · kapasite · mesai · geçmiş tarih)* aynı formda nasıl ayrışır?

---

# FLOW 2 — Reservation Approval

## Goal
Onaylayıcı, sorumlu olduğu odaya gelen rezervasyon talebini karara bağlamak istiyor.

## Primary Actor
**Onaylayıcı** *(odanın onay yapılandırmasında tanımlı kullanıcı veya grup üyesi)*

## Preconditions
- Odada `Rezervasyon onayı gerekli = açık` ve **en az bir geçerli onaylayıcı** var `[18 BR-APR-02]`
- En az bir `Pending` talep mevcut

## Happy Path

```
1. Bildirim veya doğrudan giriş → Onay Kuyruğu
   → YALNIZCA sorumlu olunan odaların talepleri     [18 BR-APR-25]

2. Talep satırı okunur
   → etkinlik · oda · talep eden · tarih/saat · tekrar · durum   [18 BR-APR-26]
   → ⚠️ etkinlik DETAYLARI gösterilmez              [18 BR-APR-27]

3. Karar
   ├─ [Onayla]  → APPROVED
   └─ [Reddet]  → (opsiyonel gerekçe) → REJECTED    [18 BR-APR-20]
```

## Branches

### Approved
```
→ Rezervasyon kesinleşir; slot RESERVED kalır      [18 BR-APR-18]
→ Takvimde etkinliğin oda durumu güncellenir       [14 BR-SHELL-20]
→ Bildirim: N-RES-02 → talep eden                  [19 BR-NOT-13]
→ Karar verene bildirim GİTMEZ                     [19 BR-NOT-05]
```

### Rejected
```
→ Rezervasyon odadan ayrılır
→ ⚠️ ETKİNLİK SİLİNMEZ — odasız kalır              [18 BR-APR-19]
→ Slot SERBEST kalır; oda tekrar Müsait            [16 EC-RB-06]
→ Bildirim: N-RES-03 + varsa GEREKÇE               [19 N-RES-03]
→ Katılımcılara ayrıca bildirim gitmez             [19 EC-NOT-08]
```

### ⚠️ Talep eden = onaylayıcılardan biri *(self-approval)*
```
→ Talep kuyrukta GÖRÜNÜR
→ Onayla/Reddet aksiyonları GÖSTERİLMEZ            [18 BR-APR-17a]
→ BAŞKA bir eligible approver karar verir

⚠️ Bu branch YALNIZCA en az bir başka eligible approver varken oluşabilir.
   Aksi halde talep FLOW 1-B'de hiç oluşturulmamıştır  [18 BR-APR-17b]
   ⇒ "karara bağlanamayan Pending talep" durumu SİSTEMDE YOKTUR
```

### Talep eden geri çeker
```
Etkinlik detayı → [Talebi geri çek] → onay istenir → CANCELLED
→ Slot serbest kalır                                [18 BR-APR-16]
→ Bildirim: N-RES-04 → onaylayıcı
```

## Failure / Recovery

| Durum | Davranış |
|---|---|
| **İki onaylayıcı aynı anda karar verir** | İlk karar geçerli; ikinciye ne olduğu açıkça söylenir `[18 EC-APR-04, 11 EC-ST-03]` |
| **Karara bağlanmış talep tekrar denenir** | Aksiyonlar pasif, sebep okunur `[18 IR-APR-05, BR-APR-22]` |
| **Kuyruk boş** | Açıkça söylenir; sessiz boş liste yok `[18 BR-APR-29]` |
| **Etkinlik başlangıcı geçti, talep hâlâ Pending** | Terminal duruma geçer, slot serbest, kayıt korunur `[18 BR-APR-42/43/44]` |
| **Etkinlik silinir** | Talep `Cancelled`, kayıt silinmez, onaylayıcı bilgilendirilir `[18 BR-APR-31]` |

## State Transitions

```
                    ┌──► Approved  (terminal)
Pending ────────────┼──► Rejected  (terminal)
                    └──► Cancelled (terminal)
                          ▲
         talep eden geri çeker · etkinlik silinir ·
         başlangıç zamanı geçti                    [18 §5.7]

Approved ──(etkinlik silinir / oda kaldırılır)──► Cancelled

Oda slotu:  Pending → Approved  ⇒  Reserved
            Pending → Rejected  ⇒  Available
            Pending → Cancelled ⇒  Available
```

## Notifications Triggered
`N-RES-02` *(onaylandı)* · `N-RES-03` *(reddedildi + gerekçe)* · `N-RES-04` *(iptal)* · `N-RES-05` *(bekleyen talebin zamanı değişti)*

## Specs Referenced
`18-reservation-approval` · `16-room-booking` · `15-event` · `19-notifications`

## Design Questions → FAZ 6
- **Onay kuyruğu IA'da nerede yaşar?** *(Odalar altında mı, ayrı yüzey mi, bildirim merkezinden mi?)*
- Kuyruk boşken "hiç talep yok" ile "hiçbir odanın onaylayıcısı değilim" nasıl ayrışır?
- Self-approval durumunda satır nasıl görünür — aksiyonlar gizli mi, sebep gösterilen pasif mi?
- Red gerekçesi nasıl teşvik edilir *(zorunlu değil ama atlanması bilinçli olmalı)*?
- Seri talebi tek satırda N occurrence'ı nasıl temsil eder?

---

# FLOW 3 — Recurring Event

## Goal
Kullanıcı tekrarlayan bir toplantı serisi oluşturmak ve sonradan bir kısmını değiştirmek istiyor.

## Primary Actor
Etkinlik organizatörü

## Preconditions
FLOW 1 ile aynı; ek olarak kullanıcı detaylı formda *(Quick Create tekrar alanı içermez `[15 BR-EVT-19]`)*

## Happy Path — Oluşturma

```
1. Detaylı formda tekrar kuralı tanımlanır
   → Günlük / Haftalık / Aylık                     [15 BR-EVT-31]
   → Bitiş: tarih / sayı / süresiz                 [15 BR-EVT-32]

2. Önizleme satırı anında güncellenir              [15 BR-EVT-33, IR-EVT-08]
   "Her Pazartesi 10:00–11:00, 31 Ara'ya kadar — 18 etkinlik"

3. Katılımcı müsaitliği
   → ⚠️ öneri YALNIZCA ilk occurrence için         [17 EC-SCH-05]

4. Oda seçilir → occurrence bazlı değerlendirme    [16 BR-RB-24]
   → özet: "18 tarihten 15'inde müsait, 3'ünde dolu"  [16 BR-RB-25]
   → hangi tarihlerin dolu olduğu görülebilir      [16 IR-RB-08]

5. Kısmi çakışma varsa AÇIK SEÇİM ZORUNLU          [16 BR-RB-26]
   ( ) Çakışan 3 occurrence'ı odasız bırak
   ( ) Başka oda seç

6. [Oluştur]
```

## Branches

### Onay gerektirmeyen oda
```
→ Seri oluşur, her occurrence için rezervasyon
→ Bildirim: N-EVT-01
```

### Onay gerektiren oda
```
→ ⚠️ ÖN KONTROL: TÜM occurrence'larda çakışma + müsaitlik + yetki   [16 BR-RB-29a]
→ Kısmi problem varsa → ÖZET gösterilir, TALEP GÖNDERİLMEZ          [16 BR-RB-29b]
   "18 tekrarın 15'i uygun, 3'ünde çakışma var"
→ Problem çözülür
→ TEK series talebi oluşur                          [18 BR-APR-08]
→ Kuyrukta TEK satır, occurrence sayısıyla          [18 BR-APR-30]
→ Karar TÜM seriye uygulanır; kısmi onay yok        [18 BR-APR-23]
```

## Happy Path — Düzenleme

```
1. Seriye ait bir occurrence açılır → Düzenle → değişiklik → [Kaydet]

2. Kapsam istemi (İŞLEMDEN SONRA)                   [15 BR-EVT-35]
   her seçeneğin etkisi SAYIYLA:
   ( ) Yalnızca bu etkinlik        → 1 occurrence
   ( ) Bu ve sonrakiler            → seçilen + sonraki N
   ( ) Tüm seri                    → geçmiş M + gelecek N

3. ⚠️ "Tüm seri" geçmişi etkiliyorsa AÇIK UYARI     [15 BR-EVT-34a]

4. Oda rezervasyonu etkileniyorsa bu da belirtilir  [16 BR-RB-28]

5. Onayla
```

### Üç kapsamın semantiği `[15 BR-EVT-34]`

| Kapsam | Etkilenen | Önceki occurrence'lar |
|---|---|---|
| **Yalnızca bu etkinlik** | 1 occurrence | Değişmez |
| **Bu ve sonrakiler** | Seçilen + sonrakiler | **Değişmez** |
| **Tüm seri** | Geçmiş + gelecek tümü | **Değişebilir — açık uyarıyla** |

> **Sapmış occurrence:** "Yalnızca bu etkinlik" ile değiştirilen örnek, sonraki seri değişikliklerinde **ezilmez** `[15 BR-EVT-37]`. Takvimde ayırt edilebilir `[14 EC-SHELL-08]`.

## Failure / Recovery

| Durum | Davranış |
|---|---|
| **Seride tüm occurrence'lar dolu** | Oda seçilemez; sebep: "seçilen tarihlerin tümünde dolu" `[16 EC-RB-09]` |
| **Süresiz tekrar + oda** | Rezervasyon sonlu ufukla sınırlı; bu **açıkça bildirilir** `[16 BR-RB-27, 15 BR-EVT-38]` |
| **"Bu ve sonrakiler" sapmış occurrence içeriyor** | Sapmışlar korunur; kaç örneğin korunduğu bildirilir `[15 EC-EVT-04]` |
| **Seri talebi beklerken seri düzenlenir** | Kapsam seçimi talebi etkiler; talep yeniden değerlendirilir `[18 EC-APR-09]` |

## State Transitions

```
Seri:  (yok) ──► Created
       Occurrence ──("yalnızca bu")──► Modified/Sapmış

Oda (onaylı):  Available ──► [ön kontrol] ──► Pending (tek talep) ──► Approved/Rejected
                                │
                                └─ kısmi problem ⇒ TALEP OLUŞMAZ
```

## Notifications Triggered
`N-EVT-01` · `N-SER-01` *(seri güncellendi — kapsam bilgisiyle)* · `N-SER-02` *(seri iptal)* · `N-SER-03` *(tek occurrence ayrıldı)* · onaylı odada `N-RES-01`

> ⚠️ **Occurrence başına bildirim gitmez** — alıcı başına tek bildirim + kapsam bilgisi `[19 BR-NOT-09]`

## Specs Referenced
`15-event` · `16-room-booking` · `17-scheduling` · `18-reservation-approval` · `19-notifications`

## Design Questions → FAZ 6
- Tekrar kuralı + önizleme satırı formda nerede durur?
- **Kapsam istemi üç yerde çıkıyor** *(düzenleme · silme · oda etkisi)* — tek paylaşılan bileşen nasıl olur?
- "18 tarihten 15'inde müsait" özeti nasıl gösterilir? Dolu tarihler nasıl açılır?
- Sapmış occurrence takvimde nasıl işaretlenir?
- "Tüm seri geçmişi etkileyecek" uyarısı ne kadar güçlü olmalı?

---

# FLOW 4 — Room Administration & Permissions

## Goal
Organizasyon yöneticisi oda tanımlamak, kimin görüp rezerve edebileceğini ve onay gerekip gerekmediğini belirlemek istiyor.

## Primary Actor
**Organizasyon yöneticisi**

## Preconditions
Kullanıcının oda yönetim yetkisi var *(normal kullanıcı oda oluşturamaz `[13 §3]`)*

## Happy Path — Oda oluşturma / düzenleme

```
1. Odalar → LİSTE görünümü açılır                  [13 BR-ROOM-19]
   → satır aksiyonları: düzenle / pasife al / sil  [13 BR-ROOM-20]
   → arama mevcut                                  [13 BR-ROOM-25]

2. [Yeni oda] veya satırdan [Düzenle]
   → ⚠️ AYNI tek ekranlı bölümlü form              [13 BR-ROOM-16/28]
   → sihirbaz YOK

3. Bölüm: Genel bilgiler
   → ad · açıklama · durum (Aktif/Pasif)

4. Bölüm: Kapasite ve özellikler
   → kapasite · sınırlı yönetilen özellik seti      [13 §4.3, D-048]
   → boş bırakmanın sonucu forma yazılır            [13 IR-ROOM-04]

5. Bölüm: Lokasyon
   → ⚠️ Bina tanımlı DEĞİLSE bu bölüm HİÇ GÖRÜNMEZ  [13 BR-ROOM-06, IR-ROOM-02]
   → tanımlıysa: Bina → Kat (bina seçilmeden kat pasif)  [13 BR-ROOM-05]

6. Bölüm: Erişim
   → Görebilir      = Tüm kullanıcılar   [varsayılan]  [10 BR-PRM-03]
   → Rezerve edebilir = Tüm kullanıcılar [varsayılan]
   → daraltılabilir: grup ve/veya kullanıcı
   → ⚠️ Rezerve'ye eklenen özne Görebilir'de yoksa
      sistem OTOMATİK ekler ve BUNU BELİRTİR        [10 IR-PRM-03, BR-PRM-04]

7. Bölüm: Rezervasyon onayı
   → anahtar [varsayılan KAPALI]                    [13 SR-ROOM-04]
   → açılırsa: onaylayıcı kullanıcı/grup ZORUNLU    [18 BR-APR-02]

8. İnline özet okunur                               [13 BR-ROOM-18]
   → erişim + onay yapılandırması AÇIKÇA gösterilir
   (sihirbazın "Gözden Geçirin" adımının işlevi)

9. [Kaydet]
```

## Happy Path — Merkezî izin görünümü

```
Takvim → İzinler                                    [10 F-PRM-2]
→ Odalar × erişim özeti listesi
   her satır: oda adı · "Görebilir" özeti · "Rezerve edebilir" özeti
→ satırdan doğrudan düzenleme veya odaya geçiş

⚠️ Bu yüzey, bugün PASİF olan İzinler sekmesinin işlevidir  [IA-01, FN-09]
```

## Branches

### Erişim kısıtlama
```
"Rezerve edebilir" → "Tüm kullanıcılar" kaldırılır → grup/kullanıcı eklenir
→ "Görebilir" = Tüm kullanıcılar kalır
⇒ Sonuç: oda herkese GÖRÜNÜR, yalnızca seçilenler REZERVE EDER   [10 F-PRM-1]
⇒ FLOW 1 adım 7'de yetkisiz kullanıcı odayı görür ama seçemez    [16 §4.1]
```

### Onay açma
```
Onay anahtarı açılır → onaylayıcı eklenir → kaydet
⇒ Bu odaya yapılan rezervasyonlar PENDING başlar (FLOW 1-B)
⇒ Onaylayıcı GENEL yetki kazanmaz                   [18 BR-APR-04, D-042]
```

### Odayı pasife alma
```
Satır aksiyonu → Pasife al
→ onay: "N gelecek rezervasyonu var. Mevcut rezervasyonlar etkilenmez,
   ancak oda yeni rezervasyonlarda seçilemez."      [13 BR-ROOM-07, F-ROOM-3]
```

## Failure / Recovery

| Durum | Davranış |
|---|---|
| **Onay açık + onaylayıcı boş** | ⚠️ **Kaydedilemez.** Alan bazlı hata: *"Rezervasyon onayı açık olduğu için en az bir onaylayıcı seçmelisiniz."* `[13 BR-ROOM-12, V-ROOM-05]` |
| **Son onaylayıcı kaldırılmak istenir** | ⚠️ **Engellenir.** Ya yeni onaylayıcı ya onayı kapatma `[13 BR-ROOM-12a]` |
| **Erişim kuralı boş bırakılır** | Kaydetme engellenir; hangi kuralın boş olduğu belirtilir `[10 V-PRM-01]` |
| **Gelecek rezervasyonu olan oda silinir** | Doğrudan silinemez; **pasife alma önerilir** veya rezervasyonları iptal `[13 BR-ROOM-22]` |
| **Onaylayıcı organizasyondan çıkarılır** | Invariant ihlali; oda **uyarı ile işaretlenir**, yöneticiden müdahale istenir `[13 EC-ROOM-04, 18 EC-APR-03]` |
| **Son bina silinir** | Bina/Kat alanları ve filtreleri arayüzden kalkar; **önceden bildirilir** `[13 EC-ROOM-03]` |

## State Transitions

```
Oda:        (yok) ──► Aktif ⇄ Pasif ──► Silinmiş
Erişim:     Tüm kullanıcılar ⇄ Kısıtlı (grup/kullanıcı listesi)
Onay:       Kapalı ⇄ Açık (açıkken ≥1 onaylayıcı ZORUNLU)
```

## Notifications Triggered
**Yok.** Oda yönetimi bildirim üretmez — `19-notifications` envanterinde oda yönetim olayı bulunmuyor.

## Specs Referenced
`13-rooms` · `10-permissions` · `18-reservation-approval` · `11-system-states`

## Design Questions → FAZ 6
- **Beş bölümlü tek ekran form** nasıl yönetilebilir uzunlukta kalır? *(Sihirbazın kaldırılmasının bedeli)*
- İnline özet formun neresinde durur?
- **İki erişim kuralı** *(Görebilir / Rezerve edebilir)* yan yana nasıl karıştırılmadan okunur?
- Progressive disclosure geçişi *(bina tanımlanınca yeni bölüm belirmesi)* nasıl şaşırtmaz?
- Oda listesinde **üç durum işareti** *(pasif · kısıtlı · onay gerektiren)* nasıl karışmaz?
- Merkezî İzinler ekranı — *"kim neyi görüyor?"* tek ekranda nasıl cevaplanır? *(benchmark'ta hiçbir üründe yok `[I]`)*
- "Nasıl Kullanılır?" statik panelinin yerine ne gelir?

---

# FLOW 5 — Search / Navigation / Recovery

## Goal
Kullanıcı bir etkinliği bulmak, takvimde gezinmek veya bir hatadan kurtulmak istiyor.

## Primary Actor
Normal kullanıcı

---

## 5a — Search result

```
1. Arama → metin yazılır                            [14 BR-SHELL-36]
2. Sonuçlar: başlık · not · oda · katılımcı eşleşmeleri   [14 BR-SHELL-37]
   → her satır BAĞLAM taşır:
     etkinlik adı · tarih/saat · takvim · (varsa) oda      [14 BR-SHELL-39]
3. Sonuç seçilir
   → takvim o tarihe konumlanır, etkinlik vurgulanır
4. Etkinlik filtre nedeniyle ızgarada görünmüyorsa:
   "Mevcut takvim filtresi nedeniyle ızgarada görünmüyor"  [14 BR-SHELL-40]
```

> ⚠️ **Sınır:** Arama yalnızca kullanıcının **erişebildiği** etkinlikleri döndürür — **üç kategori**: kendi etkinlikleri · davetli olduğu etkinlikler · **kendisiyle paylaşılmış takvimlerdeki etkinlikler** `[14 BR-SHELL-38, D-069]`.
> **Free/busy hakkı, bir etkinliği arama hakkı vermez.**
> Sonuç paylaşılan bir takvimden geliyorsa satır **kaynak takvimi ve sahibini** gösterir `[14 BR-SHELL-39]`.

---

## 5b — Blocking room conflict

```
Oda seçili → kullanıcı saati değiştirir
  → oda listesi OTOMATİK yeniden değerlendirilir     [16 IR-RB-01]
  → seçili oda artık dolu
  → ⚠️ Seçim OTOMATİK KALDIRILMAZ                    [16 IR-RB-02]
  → ENGELLEYİCİ hata: "Seçtiğiniz saatte bu oda dolu"  [16 BR-RB-20]
  → [Oluştur] PASİF, sebebi okunur                   [11 ST-DIS-04]

Kurtarma:
  ├─ saati değiştir  → çakışma çözülür → [Oluştur] AKTİF
  └─ odayı değiştir  → çakışma çözülür → [Oluştur] AKTİF
```

> Çakışma mesajı **çakışan etkinliğin başlığını açıklamaz** `[16 BR-RB-22]`

---

## 5c — Non-blocking warnings

```
Bu dördü [Oluştur]'u ENGELLEMEZ — birincil aksiyon AKTİF kalır:

  ⚠ Katılımcı çakışması   → "2 zorunlu katılımcı meşgul"   [17 BR-SCH-11]
  ⚠ Kapasite yetersizliği → "8 katılımcı, oda 4 kişilik"    [16 BR-RB-18]
  ⚠ Mesai saatleri dışı   → uyarı                           [D-045]
  ⚠ Geçmiş tarih          → uyarı                           [15 BR-EVT-40]

Kullanıcı bilinçli olarak devam edebilir.
```

> ⚠️ **Kritik ayrım:** oda çakışması **engeller**, diğer dördü **engellemez** `[11 ST-VAL-05]`

---

## 5d — Failure / Recovery

```
[Oluştur] → API/işlem başarısız
  → ⚠️ Form KAPANMAZ                                 [11 ST-ERR-03]
  → Girilen veri KORUNUR
  → Hata kaynağına en yakın yerde gösterilir         [11 ST-ERR-01]
  → Teknik kod veya ham sunucu mesajı GÖSTERİLMEZ    [11 ST-ERR-02]
  → [Tekrar dene] sunulur                            [11 ST-ERR-04]

⚠️ Hiçbir başarısızlık sessizce yutulmaz              [11 ST-CORE-01]
   (FB-01'in çözümü — bugün HTTP 500 sessizce yutuluyor)
```

### Kısmi başarı senaryoları

| Durum | Davranış |
|---|---|
| **Etkinlik oluştu, oda onaya düştü** | Tek bildirimde her iki sonuç `[11 EC-ST-04]` |
| **Etkinlik oluştu, davet gönderilemedi** | Başarı bildirilir, gönderim sorunu **ayrıca** belirtilir `[11 EC-ST-05]` |
| **İki kullanıcı aynı kaydı değiştirdi** | Kaybeden tarafa ne olduğu açıkça söylenir `[11 EC-ST-03]` |

---

## 5e — Navigation

```
Takvim açılışı → son görünüm + tarih geri yüklenir   [14 BR-SHELL-07]
                → scroll mesai başlangıcında          [14 BR-SHELL-08]

[Bugün]        → bugüne döner + scroll yeniden konumlanır  [14 BR-SHELL-02]
[← →]          → aktif moda göre 1 birim               [14 BR-SHELL-03]
Görünüm değişimi → SEÇİLİ TARİH KORUNUR                [14 IR-SHELL-03]
Odalara Göre → boş slot → Quick Create (odası dolu)    [16 F-RB-4]
```

## State Transitions

```
[Oluştur] butonu:  Aktif ⇄ Pasif(sebepli)
   Pasif tetikleyicisi: SADECE engelleyici hatalar (oda çakışması, zorunlu alan)
   Uyarılar butonu ETKİLEMEZ
```

## Notifications Triggered
Yok — bu flow bildirim üretmez.

## Specs Referenced
`14-calendar-shell` · `16-room-booking` · `17-scheduling` · `11-system-states`

## Design Questions → FAZ 6
- Arama nerede yaşar — üst bar mı, takvim yüzeyi mi?
- Arama sonucu listesi nasıl sunulur *(panel / overlay / ayrı görünüm)*?
- **Engelleyici hata ile engelleyici olmayan uyarı görsel olarak nasıl ayrışır?**
- Pasif birincil aksiyonun sebebi nerede gösterilir?
- "Filtre nedeniyle görünmüyor" açıklaması sonuç satırında nasıl durur?
- **Mobilde haftalık grid yerine hangi pattern?** *(agenda / gün / liste — D-047)*

---

# FLOW 6 — Calendar Sharing ⭐

## Goal
Kullanıcı kendi takvimini bir iş arkadaşıyla paylaşmak; karşı taraf bu takvimi kendi sidebar'ında görmek istiyor.

## Primary Actor
**Takvim sahibi** *(paylaşan)* ve **paylaşım alıcısı**

## Preconditions
- İki kullanıcı da **aynı organizasyonda** `[D-025]`
- Paylaşılacak takvim sahibine ait `[12 BR-CAL-24]`

## Happy Path — Paylaşma *(sahip)*

```
1. Sol rail → takvim → Paylaş
2. Organizasyon içinden BİR kullanıcı seç          [12 BR-CAL-25]
   → seçicide GÖRÜNMEZ: gruplar · harici kullanıcılar · sahibin kendisi
                                                    [12 V-CAL-05/06]
3. ⚠️ ZORUNLU AÇIKLAMA okunur                       [12 BR-CAL-38]
   "Bu takvimdeki mevcut ve gelecekteki etkinlik detayları
    paylaştığınız kişi tarafından görülebilir."
   → varsayılan takvim paylaşılıyorsa bu ÖZELLİKLE kritik
     (Quick Create etkinlikleri oraya düşer)        [D-065, D-068]
4. [Paylaş]
   → başarı bildirimi
   → alıcıya bildirim: N-CAL-01                     [19]
```

## Happy Path — Alıcı tarafı

```
Sidebar → "Benimle paylaşılanlar" bölümü belirir    [12 BR-CAL-30]
   → satır: takvim adı + SAHİBİNİN ADI + takvimin kendi rengi
   → görünürlük açılıp kapatılabilir                [12 BR-CAL-32]

Izgarada:
   → etkinlikler normal render edilir               [14 BR-SHELL-33a]
   → ⚠️ SALT OKUNUR: düzenleme aksiyonları yok      [12 BR-CAL-27]
   → ⚠️ boş slot'a tıklamak Quick Create AÇMAZ      [14 BR-SHELL-33b]

Aramada:
   → bu takvimin etkinlikleri arama sonuçlarına DAHİL  [D-069]
   → sonuç satırı kaynak takvimi ve sahibini gösterir  [14 BR-SHELL-39]
```

## Branches

### Paylaşımı kaldırma *(sahip)*
```
Takvim → Paylaşım yönetimi → kiminle paylaşıldığı listelenir
→ [Kaldır] → onay
→ ⚠️ kaldırma ANINDA etkili                          [12 BR-CAL-33]
→ takvim alıcının sidebar'ından anında kalkar
→ alıcıya bildirim: N-CAL-02
```

### Alıcı paylaşımı reddeder
```
"Benimle paylaşılanlar" → takvim → Kaldır
→ paylaşım kaydı sonlanır                            [12 BR-CAL-34]
→ ⚠️ sahibe bildirim GİTMEZ                          [19 BR-NOT-22]
```

### Hassas etkinlik
```
⚠️ Event-level privacy YOK                           [D-041, D-068]
→ Sahip hassas etkinliği PAYLAŞILMAYAN başka bir takvime taşır
                                                      [12 BR-CAL-39, EC-CAL-11]
→ alıcı o etkinliği artık göremez
```

### Sahip organizasyondan ayrılır
```
→ takvimler ARŞİVLENİR, etkinlikler korunur          [D-066]
→ TÜM aktif paylaşımlar kaldırılır                   [12 BR-CAL-40]
→ alıcılara N-CAL-02 gider                           [19 BR-NOT-24]
→ ⚠️ yeni admin calendar-management yüzeyi AÇILMAZ
```

## Failure / Recovery

| Durum | Davranış |
|---|---|
| **Aynı kişiyle ikinci kez paylaşma** | Sessiz — kişi seçicide "paylaşıldı" olarak işaretli, tekrar eklenmez `[12 V-CAL-07]` |
| **Grup veya harici kullanıcı seçme** | ⛔ Seçicide hiç listelenmez `[12 V-CAL-05]` |
| **Paylaşılan takvim silinir** | Onay **kaç kişiyle paylaşıldığını** belirtir; tüm paylaşımlar kalkar, alıcılar N-CAL-02 alır `[12 EC-CAL-09]` |
| **Alıcı organizasyondan ayrılır** | Paylaşım kaydı düşer; sahibe bildirim gitmez `[12 EC-CAL-08]` |
| **Paylaşım kaldırıldığında alıcı takvimi açık tutuyor** | Görünüm **anında** güncellenir + bildirim; sessiz kaybolma olmaz `[12 EC-CAL-12]` |

## State Transitions

```
PAYLAŞIM:
  (yok) ──[sahip paylaşır]──► Aktif ──┬──[sahip kaldırır]────► (yok) + N-CAL-02
                                      ├──[alıcı kaldırır]────► (yok)
                                      ├──[takvim silinir]────► (yok) + N-CAL-02
                                      └──[sahip ayrılır]─────► (yok) + N-CAL-02

TAKVİM:
  Aktif ──[sahip organizasyondan ayrılır]──► Arşivlenmiş
  ⚠️ Etkinlikler her durumda KORUNUR
```

## Notifications Triggered
`N-CAL-01` *(takvim paylaşıldı → alıcı)* · `N-CAL-02` *(paylaşım kaldırıldı → eski alıcı)*
⚠️ Paylaşım bildirimleri **etkinlik detayı taşımaz** `[19 BR-NOT-25]`

## Specs Referenced
`12-calendars` *(§5.6 — ana kaynak)* · `14-calendar-shell` *(sidebar, render, arama)* · `19-notifications` *(N-CAL-01/02)*

## Design Questions → FAZ 6
- **Paylaşım yüzeyi nerede yaşar?** Takvim satırında mı, ayrı bir yönetim panelinde mi?
- **Zorunlu açıklama** (BR-CAL-38) nasıl gösterilir — kalıcı metin mi, onay adımı mı? Varsayılan takvimde daha güçlü olmalı mı?
- **"Benimle paylaşılanlar"** sol rail'de sahip olunan takvimlerden nasıl ayrışır?
- **Salt okunurluk** nasıl iletilir — aksiyonlar gizlenir mi, sebebiyle pasif mi?
- Paylaşılan takvim satırında **sahip adı** nasıl gösterilir?
- **Arama sonucunda** kaynak takvim/sahip bilgisi nasıl durur?

---

# Cross-Flow State Map

```
┌─────────────────────────────────────────────────────────────────┐
│ ODA SLOT DURUMU                                                 │
│                                                                 │
│   Available ──[onaysız oda seçildi]──────────────► Reserved     │
│       ▲                                                │        │
│       │     ┌──[onaylı oda seçildi]──► Pending ────────┤        │
│       │     │                             │            │        │
│       │     │                    Approved ┘            │        │
│       │     │                                          │        │
│       └─────┴── Rejected · Cancelled · zaman geçti ◄───┘        │
│                 (etkinlik silindi / oda kaldırıldı)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ETKİNLİK                                                        │
│   (yok) ──► Created ──► Updated ──► Deleted                     │
│                 │                                               │
│                 └──► Series ──► Occurrence(Modified/Sapmış)     │
│                                                                 │
│   ⚠️ Etkinlik, rezervasyon durumundan BAĞIMSIZ yaşar            │
│      Red edilen rezervasyon etkinliği silmez  [18 BR-APR-19]    │
└─────────────────────────────────────────────────────────────────┘
```

### Durum sahipliği — hangi spec neyi tanımlıyor

| Durum ekseni | Sahibi | Tüketenler |
|---|---|---|
| Oda slot durumu *(Available/Pending/Reserved)* | `18` + `16` | `14` `16` `13` |
| Rezervasyon talebi durumu | `18` | `15` `16` `19` |
| Etkinlik yaşam döngüsü | `15` | `14` `16` `18` `19` |
| Occurrence sapması | `15` | `14` `16` |
| Buton aktif/pasif | `11` | tümü |

---

# Design Handoff Questions

> ⚠️ **Bunlar ürün requirement'ı değildir.** FAZ 6 Claude Design brief'inin girdileridir.
> Hiçbiri FAZ 4 spec'lerinde bağlayıcı olarak kararlaştırılmadı.

## A · Yüzey ve yerleşim
1. **Quick Create hangi yüzeyde açılır?** *(popover · inline · küçük panel)*
2. **Detailed Create hangi yüzeyde?** *(drawer · modal · tam sayfa)* — `15` §13'te açıkça bağlayıcı değil; tek kısıt: Quick→detay geçişinde bağlam kaybı olmamalı `[15 BR-EVT-20]`
3. **Room picker hangi yüzeyde?** Form içinde inline mi, açılan katman mı?
4. **Suggested Times formda nasıl görünür?** İnline liste mi, açılır panel mi? *(ayrı ekran YOK — D-050)*
5. **Approval Queue IA'da nerede yaşar?** Odalar altında mı, ayrı yüzey mi?
6. **Arama nerede yaşar?** Üst bar mı, takvim yüzeyi mi?
7. **Merkezî İzinler ekranı nasıl kurgulanır?** *(benchmark'ta emsali yok `[I]`)*

## B · Görsel ayrım ve durum
8. **Renk paleti — en sıkı kısıt.** Takvim renkleri + üç rezervasyon durumu + chip'in üç katmanı **ayrı görsel kanallar** gerektiriyor `[12 BR-CAL-05/15, 11 ST-PEND-02, 14 BR-SHELL-19/20/21]`
9. **Pending event chip nasıl ayrılır?** Takvim renginden bağımsız eksende
10. **Engelleyici hata ↔ engelleyici olmayan uyarı** görsel dili
11. **İki farklı "seçilemez" sebebi** *(dolu / yetkisiz)* nasıl ayrışır? Kullanıcı *"bekleyeyim mi, yetki mi isteyeyim?"* diyebilmeli
12. **"Bilinmiyor" ≠ "Müsait"** — renk dışı işaret gerekiyor `[17 RS-SCH-03]`
13. Oda listesinde **üç durum işareti** *(pasif · kısıtlı · onaylı)* nasıl karışmaz?
14. **Sapmış occurrence** takvimde nasıl işaretlenir?

## C · Bileşen ve etkileşim
15. **Seri kapsam istemi** üç yerde çıkıyor → tek paylaşılan bileşen `[15 BR-EVT-36]`
16. **Oda satırı dört bilgi taşıyor** *(kimlik · nitelik · müsaitlik · sebep)* — mobilde de korunmalı
17. **Beş bölümlü oda formu** nasıl yönetilebilir uzunlukta kalır?
18. **Tekrar önizleme satırı** formda nerede durur?
19. **Seri oda özeti** *("18'den 15'i müsait")* nasıl gösterilir, dolu tarihler nasıl açılır?
20. **Progressive disclosure geçişi** *(bina tanımlanınca bölüm belirmesi)* nasıl şaşırtmaz?

## D · Responsive
21. **Mobilde Week View yerine hangi pattern?** *(agenda · gün · liste — `14` RS-SHELL-01)*
22. Odalara Göre görünümü mobilde — yatay kaydırma + sabit oda adları? `[14 RS-SHELL-04]`
23. Seçilemezlik sebebi mobilde hover olmadan nasıl okunur? `[11 ST-DIS-03]`

## E · Boş ve kenar durumlar
24. Kuyruk boşken *"hiç talep yok"* ile *"hiçbir odanın onaylayıcısı değilim"* nasıl ayrışır?
25. Self-approval durumunda kuyruk satırı nasıl görünür?
26. Red gerekçesi nasıl teşvik edilir *(zorunlu değil ama atlanması bilinçli olmalı)*?
27. "Nasıl Kullanılır?" statik panelinin yerine ne gelir? `[13 IR-ROOM-07]`

---

# Faz kapısı

**Bu dokümanda yer almayan şeyler:**
❌ Yeni ürün kararı · ❌ Product Spec içeriğinin tekrarı · ❌ Görsel tasarım · ❌ Component yapısı · ❌ Claude Design brief · ❌ Kod

**Durum:** ✅ FAZ 5 FINAL. Sonraki: FAZ 6A — `21-calendar-design-brief.md`.
