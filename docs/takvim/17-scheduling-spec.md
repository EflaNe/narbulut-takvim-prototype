# 17 — Scheduling Spec

**Cluster:** PC-07 · **Katman:** Core Experience · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-027, D-040, D-045, D-050 · **Scope referansı:** `04-scope-closure.md` §PC-07
**Source of truth:** izinler/free-busy → `10` · durumlar → `11` · mesai saatleri → `14` · katılımcı modeli → `15` · oda müsaitliği → `16`

---

## 1. Purpose

**Etkinlik oluşturma deneyiminin içinde doğru zamanı bulmayı kolaylaştırmak.** Katılımcıların meşguliyetini gösterir, çakışmaları görünür kılar ve uygun zaman önerir.

D-050'nin kapsam sınırı: **ayrı, tam ölçekli bir Scheduling Assistant ekranı/subsystem'i kapsam dışıdır.** Öncelik formun içinde çözmektir.

Bugün bu alanda hiçbir şey yok: katılımcı ekleniyor ama müsaitliği görünmüyor, çakışma kontrolü yapılmıyor (`FN-08`).

---

## 2. Scope

### In Scope
- **Organizasyon içi free/busy** okuması (D-027)
- **Etkinlik formunda katılımcı müsaitliği** gösterimi
- **Zorunlu / opsiyonel** ayrımının müsaitlik okumasında kullanılması (D-040)
- **Katılımcı çakışmalarının görünür gösterimi**
- **Suggested Times** — uygun zaman önerileri
- Mesai saatlerinin öneri girdisi olması (D-045)

### Out of Scope
- **Ayrı Scheduling Assistant ekranı / subsystem'i** (D-050)
- Kademeli takvim paylaşımı — free/busy ötesi görünürlük seviyeleri (D-027)
- **AI / öğrenen öneri sistemi** — öneri kuralları deterministiktir (D-050: "yeni AI/recommendation sistemi icat etme")
- Katılımcının önerdiği alternatif saat *("propose new time")* — kapsam dışı
- **RSVP akışının kendisi** → `19-notifications-spec.md` ile birlikte ele alınır
- Oda müsaitliği → `16-room-booking-spec.md`
- Harici misafirlerin müsaitliği — organizasyonda olmadıkları için erişilemez (`10` BR-PRM-18)

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Organizatör** | Katılımcı ekler, müsaitliği okur, önerilen saatlerden seçer |
| **Katılımcı (iç kullanıcı)** | Free/busy verisinin kaynağıdır. Bu modülde aktif bir eylemi yoktur. |
| **Harici misafir** | **Müsaitliği bilinmez.** Organizasyonun üyesi değildir (`10` BR-PRM-18). |

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Free/busy** | Bir iç kullanıcının belirli aralıkta meşgul olup olmadığı. **Hiçbir detay içermez** (D-027, `10` BR-PRM-11). |
| **Müsaitlik durumu** | Bir katılımcı + zaman aralığı için üç değer: **Müsait · Meşgul · Bilinmiyor**. |
| **Bilinmiyor** | Müsaitlik verisi alınamayan durum: harici misafir, veri yüklenememesi. **"Müsait" ile aynı şey değildir** (`11` ST-CORE-06). |
| **Çakışma** | En az bir katılımcının seçili aralıkta meşgul olması. |
| **Zorunlu çakışma** | Çakışan katılımcı **zorunlu** ise. |
| **Opsiyonel çakışma** | Çakışan katılımcı **opsiyonel** ise. |
| **Önerilen saat (Suggested Time)** | Deterministik kurallarla üretilmiş, çakışmasız aday zaman aralığı. |

---

## 5. Business Rules

### 5.1 Free/busy okuması

