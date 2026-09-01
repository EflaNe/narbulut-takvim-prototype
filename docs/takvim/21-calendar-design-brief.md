# 21 — Narbulut Calendar · Design Brief

**Faz:** 6A — Design Brief Preparation · **Durum:** ✅ **FAZ 6A FINAL**
**Hedef okuyucu:** Claude Design *(veya tasarım ekibi)*
**Kaynak:** `00`–`20` doküman seti · `DECISIONS.md` D-025…D-058

> Bu belge bir Product Spec kopyası **değildir**. Tasarımcının ihtiyaç duyduğu bilginin sentezidir.
> Derinlik gerektiğinde ilgili spec'e referans verilir — brief onları tekrar anlatmaz.

---

## 1. Product Context

**Narbulut Calendar**, mevcut Narbulut Takvim modülünün **görsel ve UX olarak yeniden tasarımıdır.**

| | |
|---|---|
| **Mevcut frontend'in rolü** | **Problem ve kanıt kaynağı.** Birebir korunmayacak. |
| **Yeni tasarımın yaklaşımı** | **Greenfield frontend redesign.** Mevcut ekran yerleşimleri, etkileşim kalıpları ve bilgi mimarisi bir kısıt değildir. |
| **Devralınan** | İş mantığı · kullanıcı kavramları · platformla ilişkili yapı taşları · korunmaya değer fikirler |
| **Devralınmayan** | Kötü UX kalıpları. *"Eskiden böyleydi"* bir gerekçe değildir. |
| **Backend** | **Bu fazın kapsamında değil.** Frontend state, mock data ve beklenen davranış tanımlanır. |

### Mevcut sistemin en ağır problemleri *(tasarımın çözmesi beklenenler)*

| # | Problem | Kanıt |
|---|---|---|
| 1 | **Durum iletişimi güvenilmez.** Bir yerde hata sessizce yutuluyor; başka bir yerde işlem bitmeden *"Tebrikler, oluşturuldu!"* deniyor. | `FB-01` `UX-50` |
| 2 | **Oda sisteminde "dolu" kavramı yok.** Aynı oda aynı saatte iki kez rezerve edilebiliyor. | `FN-03` |
| 3 | **Takvim kabuğunun temel kontrolleri yok.** Bugün butonu, aralık etiketi, ana alanda ileri/geri; ızgara gece yarısında açılıyor — kullanıcının ilk gördüğü şey boş gece saatleri. | `UX-01/02/04` |
| 4 | **Etkinlik formunda tarih değiştirilemiyor**, bitiş tarihi hiç yok. Kozmetik "Renk Değiştir" asıl alanın üstünde birincil buton olarak duruyor. | `UX-23/24/25` |
| 5 | **Renk üç ayrı kaynaktan geliyor** ve önceliği tanımsız; filtre lejantı ızgaradaki renklerle eşleşmiyor. | `UX-18/19/20` |
| 6 | **Modül içinde dört farklı birincil buton görünümü** var (gri-pasif / mavi / yeşil / koyu gri). | `UX-39` |

**Detay:** `00-current-state-audit.md`

---

## 2. Design Goals

1. **Modern B2B SaaS calendar experience** — kurumsal ama ağır değil.
2. **Yoğun kullanımda hızlı okunabilirlik** — kullanıcı takvime bakıp saniyeler içinde "neredeyim, ne var, ne boş" sorularını cevaplamalı.
3. **Oda rezervasyonu takvimin doğal parçası** — ayrı bir modül gibi değil, etkinlik oluşturmanın içinde.
4. **Karmaşık scheduling bilgisi korkutucu görünmemeli** — müsaitlik, çakışma ve öneriler forma yük bindirmemeli.
5. **Yüksek bilgi yoğunluğuna rağmen temiz hiyerarşi** — bir etkinlik chip'i aynı anda üç bilgi taşıyabilir; kalabalık olmadan.
6. **Desktop-first, responsive** — masaüstü ana çalışma yüzeyi; mobil ikinci sınıf değil ama birebir küçültme de değil.
7. **Narbulut ürün ailesine uyarlanabilir görsel dil** — platform kabuğuyla (dil, dark mode, bildirim, organizasyon değiştirici) bütünleşebilmeli.

---

## 3. Primary Users

