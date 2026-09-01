# 14 — Calendar Shell Spec

**Cluster:** PC-01 + PC-02 + PC-06 + PC-14'ün etkinlik arama kısmı · **Katman:** Core Experience · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-037, D-043, D-045, D-046, D-047 · **Scope referansı:** `04-scope-closure.md` §PC-01, §PC-02, §PC-06, §PC-14
**Source of truth:** izinler → `10` · durumlar → `11` · takvim/renk → `12` · oda modeli → `13`

---

## 1. Purpose

Kullanıcının takvimde **nerede olduğunu, ne gördüğünü ve nasıl gezineceğini** tanımlar. Ayrıca **mesai saatleri** verisini tanımlar ve etkinliklerin ızgarada nasıl render edileceğini belirler.

Audit'in 3 numaralı bulgusuna doğrudan cevaptır: bugün Bugün butonu yok, aralık etiketi yok, ana alanda ileri/geri yok ve ızgara gece yarısında açılıyor — kullanıcının ilk gördüğü şey boş gece saatleri (`UX-01`, `UX-02`, `UX-04`).

---

## 2. Scope

### In Scope
- Navigasyon: **Bugün · ileri/geri · görünen aralık etiketi**
- Görünüm modları: **Günlük · Haftalık · Aylık · Odalara Göre**
- **Organizasyon mesai saatleri** verisi ve kabuktaki sunumu
- Varsayılan scroll pozisyonu; mesai dışının görsel olarak geri plana atılması
- Hafta başlangıcı
- Etkinlik render'ı: chip bilgi yoğunluğu, çakışan etkinlikler, çok günlü etkinlik, tekrar göstergesi
- **Rezervasyon durumu render'ı** (Müsait / Onay bekliyor / Rezerve)
- Sol rail kompozisyonu ve filtre yüzeyi
- **Etkinlik araması**
- Şimdi çizgisi, bugün göstergesi, hafta sonu ayrımı, mini takvim yoğunluk göstergesi
- Responsive davranış (D-047)

### Out of Scope
- **Takvim varlığı, renk kuralları ve takvim filtresi mantığı** → `12-calendars-spec.md` *(burada yalnızca yüzeyi tanımlanır)*
- Etkinlik oluşturma/düzenleme formu → `15-event-spec.md`
- Oda seçimi ve filtreleri → `16-room-booking-spec.md`
- Katılımcı müsaitliği → `17-scheduling-spec.md`
- **Sürükle-bırak ve yeniden boyutlandırma** *(karar alınmadı; SR-SHELL-05)*
- Kullanıcı bazlı timezone (D-046) · resmî tatil takvimi (D-045) · ICS/harici takvim aboneliği
- Mesai dışında oluşturmanın engellenmesi (D-045 — engellenmez)

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Normal kullanıcı** | Takvimde gezinir, görünüm seçer, filtreler, arar |
| **Organizasyon yöneticisi** | Ek olarak **organizasyon mesai saatlerini** tanımlar |

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Görünüm modu** | Dört değer: `Günlük` · `Haftalık` · `Aylık` · `Odalara Göre`. İlk üçü zaman ekseni, dördüncüsü kaynak ekseni. |
| **Görünen aralık** | O anda ekranda olan tarih aralığı (ör. 23–29 Ağustos 2026). |
| **Organizasyon mesai saatleri** | Haftanın günleri × başlangıç–bitiş saati. Organizasyon seviyesinde tanımlıdır (D-045). |
| **Mesai dışı bölge** | Izgarada mesai saatlerinin dışında kalan zaman. Görsel olarak geri plandadır ama **kullanılabilirdir**. |
| **Etkinlik chip'i** | Bir etkinliğin ızgaradaki görsel temsili. |
| **Şimdi çizgisi** | Bugünün sütununda geçerli saati gösteren gösterge. |

---

## 5. Business Rules

### 5.1 Navigasyon