| ID | Kural |
|---|---|
| **BR-SCH-01** | **Müsaitlik verisi içinde** yalnızca müsait/meşgul bilgisi taşınır. Etkinlik başlığı, katılımcı, oda, not veya takvim adı **müsaitlik gösteriminde hiçbir koşulda** yer almaz (D-027, `10` BR-PRM-11). ⚠️ Bu kural **müsaitlik yüzeyi** hakkındadır; kullanıcıya paylaşılmış bir takvimin detayları **takvim görünümünde** görünür (D-067) ama **müsaitlik okumasına karışmaz**. |
| **BR-SCH-02** | Free/busy, aynı organizasyondaki tüm iç kullanıcılar için **varsayılan olarak okunabilir**; kullanıcı başına kapatılamaz (`10` BR-PRM-12). ⚠️ **Calendar Sharing bu modeli değiştirmez** — müsaitlik hesabı paylaşım durumundan **bağımsızdır** (`12` BR-CAL-29, D-067). |
| **BR-SCH-03** | **Her etkinlik meşguliyet üretir.** Etkinlik seviyesinde gizlilik olmadığı için (D-041) hiçbir etkinlik free/busy'den gizlenemez (`10` BR-PRM-13). |
| **BR-SCH-04** | **Harici misafirlerin müsaitliği "Bilinmiyor"dur** ve asla "Müsait" olarak gösterilmez. |
| **BR-SCH-05** | Müsaitlik verisi yüklenemezse durum **"Bilinmiyor"** olur; boş veri **"Müsait" sayılmaz** (`11` ST-CORE-06, `10` EC-PRM-08). |

### 5.2 Formda müsaitlik gösterimi

| ID | Kural |
|---|---|
| **BR-SCH-06** | Katılımcı eklendiğinde müsaitliği **etkinliğin o anki zaman aralığı için** hesaplanır ve **katılımcı satırında** gösterilir. |
| **BR-SCH-07** | Zaman aralığı değiştiğinde müsaitlik **otomatik yeniden hesaplanır**. |
| **BR-SCH-08** | Katılımcı listesinin üstünde bir **özet** bulunur: kaç kişi müsait, kaç kişi meşgul, kaç kişi bilinmiyor. |
| **BR-SCH-09** | Özet, **zorunlu ve opsiyonel çakışmaları ayrı ayrı** raporlar (D-040). Örnek: *"2 zorunlu katılımcı meşgul, 1 opsiyonel katılımcı meşgul."* |
| **BR-SCH-10** | Müsaitlik gösterimi **etkinlik formunun içindedir**; ayrı bir ekrana geçiş gerektirmez (D-050). |

### 5.3 Çakışma davranışı

| ID | Kural |
|---|---|
| **BR-SCH-11** | **Katılımcı çakışması engelleyici DEĞİLDİR.** Uyarı gösterilir, kaydetme yapılabilir. `11` ST-VAL-06 gereği sınıflandırma burada yapılır. *(SR-SCH-01)* |
| **BR-SCH-12** | **Zorunlu çakışma opsiyonel çakışmadan daha belirgin** sunulur; ikisi aynı görsel ağırlıkta gösterilemez. |
| **BR-SCH-13** | Çakışma uyarısı **kimin meşgul olduğunu** söyler, **neyle meşgul olduğunu söylemez** (BR-SCH-01). |
| **BR-SCH-14** | **Mesai saatleri dışı da bir uyarı üretir** ancak engellemez (D-045, `15` V-EVT-08). Katılımcı çakışmasından ayrı bir uyarıdır. |
| **BR-SCH-15** | **Oda çakışması engelleyicidir** ve bu modülün konusu değildir (`16` BR-RB-20). İki farklı çakışma türü kullanıcıya **ayrı ayrı** gösterilir. |

### 5.4 Suggested Times

> D-050: *"hangi sinyallerle çalıştığını açık, basit ve test edilebilir şekilde tanımla; yeni AI/recommendation sistemi icat etme."*