| Aktör | Ne yapar | Tasarım açısından önemi |
|---|---|---|
| **Normal User** | Etkinlik oluşturur, katılımcı ekler, uygun zaman ve oda bulur | **Ana kullanıcı.** Ekranların çoğu bu kişi için. Sık ama kısa oturumlar. |
| **Organization Admin** | Odaları, erişimleri ve onay yapılandırmasını yönetir | **Nadir ama derin** kullanım. Yönetim yüzeyleri masaüstü odaklı olabilir. |
| **Room Approver** | Sorumlu olduğu odaların taleplerini değerlendirir | **Kesintili ve hızlı** kullanım: bildirimden gelir, karar verir, çıkar. Genel bir yönetici değildir — yalnızca kendi odalarını görür. |
| **External Guest** | — | ⚠️ **UI kullanıcısı DEĞİLDİR.** Uygulamada hesabı yoktur. Yalnızca davet/bildirim alıcısıdır ve tek kanalı e-postadır. Hiçbir ekran bu kişi için tasarlanmaz. |

---

## 4. Information Architecture Input

Beş ana yüzey var. **Bunların IA'da nasıl gruplanacağı tasarımcıya açıktır** — mevcut navigasyonu körü körüne korumayın.

| Yüzey | İçerik |
|---|---|
| **Calendar** | Ana takvim deneyimi |
| **Calendars** | Takvim varlıkları: isim + renk yönetimi, filtreleme, **paylaşım yönetimi** (D-067) |
| **Rooms** | Oda kaynak yönetimi *(admin)* |
| **Permissions** | Merkezî erişim görünümü *(admin)* |
| **Reservation Approval Queue** | Onay kuyruğu *(approver)* |

**Mevcut IA'nın bilinen problemleri:**
- "Odalar" **iki farklı anlamda iki yerde** — sol rail filtresi ve üst sekme yönetimi `[IA-02]`
- **Yönetim ve günlük kullanım aynı sekme seviyesinde** `[IA-03]`
- Odalar sekmesi **oluşturma-öncelikli** açılıyor; olması gereken liste-öncelikli `[IA-04]`
- Kalıcı bir **"Nasıl Kullanılır?"** paneli genişliğin ~%25'ini tutuyor `[IA-05]`
- **İzinler sekmesi görünür ama pasif** — ölü sekme `[IA-01]`

> **Tasarımcıdan beklenen:** bu beş yüzeyin gruplanması için **variant önerileri.** Özellikle *approver* ve *admin* yüzeylerinin normal kullanıcıyı rahatsız etmeden nerede yaşayacağı.

---

## 5. Core Surfaces

Tasarlanması gereken yüzeyler. **Her birinin responsive karşılığı da düşünülmeli.**

### 5.1 Calendar Main
Görünümler: **Günlük · Haftalık · Aylık · Odalara Göre** *(oda × zaman ızgarası)*
Kontroller: **Bugün · ileri/geri · görünen aralık etiketi** *(ana alanın üst şeridinde, her zaman)*
İçerik: arama · takvim filtreleri · mesai saati sunumu · etkinlik chip'leri · şimdi çizgisi · tüm gün şeridi
Kısıtlar: hafta **Pazartesi** başlar · ızgara **mesai başlangıcına** konumlanmış açılır · mesai dışı bastırılır ama **etkileşime açık kalır**

### 5.2 Quick Create
Yalnızca **başlık + tarih/saat + oluştur**. Takvim, oda, katılımcı, tekrar alanları **yok**.

### 5.3 Detailed Event Create / Edit
Oluşturma ve düzenleme **aynı yüzey**. Başlık birincil alan, **tek birincil aksiyon**. Alanlar: başlık · tarih/saat *(düzenlenebilir, bitiş tarihi dahil)* · tüm gün · konum · oda · takvim · katılımcılar · tekrar · notlar.
⚠️ **Renk seçme kontrolü YOK** — renk takvimden gelir.

### 5.4 Participant Availability + Suggested Times
**Form içinde**, ayrı ekran değil. Katılımcı satırında müsaitlik + üstte özet *("3 müsait · 2 meşgul (1 zorunlu) · 1 bilinmiyor")*. Öneriler isteğe bağlı tetiklenir, her biri gerekçesiyle gelir.

### 5.5 Room Picker
Detay: §10.