| ID | Kural |
|---|---|
| **BR-SHELL-01** | Ana alanın üst şeridinde **her zaman** şunlar bulunur: **Bugün** aksiyonu · **ileri/geri** kontrolleri · **görünen aralık etiketi** · görünüm seçici. |
| **BR-SHELL-02** | **Bugün** aksiyonu, görünümü bugünü içeren aralığa taşır ve scroll'u mesai başlangıcına konumlar (BR-SHELL-08). |
| **BR-SHELL-03** | İleri/geri, **aktif görünüm moduna göre** hareket eder: Günlük → 1 gün, Haftalık → 1 hafta, Aylık → 1 ay, Odalara Göre → aktif zaman aralığı kadar. |
| **BR-SHELL-04** | Görünen aralık etiketi her zaman **yılı da** içerir. |
| **BR-SHELL-05** | Sol rail'deki mini takvim **ikincil navigasyondur**; ana navigasyonun yerini almaz. Mini takvimden bir gün seçmek ana görünümü o günü içeren aralığa taşır. |
| **BR-SHELL-06** | **Hafta Pazartesi ile başlar.** *(`UX-13` — bugün Pazar ile başlıyor; TR ve ISO-8601 konvansiyonu Pazartesi.)* |
| **BR-SHELL-07** | Görünüm modu ve seçili tarih, oturumlar arasında **korunur**. *(SR-SHELL-02)* |

### 5.2 Mesai saatleri ve zaman ekseni

| ID | Kural |
|---|---|
| **BR-SHELL-08** | Günlük ve Haftalık görünümler açıldığında scroll pozisyonu **mesai başlangıcındadır**, günün başında değil (D-045). |
| **BR-SHELL-09** | Mesai dışı bölge **görsel olarak geri plana atılır** ancak **etkileşime kapalı değildir** — kullanıcı oraya etkinlik oluşturabilir (D-045). |
| **BR-SHELL-10** | Mesai saatleri organizasyon seviyesinde tanımlıdır ve **günlere göre değişebilir** (ör. Cumartesi farklı, Pazar kapalı). |
| **BR-SHELL-11** | Mesai saatleri tanımlı değilse ızgara 24 saat eşit gösterilir ve scroll varsayılan olarak **günün ilk mesai benzeri saatine değil, sabaha** konumlanır. *(SR-SHELL-01)* |
| **BR-SHELL-12** | Zaman ekseni **24 saat** kapsar; mesai dışı saatler gizlenmez, yalnızca bastırılır. |
| **BR-SHELL-13** | Saat etiketleri **saat:dakika** biçiminde gösterilir. *(`UX-09` — bugün `01`, `02` şeklinde, sıra numarası gibi okunuyor.)* |
| **BR-SHELL-14** | Tüm saatler **organizasyonun tek zaman diliminde** yorumlanır ve gösterilir (D-046). Kullanıcı bazlı zaman dilimi yoktur. |
| **BR-SHELL-15** | Hafta sonu sütunları hafta içinden **görsel olarak ayırt edilebilir** olmalıdır. |
| **BR-SHELL-16** | **Şimdi çizgisi** bugünün sütununda gösterilir ve geçerli saati işaretler. |
| **BR-SHELL-17** | Bugün, gün başlığında **belirgin biçimde** işaretlenir. *(`UX-05` — bugün yalnızca soluk gri bir daire.)* |

### 5.3 Etkinlik render'ı