| ID | Kural |
|---|---|
| **BR-SCH-16** | Önerilen saatler **deterministik kurallarla** üretilir. Öğrenme, geçmiş davranış analizi veya olasılıksal sıralama **yoktur**. |
| **BR-SCH-17** | **Kullanılan sinyaller — bunlardan başkası yoktur:** <br>**S1.** Etkinliğin **süresi** *(mevcut başlangıç–bitişten alınır)* <br>**S2.** **Zorunlu** katılımcıların free/busy durumu <br>**S3.** **Opsiyonel** katılımcıların free/busy durumu <br>**S4.** **Organizasyon mesai saatleri** (D-045) <br>**S5.** Seçilmişse **odanın** müsaitliği <br>**S6.** Arama **penceresi** *(yapılandırılabilir; varsayılan öneri §5.5)* <br>⚠️ **AI, öğrenme, kullanıcı profili veya geçmiş davranış analizi kullanılmaz.** |
| **BR-SCH-18** | **Aday üretimi:** arama penceresi içinde, mesai saatleri içinde kalan ve etkinlik süresi kadar süren aralıklar aday olur. |
| **BR-SCH-19** | **Eleme — en önemli şart:** hiçbir **zorunlu** katılımcının meşgul olmadığı adaylar kalır. Oda seçiliyse odanın da müsait olması gerekir. ⚠️ **Opsiyonel katılımcı çakışması bir adayı elemez**; yalnızca sıralamada aşağı indirir (BR-SCH-20). |
| **BR-SCH-20** | **Sıralama — bu sırayla, deterministik:** <br>**1.** Opsiyonel çakışması **az** olan önce <br>**2.** Etkinliğin **mevcut başlangıç saatine yakın** olan önce <br>**3.** **Erken** olan önce <br>Eşitlik durumunda kronolojik sıra. |
| **BR-SCH-21** | Öneri sayısı **sınırlıdır**; kullanıcıya taranabilir sayıda anlamlı öneri gösterilir. Kesin sayı bir **default recommendation**'dır, değişmez business invariant değildir — §5.5. |
| **BR-SCH-22** | Her öneri **neden önerildiğini** taşır: *"Tüm zorunlu katılımcılar müsait"* veya *"Tüm zorunlu katılımcılar müsait, 1 opsiyonel katılımcı meşgul"*. |
| **BR-SCH-23** | Uygun aday bulunamazsa bu **açıkça söylenir** ve **hangi kısıtın engellediği** belirtilir (ör. *"Zorunlu katılımcılar önümüzdeki 7 gün içinde mesai saatlerinde ortak boş zamana sahip değil"*). Sessiz boş liste yasaktır (`11` ST-EMPTY-01). |
| **BR-SCH-24** | Bir öneri seçildiğinde etkinliğin **başlangıç ve bitiş saatleri** güncellenir; başka hiçbir alan değişmez. |
| **BR-SCH-25** | Öneriler, müsaitliği **"Bilinmiyor"** olan katılımcıları hesaba **katmaz** — ne engelleyici ne kolaylaştırıcı sayılırlar. Bu durum önerinin gerekçesinde belirtilir. |
| **BR-SCH-26** | Katılımcı yoksa öneri **üretilmez**; öneri özelliği katılımcı gerektirir. |

### 5.5 Yapılandırılabilir varsayılanlar

> ⚠️ **Bunlar `default recommendation`'dır, değişmez business invariant DEĞİLDİR.** UI veya ileride bir sistem ayarı bu değerleri değiştirebilecek şekilde düşünülmelidir.

| Parametre | Varsayılan öneri | Not |
|---|---|---|
| **Arama ufku (search horizon)** | **7 gün** | Etkinliğin bulunduğu günden itibaren. Kullanıcı genişletebilir (IR-SCH-06). |
| **Gösterilen maksimum öneri** | **5** | Karar yorgunluğunu önleyecek, taranabilir bir sayı. |

**Test edilecek davranış:** *"Sistem sınırlı sayıda anlamlı Suggested Time üretir."* — kabul kriteri **tam olarak 5** sayısına bağlanmaz (AC-SCH-17).

---

## 6. User Flows

### F-SCH-1 · Katılımcı ekleyip müsaitliği görme
```
15-event-spec formu → Katılımcılar
→ iç kullanıcı eklenir → satırında müsaitlik durumu belirir (BR-SCH-06)
→ üstte özet: "3 müsait · 2 meşgul (1 zorunlu, 1 opsiyonel) · 1 bilinmiyor" (BR-SCH-08/09)
→ kullanıcı saati değiştirir → müsaitlik otomatik yeniden hesaplanır (BR-SCH-07)
```

### F-SCH-2 · Çakışmayla devam etme
```
Zorunlu katılımcı meşgul
→ engelleyici olmayan uyarı: "2 zorunlu katılımcı bu saatte meşgul" (BR-SCH-11/12/13)
→ birincil aksiyon AKTİF kalır (11 ST-VAL-05)
→ organizatör ya devam eder ya öneri kullanır
```

### F-SCH-3 · Önerilen saat kullanma
```
Katılımcılar eklendi → [Uygun zaman öner]
→ sistem: süre + zorunlu/opsiyonel free-busy + mesai + (varsa) oda + arama ufku (BR-SCH-17, §5.5)
→ sınırlı sayıda öneri, her biri gerekçesiyle (BR-SCH-21/22)
→ bir öneri seçilir → yalnızca başlangıç/bitiş güncellenir (BR-SCH-24)
→ oda seçiliyse oda müsaitliği de yeniden değerlendirilir (16 BR-RB-02)
```