### 5.6 Event Detail
Etkinliğin okunabilir hali + yetkiye göre düzenle/sil. Rezervasyon durumu burada da görünür.

### 5.7 Rooms List
**Liste-öncelikli.** Satır aksiyonları *(düzenle · pasife al · sil)* · arama · üç durum işareti *(pasif · kısıtlı erişim · onay gerektiren)*.

### 5.8 Room Create / Edit
**Tek ekranlı, beş bölümlü form** *(sihirbaz yok)*: Genel bilgiler · Kapasite ve özellikler · Lokasyon *(koşullu)* · Erişim · Rezervasyon onayı. Kaydetmeden önce **inline özet**.

### 5.9 Permissions
Merkezî görünüm: odalar × erişim özeti. Her satır: oda · "Görebilir" özeti · "Rezerve edebilir" özeti.
⚠️ **Takvim paylaşımı buraya ait değildir** — takvim paylaşımını son kullanıcı kendi takviminden yönetir (§5.12), admin değil.

### 5.12 Calendar Sharing ⭐ *(D-067 ile eklendi)*
İki yüzey:
- **Paylaşım yönetimi (sahip):** takvimi kiminle paylaştığını gör, yeni kişi ekle, kaldır. ⚠️ **Zorunlu açıklama:** *"Bu takvimdeki mevcut ve gelecekteki etkinlik detayları paylaştığınız kişi tarafından görülebilir."*
- **"Benimle paylaşılanlar" (alıcı):** sol rail'de sahip olunan takvimlerden **ayrı bir bölüm**; her satır sahibinin adını ve takvimin kendi rengini taşır; görünürlük açılıp kapatılabilir.

**Kısıtlar:** paylaşım **salt okunurdur** — alıcı etkinlik oluşturamaz/düzenleyemez, boş slot'a tıklamak Quick Create açmaz · **tekil kullanıcı** hedefi *(grup yok)* · **tek seviye** *(kademe yok)* · alıcıda hiç paylaşım yoksa **bölüm gösterilmez**.

### 5.10 Reservation Approval Queue
Onaylayıcı yalnızca **kendi odalarının** taleplerini görür. Satır: etkinlik · oda · talep eden · tarih/saat · tekrar bilgisi · durum.

### 5.11 Approval Request Detail
Karar öncesi bağlam + Onayla / Reddet *(opsiyonel gerekçe)*.

---

## 6. Critical User Flows

Tam akışlar: **`20-ux-flows.md`**. Tasarımcı açısından kritik geçişler:

### F1 · Event → Scheduling → Room → Reservation
```
slot → Quick Create → [Daha fazla seçenek] → detay
     → katılımcı + müsaitlik → (ops.) Suggested Times
     → oda seçimi → oluştur
```
**Kritik geçiş:** Quick Create → detay. **Veri ve bağlam kaybolamaz.**
**Kritik dallanma:** onaysız oda → `Reserved` + başarı · onaylı oda → `Pending` + **başarı dili yasak**

### F2 · Pending → Approval → Approved / Rejected
**Kritik:** *Rejected* rezervasyonu düşürür ama **etkinliği silmez** — etkinlik odasız kalır.
**Kritik:** talep eden aynı zamanda onaylayıcıysa **kendi talebinde aksiyonlar gösterilmez**.

### F3 · Recurring Event
```
kural → önizleme → oda occurrence-bazlı değerlendirme
      → kısmi çakışmada AÇIK SEÇİM → oluştur
```
**Kritik:** düzenlemede **üç kapsam** *(bu / bu ve sonrakiler / tüm seri)* ve her birinin etkisi **sayıyla** gösterilir. "Tüm seri" geçmişi etkiliyorsa **açık uyarı**.

### F4 · Room Administration
Liste → tek ekranlı form → inline özet → kaydet. **Bildirim üretmez** *(bilinçli — D-057)*.

### F5 · Search / Conflict / Recovery
**Kritik ayrım:** oda çakışması **engeller**; katılımcı çakışması, kapasite, mesai dışı, geçmiş tarih **engellemez**.
**Kritik:** hata sonrası form kapanmaz, veri korunur, tekrar dene sunulur.

---

## 7. Visual System Constraints