| ID | Kural |
|---|---|
| **BR-SHELL-18** | Etkinlik chip'i, alan izin verdiği ölçüde şu bilgileri **öncelik sırasıyla** taşır: **başlık → saat → oda**. *(`UX-10` — bugün yalnızca kırpılmış başlık var.)* |
| **BR-SHELL-19** | Chip'in rengi **atandığı takvimin rengidir** — `12-calendars-spec.md` BR-CAL-11. Bu spec renk kaynağı tanımlamaz. |
| **BR-SHELL-20** | **Rezervasyon durumu** (Onay bekliyor / Rezerve) chip üzerinde **takvim renginden ayrı bir görsel eksende** gösterilir — `12` BR-CAL-15, `11` ST-PEND-02. |
| **BR-SHELL-21** | **Tekrarlayan etkinlik** chip üzerinde ayırt edilebilir bir işaret taşır (D-043). |
| **BR-SHELL-22** | **Çakışan etkinlikler yan yana** render edilir; hiçbir etkinlik başka bir etkinliğin altında tamamen kaybolmaz. |
| **BR-SHELL-23** | **Çok günlü ve tüm gün etkinlikler**, ızgaranın üstünde ayrı bir **tüm gün şeridinde** gösterilir. Şerit daraltılabilir. |
| **BR-SHELL-24** | Çok kısa süreli etkinlikler (chip'in okunamayacağı kadar kısa) için **minimum okunabilir yükseklik** uygulanır; komşu etkinliklerle çakışması engellenir. |
| **BR-SHELL-25** | Aylık görünümde bir güne sığmayan etkinlikler için **"+N daha"** göstergesi bulunur ve o güne geçiş sağlar. |
| **BR-SHELL-26** | Mini takvimde etkinliği olan günler **yoğunluk göstergesi** taşır. *(`UX-12`)* |
| **BR-SHELL-41** | ⭐ **Hover önizleme kartı** *(U-05 · PC-02 — 1 Eylül 2026'da kapsama alındı)*. Izgaradaki bir etkinliğin üzerinde kısa bir bekleme sonrası, etkinliği açmadan okunabilir bir önizleme gösterilir. Kart **en az** şunları taşır: **başlık · takvim · saat aralığı ve süre · oda (veya oda yok) · rezervasyon durumu · katılımcı listesi ve her katılımcının müsait/meşgul durumu**. Tekrarlayan seri ise seri bilgisi, paylaşılan takvim etkinliği ise sahibi ve salt okunur olduğu belirtilir. |
| **BR-SHELL-42** | ⚠️ **Önizleme kartı bilgiyi tekelleştiremez.** Karttaki her bilgi, etkinliğe tıklandığında açılan yüzeyde de bulunur. Kart bir kısayoldur, tek erişim yolu değildir — `11` ST-DIS-03. |
| **BR-SHELL-43** | Önizleme kartı **yalnızca gerçek imleci olan cihazlarda** gösterilir. Dokunmatik girişte hiç render edilmez; mobil karşılığı yoktur. |
| **BR-SHELL-44** | Kart, katılımcı müsaitliğini **yalnızca müsait/meşgul** olarak gösterir; çakışan etkinliğin başlığı, odası veya katılımcıları açığa çıkmaz — `10` BR-PRM-11. Organizasyon dışı katılımcı için durum **Bilinmiyor**'dur. |
| **BR-SHELL-45** | Kart **tek bir aksiyon** taşıyabilir: **etkinliği silme**. Bunun dışında buton veya bağlantı bulunmaz; düzenleme, oda değiştirme, katılımcı ekleme gibi işlemler etkinlik yüzeyine aittir. *(1 Eylül 2026'da revize edildi — ilk hâli hiçbir aksiyona izin vermiyordu.)* |
| **BR-SHELL-45a** | Silme aksiyonu **yalnızca kullanıcının düzenleyebildiği etkinliklerde** gösterilir. Paylaşılan takvimin salt okunur etkinliğinde **hiç render edilmez** — `12` BR-CAL-27. |
| **BR-SHELL-45b** | ⚠️ Silme **doğrudan gerçekleşmez**: açık onay diyaloğundan geçer ve etkilenecek rezervasyon sonucunu belirtir — `11` ST-DES-01/02, `15` BR-EVT-29/30, `18` BR-APR-31/32. Karttan silme, drawer'daki silme yolunun **yerini almaz**; ikisi aynı onay akışını kullanır. |
| **BR-SHELL-45c** | Aksiyon kartın **altında ayrı bir satırda** ve **etiketli** durur; yalnız ikon olarak gösterilmez. Yıkıcı işlemin hover yüzeyinde kazara tetiklenme riski bu şekilde düşürülür. |

### 5.4 Görünüm modları

| ID | Kural |
|---|---|
| **BR-SHELL-27** | **Odalara Göre** görünümü, oda × zaman ızgarasıdır. Satırlar odalar, sütunlar zamandır. |
| **BR-SHELL-28** | Odalara Göre görünümünde yalnızca kullanıcının `Görebilir` yetkisi olan odalar listelenir — `10` BR-PRM-09. |
| **BR-SHELL-29** | Odalara Göre görünümünde **dolu slotlar renklendirilir** ve üç durum ayrıştırılır: Müsait · Onay bekliyor · Rezerve (D-036). |
| **BR-SHELL-30** | Görünüm seçicide zaman ekseni ve kaynak ekseni **görsel olarak ayrılır**; ikisi tek bir düz segment listesi olarak sunulmaz. *(`UX-11`)* |

### 5.5 Sol rail ve filtreler

| ID | Kural |
|---|---|
| **BR-SHELL-31** | Sol rail **üç filtreleme eksenini** barındırır: **tarih navigatörü · takvimler · odalar**. ⚠️ **Takvimler ekseni iki bölümdür:** kullanıcının **sahip olduğu** takvimler ve **kendisiyle paylaşılan** takvimler (`12` BR-CAL-16, D-067). *(1 Eylül 2026'da revize edildi: ilk hâli `KEEP-03`'ün dört eksenini — tarih · **tip** · oda · takvim — mekanik taşıyıp kaldırılan tip ekseninin yerine **"diğer filtreler"** adlı, arkasında hiçbir karar olmayan bir yer tutucu koymuştu. D-037 tip eksenini kaldırdığı için gerçek eksen sayısı üçtür. Bkz. SR-SHELL-09.)* |
| **BR-SHELL-31a** | **"Benimle paylaşılanlar"** bölümü, kullanıcıyla hiç takvim paylaşılmamışsa **gösterilmez** (`12` SR-CAL-08). |
| **BR-SHELL-31b** | Paylaşılan takvim satırı **sahibinin adıyla** ilişkilendirilir ve **kendi rengini** taşır (`12` BR-CAL-30/31). |
| **BR-SHELL-31c** | **Odalar ekseni**, kullanıcının `Görebilir` yetkisi olan odaları listeler (`10` BR-PRM-09). Bir oda kapatıldığında **o odada rezerve edilmiş etkinlikler ızgaradan düşer**; eksen "Odalara Göre" görünümünde de geçerlidir. ⚠️ **Odasız etkinlikler bu eksenden etkilenmez** — oda ekseni bir daraltma filtresidir, etkinlik gizleme mekanizması değildir. |
| **BR-SHELL-31d** | Oda ekseni **yalnızca görünümü daraltır**: yetkiyi, müsaitliği veya rezervasyon durumunu değiştirmez. Kapatılan odada yapılan rezervasyon geçerli kalır ve oda seçicide görünmeye devam eder. |
| **BR-SHELL-32** | Bir filtre bölümü kapalıyken **kaç öğenin gizlendiği okunabilir** olmalıdır. *(`UX-14`)* |
| **BR-SHELL-33** | Takvim filtresinin mantığı `12-calendars-spec.md` BR-CAL-16…20'de tanımlıdır; bu spec yalnızca yüzeyi sağlar. |
| **BR-SHELL-33a** | **Paylaşılan takvimin etkinlikleri ızgarada normal render edilir** ancak **salt okunurdur**: seçildiğinde açılan detayda düzenleme aksiyonları gösterilmez veya sebebiyle pasiftir (`12` BR-CAL-27, `11` ST-DIS-01/02). |
| **BR-SHELL-33b** | Paylaşılan takvimin boş bir slot'una tıklamak **Quick Create açmaz** — kullanıcı o takvime etkinlik oluşturamaz (`12` BR-CAL-27). |
| **BR-SHELL-34** | **Etkinlik tipi filtresi yoktur** — tip ayrımı kaldırıldı (D-037). *(`UX-18`'in çözümü: bugün ayırt edilemeyen iki filtre etiketi vardı.)* |
| **BR-SHELL-35** | Filtre lejantındaki renk, ızgaradaki chip rengiyle **birebir aynıdır** — `12` BR-CAL-14. |

### 5.6 Etkinlik araması (PC-14)

| ID | Kural |
|---|---|
| **BR-SHELL-36** | Takvim yüzeyinde etkinlik araması bulunur (`UX-17`). |
| **BR-SHELL-37** | Arama şu alanlarda çalışır: **başlık · notlar · oda adı · katılımcı adı**. |
| **BR-SHELL-38** | Arama, kullanıcının **erişebildiği** etkinliklerle sınırlıdır — **üç kategori**: **(1)** kendi etkinlikleri · **(2)** davetli olduğu etkinlikler · **(3)** **kendisiyle paylaşılmış takvimlerdeki etkinlikler** (D-069). ⚠️ **Free/busy hakkı, bir etkinliği arama hakkı anlamına gelmez.** Bunların dışındaki etkinlikler arama sonucunda görünmez ve erişilemeyen detaylar **arama indeksi üzerinden sızamaz** (`10` BR-PRM-11). |
| **BR-SHELL-39** | Arama sonucu **liste olarak** sunulur ve her satır yeterli bağlam taşır: **etkinlik adı · tarih/saat · ait olduğu takvim · (varsa) oda**. ⚠️ Sonuç **paylaşılan bir takvimden** geliyorsa satır **kaynak takvimi ve sahibini** gösterir (D-069). Sonuçtan etkinliğe gidildiğinde takvim o tarihe konumlanır. |
| **BR-SHELL-40** | Arama, aktif takvim filtresinden **bağımsız** çalışır. Filtre nedeniyle ızgarada görünmeyen bir etkinlik de sonuçlarda çıkar; bu durum *"mevcut takvim filtresi nedeniyle ızgarada görünmüyor"* şeklinde açıklanır. ⚠️ Bu bir görünüm açıklamasıdır — **yeni bir takvim durumu veya gizlilik modeli değildir.** *(SR-SHELL-04)* |

---

## 6. User Flows

### F-SHELL-1 · Takvimi açma
```
Takvim modülü → son kullanılan görünüm ve tarih geri yüklenir (BR-SHELL-07)
→ bugünü içeren aralık gösterilir
→ scroll mesai başlangıcına konumlanır (BR-SHELL-08)
→ şimdi çizgisi bugünün sütununda görünür
```

### F-SHELL-2 · Gezinme ve dönüş
```
İleri oku → aktif moda göre bir birim ilerler (BR-SHELL-03)
→ aralık etiketi güncellenir
→ [Bugün] → bugüne döner ve scroll yeniden mesai başlangıcına konumlanır
```

### F-SHELL-3 · Odalara Göre görünümüne geçiş
```
Görünüm seçici → Odalara Göre
→ kullanıcının görebildiği odalar satır olarak listelenir (BR-SHELL-28)
→ dolu slotlar Müsait / Onay bekliyor / Rezerve olarak ayrıştırılmış görünür
→ boş bir slot seçildiğinde 15-event-spec akışı, odası önceden seçili olarak başlar
```

### F-SHELL-4 · Etkinlik arama
```
Arama → metin yaz
→ başlık / not / oda / katılımcı eşleşmeleri liste olarak gelir
→ sonuç seçilir → takvim o etkinliğin tarihine konumlanır ve etkinlik vurgulanır
→ etkinlik, filtre nedeniyle ızgarada görünmüyorsa bu bilgi sonuçta belirtilir (BR-SHELL-40)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-SHELL-01** | Izgarada boş bir slot'a tıklamak **Quick Create**'i açar — `15-event-spec.md` (D-038). |
| **IR-SHELL-02** | Mevcut bir etkinliğe tıklamak **etkinlik detayını** açar — `15-event-spec.md`. |
| **IR-SHELL-03** | Görünüm modu değişimi **seçili tarihi korur**; kullanıcı bağlamını kaybetmez. |
| **IR-SHELL-04** | Izgara yüklenirken navigasyon kontrolleri kullanılabilir kalır — `11` ST-LOAD-04. |
| **IR-SHELL-05** | Tüm gün şeridi daraltıldığında kaç etkinliğin gizlendiği okunabilir olur (BR-SHELL-23). |
| **IR-SHELL-06** | Aylık görünümde "+N daha" göstergesi tıklanabilirdir ve o günün Günlük görünümüne götürür. |
| **IR-SHELL-07** | Mesai dışı bölgeye etkinlik oluşturulduğunda kullanıcı **engelleyici olmayan bir uyarı** görür — `11` ST-VAL-05, sınıflandırma D-045 gereği non-blocking. |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`. Bu modüle özgü olanlar:

| State | Davranış |
|---|---|
| **Loading (ızgara)** | Izgara yapısı korunarak yer tutucu gösterilir; navigasyon aktif kalır (ST-LOAD-01, ST-LOAD-04). |
| **Empty (aralıkta etkinlik yok)** | "Bu aralıkta etkinlik yok" bilgisi gösterilir; sessiz boş ızgara yeterli değildir (ST-EMPTY-04, ST-CORE-06). |
| **Empty (filtre kaynaklı)** | Tüm takvimler kapalıysa sebep belirtilir ve temizleme yolu sunulur — `12` BR-CAL-20. |
| **Error (veri gelmedi)** | Boş ızgaradan **ayırt edilebilir** biçimde gösterilir; tekrar dene yolu sunulur (ST-CORE-06, ST-ERR-04). |
| **Empty (arama)** | Filtre kaynaklı boş durum; aramayı temizleme yolu sunulur. |
| **Odalara Göre — oda yok** | Kullanıcının görebildiği oda yoksa bu açıkça söylenir; boş ızgara gösterilmez. |

---

## 9. Validation

Bu modül veri girişi almaz; tek istisna mesai saatleri tanımıdır.

| ID | Kural | Davranış |
|---|---|---|
| **V-SHELL-01** | Mesai bitişi başlangıçtan sonra olmalıdır | Alan altı hata; kaydetme engellenir |
| **V-SHELL-02** | En az bir çalışma günü tanımlı olmalıdır | Alan altı hata |
| **V-SHELL-03** | Arama sorgusu için minimum karakter sayısı | Altındaysa arama tetiklenmez; kullanıcıya sessizce beklenir, hata gösterilmez |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-SHELL-01** | Mesai saatleri hiç tanımlanmamış | BR-SHELL-11 geçerli; ızgara 24 saat eşit, scroll sabaha konumlanır. Bu bir hata değildir. |
| **EC-SHELL-02** | Mesai saatleri gece yarısını aşıyor (ör. 22:00–06:00) | Mesai bölgesi iki parçaya bölünerek gösterilir. Scroll ilk parçanın başlangıcına konumlanır. |
| **EC-SHELL-03** | Bir günde çok fazla çakışan etkinlik var | Yan yana render daraldıkça chip bilgi önceliği kısalır (BR-SHELL-18); okunabilirlik sınırında "+N daha" davranışına geçilir. |
| **EC-SHELL-04** | Çok günlü etkinlik görünen aralığı taşıyor | Tüm gün şeridinde **devam ettiği** görsel olarak belirtilir (başı/sonu kesik gösterim). |
| **EC-SHELL-05** | Kullanıcı Odalara Göre görünümündeyken tüm odaları görme yetkisini kaybeder | Boş ızgara değil, açık bir "görebileceğiniz oda yok" durumu gösterilir. |
| **EC-SHELL-06** | Bugün, görünen aralığın dışında | Şimdi çizgisi render edilmez; **Bugün** aksiyonu vurgulu kalır. |
| **EC-SHELL-07** | Arama sonucu, kullanıcının filtreyle kapattığı bir takvimdeki etkinliği döndürür | Sonuç gösterilir ve etkinliğin *mevcut filtre nedeniyle ızgarada görünmediği* belirtilir (BR-SHELL-40). |
| **EC-SHELL-08** | Tekrarlayan bir etkinliğin tek örneği değiştirilmiş | Chip, seriden **saptığını** ayırt edilebilir biçimde gösterir — `15-event-spec.md` ile tutarlı. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | Odalara Göre görünümündeki oda görünürlüğü; arama sonuçlarının sınırı |
| `11-system-states-spec.md` | Loading / empty / error / pending sunumu |
| `12-calendars-spec.md` | **Renk kaynağı, takvim filtresi ve Calendar Sharing** — bu spec yalnızca yüzeyi sağlar; paylaşım kuralları `12` §5.6'da |
| `13-rooms-spec.md` | Odalara Göre görünümünün oda listesi ve müsaitlik verisi |
| `15-event-spec.md` | Slot tıklama → Quick Create; etkinlik tıklama → detay |
| `16-room-booking-spec.md` | Odalara Göre görünümünden başlayan rezervasyon akışı |

---

## 12. Responsive Expectations

Desktop-first (D-047). Mobil zorunlu akışlardan **ikisi bu spec'e ait**: *etkinlikleri görüntüleme* ve *günler arası gezinme*.

| ID | Kural |
|---|---|
| **RS-SHELL-01** | **Mobilde haftalık ızgara birebir küçültülmez.** Agenda / gün / liste gibi daha uygun bir responsive pattern kullanılabilir (D-047). |
| **RS-SHELL-02** | Navigasyon üçlüsü (Bugün · ileri/geri · aralık etiketi) mobilde de **her zaman erişilebilir** olmalıdır. |
| **RS-SHELL-03** | Sol rail mobilde katlanabilir bir yüzeye dönüşür; BR-SHELL-32'nin "kaç öğe gizli" bilgisi bu durumda daha kritiktir. **"Benimle paylaşılanlar" bölümü mobilde de erişilebilir olmalıdır.** |
| **RS-SHELL-04** | Odalara Göre görünümü mobilde yatay kaydırma gerektirebilir; oda adları sabit kalmalıdır. |
| **RS-SHELL-05** | Etkinlik araması mobilde erişilebilir olmalıdır. |

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Mesai içi/dışı ayrımı, hafta sonu ayrımı ve şimdi çizgisi aynı ızgarada yaşayacak.** Üçü de arka plan katmanında çalışıyor; birbirini boğmamalı.
- **Chip üzerinde üç bilgi katmanı var:** takvim rengi (kimlik) + rezervasyon durumu (durum) + tekrar işareti. Bunlar farklı görsel kanallar gerektiriyor (BR-SHELL-19/20/21). Bu, `12` BR-CAL-15 ile birlikte **renk paletinin en sıkı kısıtı**.
- **Chip bilgi önceliği daraldıkça kademeli olarak kısalmalı** (BR-SHELL-18, EC-SHELL-03) — sabit bir yerleşim yetmez.
- **Görünüm seçicide iki eksen ayrılmalı** (BR-SHELL-30): zaman modları bir arada, Odalara Göre ayrı konumlanmalı.
- Sol rail bugün genişliğin ~%40'ını tek bir tarih için harcıyor (`UX-15`); yeniden dengelenmesi gerekiyor.
- Mobil için **agenda/liste pattern'i ayrı bir tasarım problemidir** (RS-SHELL-01), ızgaranın küçültülmüş hali değil.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-SHELL-01 | Ana alanın üst şeridinde Bugün, ileri/geri ve görünen aralık etiketi her zaman bulunur. |
| AC-SHELL-02 | Günlük ve Haftalık görünümler mesai başlangıcına konumlanmış olarak açılır. |
| AC-SHELL-03 | Mesai dışı bölge görsel olarak bastırılır ancak etkinlik oluşturmaya açıktır. |
| AC-SHELL-04 | Hafta Pazartesi ile başlar. |
| AC-SHELL-05 | Saat etiketleri saat:dakika biçimindedir. |
| AC-SHELL-06 | Bugün sütunu ve şimdi çizgisi belirgin biçimde görünür. |
| AC-SHELL-07 | Etkinlik chip'i alan izin verdiğince başlık, saat ve oda bilgisini taşır. |
| AC-SHELL-08 | Çakışan etkinlikler yan yana render edilir; hiçbiri tamamen kaybolmaz. |
| AC-SHELL-09 | Çok günlü ve tüm gün etkinlikler ayrı bir şeritte gösterilir. |
| AC-SHELL-10 | Rezervasyon durumu, takvim renginden ayrı bir görsel kanalda gösterilir. |
| AC-SHELL-11 | Odalara Göre görünümünde yalnızca kullanıcının görebildiği odalar listelenir ve üç durum ayrıştırılır. |
| AC-SHELL-12 | Arayüzde etkinlik tipi filtresi bulunmaz. |
| AC-SHELL-13 | Filtre lejantındaki renk ızgaradaki chip rengiyle aynıdır. |
| AC-SHELL-14 | Etkinlik araması başlık, not, oda ve katılımcı alanlarında çalışır ve yalnızca kullanıcının erişebildiği etkinlikleri döndürür; free/busy hakkı arama hakkı vermez. |
| AC-SHELL-17 | Arama sonucu satırı etkinlik adı, tarih/saat, takvim ve (varsa) oda bağlamını taşır. |
| AC-SHELL-18 | Sol rail'de sahip olunan takvimler ile paylaşılan takvimler ayrı bölümlerde listelenir; paylaşılan yoksa bölüm gösterilmez. |
| AC-SHELL-19 | Paylaşılan takvimin etkinlikleri ızgarada görünür ancak düzenlenemez; boş slot'una tıklamak Quick Create açmaz. |
| AC-SHELL-20 | Arama, paylaşılan takvimlerdeki etkinlikleri de döndürür ve sonuç satırı kaynak takvimi/sahibini gösterir. |
| AC-SHELL-15 | Boş aralık ile yüklenememiş aralık görsel olarak ayırt edilir. |
| AC-SHELL-16 | Mobilde haftalık ızgaranın birebir küçültülmüş hali kullanılmaz. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-SHELL-01 | Mesai saati tanımlı değilse scroll nereye? | **Sabaha** (BR-SHELL-11) | D-045 mesai scroll'unu bağlayıcı yaptı ama tanımsız durumu kapsamıyor; gece yarısına açmak `UX-04`'ün tekrarı olurdu |
| SR-SHELL-02 | Görünüm modu ve tarih kalıcı mı? | **Oturumlar arası korunur** (BR-SHELL-07) | `12` SR-CAL-03 (filtre kalıcılığı) ile aynı ilke |
| SR-SHELL-03 | Aylık görünümde taşan etkinlikler | **"+N daha" + güne geçiş** (BR-SHELL-25) | Chip'i okunamayacak kadar küçültmek `UX-10`'un tekrarı olur |
| SR-SHELL-04 | Arama takvim filtresinden etkilenir mi? | **Hayır, bağımsız çalışır**; filtre nedeniyle ızgarada görünmeyen sonuç için açıklama gösterilir (BR-SHELL-40) | Filtre bir görünüm tercihi, arama bir bulma eylemi. Filtreye takılan arama "neden bulamıyorum?" üretir. ⚠️ Bu bir görünüm açıklamasıdır, yeni bir gizlilik/domain state'i değildir |
| SR-SHELL-05 | Sürükle-bırak / yeniden boyutlandırma | **İlk kapsam dışı** | Karar alınmadı (`04-scope-closure.md` §4). Oda rezervasyonlu etkinlikte taşıma; çakışma, yetki ve onay durumunun yeniden hesabını gerektirir — D-034/D-036 ile birlikte bedelsiz değil |
| SR-SHELL-06 | Gece yarısını aşan mesai | **İki parçalı gösterim** (EC-SHELL-02) | Vardiyalı kurum senaryosu; tek parça varsayımı sessizce yanlış render üretir |
| SR-SHELL-07 | Hover önizleme kartı | **Kapsama alındı** (BR-SHELL-41…45c) | `04-scope-closure.md` PC-02 bunu "spec seviyesinde önerilecek" diyerek kapsam dışı bırakmıştı; öneri FAZ 4'te yazılmamıştı. 1 Eylül 2026'da ürün sahibi kapsama almaya karar verdi. Kart bilgiyi hover'a hapsetmediği ve yeni domain state üretmediği için maliyeti düşük |
| SR-SHELL-11 | Tarih kartı ile mini takvim aynı günü mü göstermeli? | **Evet** — tek bir *seçili gün* kavramı; mini takvimde seçili **dolu**, bugün **halka** (BR-SHELL-05b) ve haftalık adım gün konumunu korur (BR-SHELL-03) | Kart *seçili günü*, mini takvim ise *bugünü* gösteriyordu; ikisi tek gösterge sanılıyordu. Ayrıca haftalık adım anchor'ı hafta başına sabitlediği için kart Pazartesi'yi, mini takvim Cuma'yı işaretliyordu. Kök neden **"seçili gün" kavramının hiç tanımlanmamış olmasıydı**: durumda yalnız `today` ve hafta anchor'ı vardı |
| SR-SHELL-10 | Tarih kartı ve mini takvim ana görünümü izlemeli mi? | **Evet** (BR-SHELL-04a, BR-SHELL-05a) | Kart sabit "bugün"ü gösteriyordu; ileri/geri okları çalışıyor ama **kartta hiçbir şey değişmiyordu** — kullanıcı navigasyonun bozuk olduğunu düşündü. Mini takvim de ana görünümü izlemiyordu. Kartta `Bugün` **ve** ok kontrollerinin birlikte bulunması, kartın bakılan konumu göstermesini zaten gerektiriyor: sabit tarihin yanında "Bugün" butonu anlamsızdır. Aynı turda `BR-SHELL-03`'ün moda göre adım kuralı da uygulandı — kart doğru tarihi gösterince aylık görünümde bir hafta atlamanın yanlışlığı görünür hâle geldi |
| SR-SHELL-09 | Sol rail'in dördüncü ekseni ve canonical'daki "Filtreler" kartı | **Üç eksen** (BR-SHELL-31); "Filtreler" kartı **oda ekseniyle değiştirildi**; görünüm seçiciye **ayırıcı** eklendi (BR-SHELL-30) | Üç bulgu aynı kökten geliyordu: `KEEP-03` dört eksen sayıyordu ama biri **tip**ti ve D-037 onu kaldırdı; ben yerine dayanaksız bir "diğer filtreler" yazdım; tasarım da kaldırılan tip filtresini geri çizip `KEEP-03`'ün koru dediği **oda** eksenini düşürdü. Düzeltme **yeni özellik eklemiyor** — dayanağı olmayan iki satırı çıkarıp korunması kararlaştırılan ekseni geri getiriyor. ⚠️ "Katılımcı" filtresi bilinçli olarak **eklenmedi**: hiçbir kararda geçmiyor, eklenirse karar alınmamış bir özellik olurdu | 1 Eylül 2026 · Kullanıcı |
| SR-SHELL-08 | Kart aksiyon taşıyabilir mi? | **Yalnız silme** (BR-SHELL-45…45c) | İlk öneri "hiç aksiyon yok" idi; ürün sahibi 1 Eylül 2026'da silmeyi istedi. Yıkıcı işlem olduğu için üç kısıt eklendi: yalnız düzenlenebilir etkinlikte, onay diyaloğundan geçerek, etiketli ayrı satırda. Alternatif *(tam aksiyon menüsü)* kartı ikinci bir düzenleme yüzeyine çevirirdi — `04-scope-closure.md` PC-02'nin dışına çıkardı |