### F-SCH-4 · Uygun zaman bulunamaması
```
[Uygun zaman öner] → aday kalmadı
→ açık mesaj: hangi kısıt engelledi (BR-SCH-23)
→ öneri: arama penceresini genişlet veya opsiyonel katılımcıyı çıkar
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-SCH-01** | Müsaitlik göstergesi **katılımcı satırının parçasıdır**; ayrı bir sekmeye veya panele gizlenmez (D-050). |
| **IR-SCH-02** | Müsaitlik hesaplanırken katılımcı satırı **yükleniyor** durumunda gösterilir; boş veya "müsait" olarak gösterilmez (BR-SCH-05). |
| **IR-SCH-03** | Zorunlu/opsiyonel değiştirildiğinde özet ve öneriler **anında** güncellenir. |
| **IR-SCH-04** | Öneriler **isteğe bağlı tetiklenir**; form açılır açılmaz otomatik hesaplanmaz. |
| **IR-SCH-05** | Öneri listesi kapatılabilir ve etkinlik önerisiz de kaydedilebilir. |
| **IR-SCH-06** | Arama penceresi kullanıcı tarafından **genişletilebilir** (BR-SCH-23'ün önerdiği kurtarma yolu). |
| **IR-SCH-07** | Katılımcı çakışması ile oda çakışması **ayrı ayrı** gösterilir; tek bir mesajda birleştirilmez (BR-SCH-15). |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`.

| State | Davranış |
|---|---|
| **Loading (müsaitlik)** | Katılımcı satırı yükleniyor gösterir; "Müsait" varsayılmaz (IR-SCH-02). |
| **Bilinmiyor** | Harici misafir veya veri alınamadı. **"Müsait"ten görsel olarak ayrıdır** (BR-SCH-04/05). |
| **Warning (katılımcı çakışması)** | Engelleyici olmayan; birincil aksiyon aktif kalır (BR-SCH-11, ST-VAL-05). |
| **Warning (mesai dışı)** | Ayrı bir uyarı; katılımcı çakışmasıyla birleştirilmez (BR-SCH-14). |
| **Empty (öneri yok)** | Hangi kısıtın engellediği söylenir + kurtarma yolu (BR-SCH-23). |
| **Disabled (öneri butonu)** | Katılımcı yoksa pasif; sebep okunur: "Önce katılımcı ekleyin" (BR-SCH-26, ST-DIS-02). |
| **Error (free/busy alınamadı)** | Tüm katılımcılar "Bilinmiyor" olur; hata görünür kılınır, sessizce müsait gösterilmez (ST-CORE-01). |

---

## 9. Validation

`11` ST-VAL-06 gereği sınıflandırma:

| ID | Kural | Sınıf |
|---|---|---|
| **V-SCH-01** | Zorunlu katılımcı çakışması | ⚠️ **Engelleyici olmayan uyarı** (BR-SCH-11) |
| **V-SCH-02** | Opsiyonel katılımcı çakışması | ⚠️ **Engelleyici olmayan uyarı**, daha düşük ağırlıkta (BR-SCH-12) |
| **V-SCH-03** | Mesai saatleri dışı | ⚠️ **Engelleyici olmayan uyarı** (D-045) |
| **V-SCH-04** | Müsaitlik bilinmiyor | **Uyarı değil, bilgi** — eksiklik olarak sunulur, hata olarak değil |
| **V-SCH-05** | Oda çakışması | **Engelleyici** — `16` V-RB-01, bu modülün konusu değil |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-SCH-01** | Etkinlikte yalnızca harici misafir var | Tüm müsaitlikler "Bilinmiyor"; öneri üretilmez ve sebebi açıklanır (BR-SCH-04, BR-SCH-26). |
| **EC-SCH-02** | Çok sayıda katılımcı eklendi | Müsaitlik özeti (BR-SCH-08) her zaman gösterilir; satır bazlı gösterim gerekirse katlanabilir. Ürün seviyesinde katılımcı sayısı sınırı tanımlanmaz. |
| **EC-SCH-03** | Katılımcı, mesai saatleri dışında meşgul | Meşguliyet **yine de** raporlanır; mesai dışı olması meşguliyeti yok saymaz. |
| **EC-SCH-04** | Tüm gün etkinliği için öneri istenir | Öneri **gün bazında** çalışır; saat aralığı değil tarih önerilir. |
| **EC-SCH-05** | Tekrarlayan etkinlik için öneri istenir | Öneri **yalnızca ilk örnek** için üretilir; seri geneli için öneri kapsam dışıdır. *(SR-SCH-05)* |
| **EC-SCH-06** | Öneri seçildikten sonra oda dolu hale gelir | `16` BR-RB-02 yeniden değerlendirir; kullanıcı engelleyici oda hatasını görür. |
| **EC-SCH-07** | Katılımcının free/busy'si okunurken kullanıcı organizasyondan çıkarılır | Durum "Bilinmiyor" olur; katılımcı listeden sessizce silinmez (`15` EC-EVT-06). |
| **EC-SCH-08** | Organizatör kendisini katılımcı olarak dahil etmemiş | Organizatörün kendi müsaitliği **yine de özet dışında bırakılır**; yalnızca katılımcılar hesaba katılır. *(SR-SCH-06)* |
| **EC-SCH-09** | Mesai saatleri tanımlı değil | S4 sinyali devre dışı kalır; adaylar 24 saat içinden üretilir. Bu durum öneri gerekçesinde belirtilir (`14` BR-SHELL-11). |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | **Ön koşul.** Free/busy görünürlüğü olmadan bu modül çalışmaz (BR-PRM-11/12/13) |
| `11-system-states-spec.md` | Bilinmiyor ≠ müsait (ST-CORE-06); uyarı/hata ayrımı; loading |
| `14-calendar-shell-spec.md` | Organizasyon mesai saatleri (S4 sinyali) |
| `15-event-spec.md` | Katılımcı modeli, zorunlu/opsiyonel, zaman alanları |
| `16-room-booking-spec.md` | Oda müsaitliği (S5 sinyali); oda çakışmasının engelleyici olması |
| `19-notifications-spec.md` | RSVP akışı — bu modülün kapsamı dışında |
| `12-calendars-spec.md` | Calendar Sharing müsaitlik hesabını **etkilemez** (BR-SCH-02, `12` BR-CAL-29) |

---

## 12. Responsive Expectations

Desktop-first (D-047). Etkinlik oluşturma mobil zorunlu akışlardan; müsaitlik gösterimi bu akışın parçası.