> ⚠️ **Bu bölüm brief'in en kritik parçasıdır.** Buradaki kısıtlar ürün kararlarından doğar, estetik tercihten değil.

### 7.1 Calendar identity ≠ Reservation status ≠ Recurrence

Bir etkinlik chip'i **aynı anda üç bilgi** taşıyabilir:

| Bilgi | Kaynak |
|---|---|
| **Takvim kimliği** | Etkinliğin atandığı takvimin rengi — **renk kaynağı budur, tek kaynak** |
| **Rezervasyon durumu** | `Available` / `Pending` / `Reserved` |
| **Tekrar** | Seriye ait mi, sapmış bir occurrence mı |

⚠️ **Bunları yalnızca farklı renk tonlarıyla çözmeyin.** Ayrı görsel kanallar gerekir:
`arka plan / vurgu` · `rozet / ikon` · `kenarlık` · `desen` · `tipografi`

Takvim renk paleti ile rezervasyon durumu renkleri **çakışamaz**. Bu, palet tasarımının **en sıkı kısıtıdır**.

### 7.2 Reservation states — tek bakışta ayırt edilmeli

| Durum | Anlamı |
|---|---|
| **Available** | Oda o aralıkta boş |
| **Pending** | Onay bekleyen bir talep slotu tutuyor |
| **Reserved** | Kesinleşmiş rezervasyon |

Bu üçlü **dört ayrı yüzeyde** görünür: takvim chip'i · oda seçici · Odalara Göre görünümü · onay kuyruğu. **Dördünde de aynı görsel dil.**

### 7.3 Disabled room reasons — aynı görünüm olmamalı

Oda seçicide iki farklı sebeple satır seçilemez olabilir:

| Sebep | Kullanıcının vermesi gereken karar |
|---|---|
| **Occupied** *(o saatte dolu)* | *"Saati mi değiştireyim, başka oda mı seçeyim?"* |
| **Permission denied** *(rezervasyon yetkisi yok)* | *"Yetki mi isteyeyim, başka oda mı seçeyim?"* |

⚠️ Bunları aynı gri pasif görünümle bırakmak, kullanıcıyı yanlış eyleme yönlendirir. **Sebep anlaşılmalı.**

### 7.4 Availability — Unknown ≠ Available

| Durum | Anlamı |
|---|---|
| **Available** | Kişi müsait |
| **Busy** | Kişi meşgul |
| **Unknown** | Müsaitlik **bilinmiyor** — harici misafir veya veri alınamadı |

⚠️ **"Bilinmiyor" asla "Müsait" gibi görünmemeli.** Bu, yanlış toplantı saatine yol açan bir hata sınıfıdır.
⚠️ **Yalnızca renge bağımlı olmayın** — renk körlüğü ve mobil için ikinci bir işaret gerekir.

### 7.5 Buton dili

⚠️ Mevcut modülde **dört farklı birincil buton görünümü** var. Yeni tasarımda **tek bir buton durum paleti** gerekir:
`birincil / ikincil / yıkıcı` × `aktif / pasif / yükleniyor`

**Bir yüzeyde aynı anda yalnızca bir birincil aksiyon.**

---

## 8. Form Hierarchy — Blocking vs Non-blocking

Etkinlik formunda aynı anda **iki farklı sınıfta** geri bildirim çıkabilir:

### ⛔ Blocking — çözülmeden devam edilemez
| Koşul |
|---|
| **Oda çakışması** |
| **Eligible approver yok** *(onaylı odada, talep eden dışında onaylayacak kimse yoksa)* |
| Zorunlu alan boş / validasyon hatası |

→ Birincil aksiyon **pasif**, sebebi okunur.

### ⚠️ Non-blocking — bilgilendirir, engellemez
| Koşul |
|---|
| **Katılımcı çakışması** *(zorunlu veya opsiyonel)* |
| **Kapasite aşımı** |
| **Mesai saatleri dışı** |
| **Geçmiş tarih** |

→ Birincil aksiyon **aktif kalır**.

> **Tasarım hedefi:** kullanıcı düşünmeden anlamalı —
> *"Bunu çözmeden devam edemem mi, yoksa yalnızca uyarılıyor muyum?"*

⚠️ Ayrıca **zorunlu katılımcı çakışması** ile **opsiyonel katılımcı çakışması** aynı ağırlıkta gösterilemez.

---

## 9. Quick Create ↔ Detail

**Tek ürün kısıtı:**
> **Quick Create → Detailed Create geçişinde veri ve bağlam kaybolamaz.**

Bunun dışında çözüm **tamamen serbest**: popover · drawer · modal · genişleyen panel · başka bir pattern.

Mevcut sistemde sağdan açılan bir drawer var ve *korunmaya değer bir kalıp* olarak işaretlendi `[KEEP-12]` — ama **bağlayıcı değildir.**

> **Tasarımcıdan beklenen:** variant'larda **farklı çözümler denemek.** Bu, direction'lar arası en ayırt edici karar noktalarından biri.

---

## 10. Room Picker Requirements

Bir oda satırı **aynı anda dört bilgi** taşır:

| # | Bilgi |
|---|---|
| 1 | **Kimlik** — oda adı, lokasyon |
| 2 | **Nitelik** — kapasite, özellikler |
| 3 | **Müsaitlik** — Available / Pending / Reserved |
| 4 | **Seçilemezlik sebebi** *(varsa)* — occupied / permission denied |

**Ek kısıtlar:**
- Liste **etkinliğin zaman aralığına göre** gelir; aralık değişince yeniden değerlendirilir
- **Dolu ve yetkisiz odalar gizlenmez** — görünür, sebebiyle birlikte, seçilemez halde
- Filtreler: kapasite · özellik · bina · kat — ⚠️ **ilgili veri yoksa filtre hiç render edilmez** *(pasif de gösterilmez)*
- Tek oda seçilebilir

> ⚠️ **Room Picker'ı dropdown olarak düşünmeyin.** Dört bilgi bir dropdown satırına sığmaz.
> **Değerlendirilebilecek yaklaşımlar:** liste · aranabilir seçici · bağlamsal panel · form içi genişleyen bölüm.
> **Ayrı bir full Room Finder ürünü kapsam dışıdır** — bu, form içinde çözülecek bir problem.

---

## 11. Responsive Strategy

**Desktop-first.** Masaüstü takvimin ana çalışma yüzeyidir; haftalık ızgara, oda yönetimi, izinler ve onay kuyruğu burada en güçlü halinde olmalı.

**Mobil kapsam dışı değildir.** Şu akışlar mobilde **kullanılabilir olmalı**:
etkinlik görüntüleme · günler arası gezinme · etkinlik oluşturma/düzenleme · oda arama · oda rezervasyonu · rezervasyon durumunu görme

> ⚠️ **Mobil, masaüstü hafta ızgarasının küçültülmüş hali olmak zorunda değildir.**
> **agenda · gün · kompakt liste** gibi mobil-uygun pattern'ler değerlendirilebilir.
> **Ancak ürün davranışı değişmez** — yalnızca sunum değişir.

Mobilde kritik: navigasyon üçlüsü *(Bugün · ileri/geri · aralık etiketi)* her zaman erişilebilir · seçilemezlik sebepleri **hover olmadan** okunur.

---

## 12. Accessibility

Tasarım gereksinimi olarak taşınacaklar:

| # | Gereksinim |
|---|---|
| 1 | **Durum yalnızca renkle anlatılamaz.** Özellikle: rezervasyon durumları · Available/Busy/Unknown · takvim kimliği. İkinci bir işaret *(ikon, desen, metin, kenarlık)* gerekir. |
| 2 | **Disabled sebebi hover'a hapsedilemez.** Klavye ve dokunmatik kullanıcı da erişmeli. |
| 3 | **Mobilde hover bağımlılığı kullanılamaz.** |
| 4 | **Okunabilir kontrast** — özellikle bastırılmış mesai dışı bölge ve pasif kontroller. |
| 5 | **Klavye ve odak hiyerarşisi** — form akışı, kapsam istemi ve onay diyalogları klavyeyle tamamlanabilmeli. |
| 6 | Renk paleti seçiminde renkler **isimleriyle birlikte** erişilebilir olmalı. |

---

## 13. Out of Scope Guardrails

> ⚠️ **Tasarımcıya:** aşağıdakiler görsel olarak cazip görünebilir ama **kapsam dışıdır.** Variant'lara **feature olarak eklenmemelidir.**