| ID | Kural |
|---|---|
| **RS-SCH-01** | Müsaitlik **özeti** (BR-SCH-08) mobilde mutlaka görünür; satır bazlı gösterim katlanabilir. |
| **RS-SCH-02** | Önerilen saatler mobilde liste olarak sunulur; ızgara benzeri bir gösterim **gerekmez**. |
| **RS-SCH-03** | "Bilinmiyor" ile "Müsait" ayrımı mobilde de renk dışı bir işaretle desteklenmelidir. |

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Üç müsaitlik durumu × iki gereklilik seviyesi = altı görsel kombinasyon** (Müsait/Meşgul/Bilinmiyor × Zorunlu/Opsiyonel). Bunların hepsi katılımcı satırında okunabilmeli ama satır boğulmamalı.
- **"Bilinmiyor" ile "Müsait" karıştırılamaz** (BR-SCH-05). Benchmark'ta free/busy ızgaraları bu ayrımı yapıyor; bizde de renk dışı bir işaret gerekiyor (RS-SCH-03).
- **Üç ayrı uyarı türü aynı formda yaşayacak:** katılımcı çakışması *(engellemez)* · mesai dışı *(engellemez)* · oda çakışması *(engeller)*. Görsel olarak ayrışmaları şart (IR-SCH-07, `11` ST-VAL-05).
- **Öneri listesi formun içinde açılıyor** (D-050) — ayrı ekran yok. Bu, formun dikey uzunluğu için bir kısıt: liste açıldığında bağlam kaybolmamalı.
- Her öneri **gerekçesini taşıyor** (BR-SCH-22); bu, satır başına iki satırlık içerik demek.
- Benchmark'ta Outlook ızgara, Google öneri listesi kullanıyor `[O]`. Biz **liste** tarafındayız — ızgara tasarlamaya gerek yok, ama "kim meşgul" sorusu satır bazında cevaplanmalı.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-SCH-01 | Katılımcı müsaitliği etkinlik formunun içinde gösterilir; ayrı bir ekrana geçiş gerekmez. |
| AC-SCH-02 | Müsaitlik gösterimi hiçbir etkinlik detayını (başlık, oda, katılımcı) açığa çıkarmaz. |
| AC-SCH-03 | Zaman aralığı değiştiğinde müsaitlik otomatik yeniden hesaplanır. |
| AC-SCH-04 | Özet, zorunlu ve opsiyonel çakışmaları ayrı ayrı raporlar. |
| AC-SCH-05 | Zorunlu çakışma, opsiyonel çakışmadan daha belirgin sunulur. |
| AC-SCH-06 | Katılımcı çakışması kaydetmeyi engellemez. |
| AC-SCH-07 | Harici misafirin müsaitliği "Bilinmiyor" olarak gösterilir, hiçbir koşulda "Müsait" denmez. |
| AC-SCH-08 | Veri alınamadığında durum "Bilinmiyor" olur ve "Müsait" ile görsel olarak ayrılır. |
| AC-SCH-09 | Önerilen saatler yalnızca S1–S6 sinyalleriyle üretilir; AI, öğrenme, profil veya geçmiş davranış kullanılmaz. |
| AC-SCH-10 | Öneri sıralaması deterministiktir: aynı girdi her zaman aynı sırayı verir. |
| AC-SCH-11 | Hiçbir zorunlu katılımcının meşgul olmadığı adaylar önerilir; oda seçiliyse oda da müsait olmalıdır. |
| AC-SCH-17 | Sistem sınırlı sayıda anlamlı Suggested Time üretir. *(Kriter sabit bir sayıya bağlanmaz.)* |
| AC-SCH-18 | Opsiyonel katılımcı çakışması bir adayı elemez; yalnızca sıralamada aşağı indirir. |
| AC-SCH-12 | Her öneri gerekçesini taşır. |
| AC-SCH-13 | Uygun aday yoksa hangi kısıtın engellediği açıkça söylenir ve kurtarma yolu sunulur. |
| AC-SCH-14 | Bir öneri seçildiğinde yalnızca başlangıç ve bitiş saatleri değişir. |
| AC-SCH-15 | Katılımcı yokken öneri aksiyonu pasiftir ve sebebi okunur. |
| AC-SCH-16 | Ayrı bir Scheduling Assistant ekranı bulunmaz. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-SCH-01 | Katılımcı çakışması engelleyici mi? | **Hayır, uyarı** (BR-SCH-11) | Oda fiziksel bir kaynak — iki toplantı aynı odada olamaz. İnsan öyle değil: organizatör meşgul birini bilerek davet edebilir. Oda çakışmasıyla aynı sınıfa koymak yanlış olur |
| SR-SCH-02 | Zorunlu ve opsiyonel çakışma aynı mı? | **Hayır, ayrı ağırlıkta** (BR-SCH-12) | D-040 zorunlu/opsiyonel ayrımını tam da bunun için ekledi; ayrımı gösterimde kullanmazsak alan boşa eklenmiş olur |
| SR-SCH-03 | Öneri arama ufku | **Default recommendation: 7 gün**, genişletilebilir ve yapılandırılabilir (§5.5) | ⚠️ Business invariant değil. Deterministik olmak için bir varsayılan gerekiyor; 7 gün "bu hafta bulalım" beklentisiyle uyumlu |
| SR-SCH-04 | Gösterilen öneri sayısı | **Default recommendation: 5** (§5.5) | ⚠️ Business invariant değil. Uzun liste karar yorgunluğu üretir; kabul kriteri sayıya değil "sınırlı ve anlamlı" davranışına bağlanır |
| SR-SCH-05 | Tekrarlayan etkinlikte öneri | **Yalnızca ilk örnek** (EC-SCH-05) | Seri geneli için ortak boş zaman aramak, D-050'nin "basit ve test edilebilir" kısıtını aşar ve kombinatorik olarak patlar |
| SR-SCH-06 | Organizatör kendi müsaitliği | **Katılımcı değilse hesaba katılmaz** (EC-SCH-08) | `15` BR-EVT-15 organizatörün otomatik katılımcı olmadığını söylüyor; müsaitlik okuması da bunu izlemeli |