| Kapsam dışı | Not |
|---|---|
| **AI scheduling** | Öneriler deterministik; öğrenme yok |
| **Full Scheduling Assistant ekranı** | Müsaitlik **form içinde** çözülür |
| **Room recommendation engine** | Öneri motoru yok |
| **Room maps / kat planı** | Görsel oda seçimi yok |
| **Multiple room booking** | Tek oda seçilir |
| **Drag & drop rescheduling** | İlk kapsam dışı |
| ~~Advanced calendar sharing~~ | ⚠️ **DEĞİŞTİ (D-067):** Sınırlı **Calendar Sharing V1 kapsamdadır** — tek seviye *("etkinlik detaylarını görebilir")*, **salt okunur**, organizasyon içi **tekil kullanıcıya**. **Hâlâ kapsam dışı:** grup paylaşımı · düzenleme/yönetme yetkisi · delegation · harici kullanıcı · çapraz-organizasyon · public link · kademeli görünürlük seviyeleri |
| **Event privacy modes** | Normal/Özel/Gizli yok |
| **Complex approval chains** | Onay tek adımlı, oda-bazlı |
| **Meeting templates** | Yok |
| **Attachment system** | Yok |
| **Online meeting integration** | Yok |
| **Analytics dashboard** | Yok |
| **Etkinlik hatırlatıcısı** | Kapsam dışı |
| **Kullanıcı bazlı timezone** | Tek organizasyon timezone'u |
| **Resmî tatil takvimi** | Yok |
| **Etkinlik başına renk seçimi** | Renk yalnızca takvimden |
| **Undo** | Yok |

**Kapsam referansı:** `04-scope-closure.md`

---

## 14. Design Questions

FAZ 5'te çıkan 27 soru birleştirildi ve önceliklendirildi.

### 🔴 Yüksek öncelik — direction'ları ayıran kararlar

| # | Soru |
|---|---|
| **Q1** | **Quick Create hangi yüzeyde?** *(popover · inline · küçük panel)* |
| **Q2** | **Detailed Create hangi yüzeyde?** *(drawer · modal · tam sayfa · genişleyen panel)* — tek kısıt: bağlam kaybı olmamalı |
| **Q3** | **Room Picker hangi yaklaşımla?** *(liste · aranabilir seçici · bağlamsal panel)* — dört bilgi taşımalı |
| **Q4** | **Suggested Times formda nasıl belirir?** *(inline liste · açılır panel · katılımcı alanının uzantısı)* |
| **Q5** | **Pending event chip nasıl ayrılır?** Takvim renginden bağımsız eksende |
| **Q6** | **Blocking ↔ non-blocking görsel hiyerarşisi** nasıl kurulur? |
| **Q7** | **Approval Queue IA'da nerede yaşar?** *(Odalar altında · ayrı yüzey · bildirim merkezinden)* |
| **Q8** | **Mobilde hafta ızgarası yerine hangi pattern?** *(agenda · gün · kompakt liste)* |
| **Q9** | **Permissions yüzeyi nasıl kurgulanır?** *"Kim neyi görüyor?"* tek ekranda cevaplanabilir mi? |

### 🟡 Orta öncelik — bileşen ve ayrım kararları

| # | Soru |
|---|---|
| **Q10** | **İki "seçilemez" sebebi** *(occupied / permission denied)* nasıl ayrışır? |
| **Q11** | **"Bilinmiyor" ≠ "Müsait"** — renk dışı hangi işaret? |
| **Q12** | **Renk paleti:** takvim renkleri + rezervasyon durumları çakışmadan nasıl kurulur? |
| **Q13** | Oda listesinde **üç durum işareti** *(pasif · kısıtlı · onaylı)* nasıl karışmaz? |
| **Q14** | **Sapmış occurrence** takvimde nasıl işaretlenir? |
| **Q15** | **Seri kapsam istemi** *(üç yerde çıkıyor)* tek paylaşılan bileşen olarak nasıl tasarlanır? |
| **Q16** | **Beş bölümlü oda formu** nasıl yönetilebilir uzunlukta kalır? |
| **Q17** | **İki erişim kuralı** *(Görebilir / Rezerve edebilir)* yan yana nasıl karıştırılmadan okunur? |
| **Q18** | **Arama nerede yaşar?** Sonuç listesi nasıl sunulur? |
| **Q19** | **Odalara Göre görünümü** masaüstü ve mobilde nasıl kurgulanır? |

### 🟢 Düşük öncelik — kenar durumlar ve detaylar

| # | Soru |
|---|---|
| **Q20** | **Tekrar önizleme satırı** formda nerede durur? |
| **Q21** | **Seri oda özeti** *("18'den 15'i müsait")* nasıl gösterilir? |
| **Q22** | **Progressive disclosure geçişi** *(bina tanımlanınca bölüm belirmesi)* nasıl şaşırtmaz? |
| **Q23** | **İnline özet** *(oda formunda kaydetmeden önce)* nerede durur? |
| **Q24** | Boş kuyrukta *"hiç talep yok"* ile *"hiçbir odanın onaylayıcısı değilim"* nasıl ayrışır? |
| **Q25** | **Self-approval** durumunda kuyruk satırı nasıl görünür? |
| **Q26** | **Red gerekçesi** nasıl teşvik edilir *(zorunlu değil ama atlanması bilinçli olmalı)*? |
| **Q27** | **"Nasıl Kullanılır?"** statik panelinin yerine ne gelir? |

---

## 15. Variant Strategy — dört tasarım yönü

> ⚠️ Bu turda **hiçbiri tasarlanmayacak.** Yalnızca yön tanımıdır.
> Dördü de **aynı ürün davranışını** uygular — fark **yoğunluk, hiyerarşi ve görsel dildedir**, kapsamda değil.

### Direction A — Enterprise Calendar
**Karakter:** Yüksek bilgi yoğunluğu, güçlü toolbar, her şey görünür kontrolde. Outlook / Google Workspace yoğunluğu.
**Güçlü yönü:** Güç kullanıcısı için hız; keşfedilebilirlik yüksek — özellik aramak gerekmiyor.
**Zayıf yönü:** Yeni kullanıcıya kalabalık gelebilir; mobile taşınması en zor olan.
**Kime uygun:** Takvimi günde defalarca açan kurumsal kullanıcı.

### Direction B — Modern Minimal SaaS
**Karakter:** Sakin, temiz, progressive disclosure ağırlıklı. Karmaşıklık gerektiğinde ortaya çıkar. Notion / Linear hissi.
**Güçlü yönü:** Bilişsel yük düşük; scheduling karmaşıklığı korkutucu görünmüyor *(Design Goal 4)*.
**Zayıf yönü:** Keşfedilebilirlik riski — özellikler gizlendiği için bulunamayabilir.
**Kime uygun:** Takvimi haftada birkaç kez açan, sadelik bekleyen kullanıcı.

### Direction C — Narbulut SaaS
**Karakter:** Narbulut'un kendi marka kimliğini taşıyan dengeli B2B yaklaşım. Platform kabuğuyla (üst bar, dark mode, bildirimler) en doğal bütünleşen.
**Güçlü yönü:** Ürün ailesiyle tutarlılık; kullanıcı başka bir ürüne geçmiş hissetmez.
**Zayıf yönü:** Mevcut platformun görsel sınırlarını miras alma riski — "greenfield" avantajını kaybedebilir.
**Kime uygun:** Narbulut'un diğer modüllerini zaten kullanan kullanıcı.

### Direction D — Room & Operations Focused
**Karakter:** Oda müsaitliği ve rezervasyon durumları takvimin **merkezi** unsuru. "Odalara Göre" görünümü birinci sınıf; durum göstergeleri baskın.
**Güçlü yönü:** Audit'in 2 numaralı problemini *(oda sisteminde "dolu" kavramı yok)* en güçlü çözen yön. Approver ve admin için en verimli.
**Zayıf yönü:** Oda kullanmayan kullanıcı için gereksiz ağır; takvim ikinci plana düşebilir.
**Kime uygun:** Ofis operasyonu yoğun kurumlar; oda rezervasyonu birincil iş olan ekipler.

---

## Faz kapısı

**Bu belgede yer almayan şeyler:**
❌ Tasarım variant'ı · ❌ UI · ❌ Renk/tipografi seçimi · ❌ Component kodu · ❌ Claude Design prompt'u · ❌ Yeni ürün kararı

**Durum:** ✅ FAZ 6A FINAL. Exploration prompt: `22-design-exploration-prompt.md`.
