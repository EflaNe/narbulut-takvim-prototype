# Narbulut Takvim — Scope Closure

**Tarih:** 2026-08-28 · **rev.2:** 2026-08-31 — **Calendar Sharing V1 kapsama eklendi** (D-067)
**Durum:** Güncel kapsam referansı
**Bu belge implementation veya spec DEĞİLDİR.**
Tek işlevi şu sorunun **tek referansı** olmaktır: *Narbulut Takvim redesign kapsamında ne var, ne yok?*

**Kaynaklar:** `00-current-state-audit.md` rev.3 · `01-competitor-capability-map.md` v2 · `02-problem-clusters.md` v2 · `03-solution-options.md` · `DECISIONS.md` D-025…D-051

---

## 0. Kapsam özeti

| | |
|---|---|
| **Çalışma sınırı** | Tek organizasyon (D-025, provisional) · tek timezone (D-046) |
| **Platform** | Responsive, desktop-first; mobilde 6 temel akış (D-047) |
| **Backend** | Bu çalışmada geliştirilmiyor. Frontend state, mock data ve beklenen davranış tanımlanır. |
| **Cluster sayısı** | 15 · 14'ü ürün kapsamında · 1'i (PC-15) Design Brief Input |

---

## 1. Cluster kapanışları

### PC-01 · Takvim Kabuğu ve Yön Bulma
**Final scope:** Kabuğun temel navigasyon ve yön bulma kontrolleri kurulur; mesai saatleri veri olarak tanımlanır ve kabukta kullanılır.
**In scope:** Bugüne dönüş · görünen aralık etiketi · ana alanda ileri/geri · görünüm modları (Günlük · Haftalık · Aylık · **Odalara Göre**) · sol rail (tarih navigatörü + filtreler + odalar + takvimler) · **organizasyon mesai saatlerine otomatik scroll** ve mesai dışının görsel bastırılması · hafta başlangıcının Pazartesi'ye alınması · bugün göstergesinin güçlendirilmesi · mini takvimde etkinlik yoğunluğu · tek timezone gösterimi · responsive desktop-first (mobilde agenda/day/list alternatifi serbest).
**Out of scope:** Kullanıcı bazlı timezone (D-046) · resmî tatil takvimi (D-045) · ICS içe/dışa aktarma ve harici takvim aboneliği *(U-09 — audit karşılığı yok, D-013)*.
**Bağımlı kararlar:** D-045, D-046, D-047, KEEP-02, KEEP-03
**FAZ 4 spec:** Calendar Shell *(mesai saatleri veri modeli burada tanımlanır, Scheduling referans verir)*

---

### PC-02 · Etkinlik Gösterimi ve Izgara Yoğunluğu
**Final scope:** Etkinlik chip'i anlamlı bilgi taşır; çakışma, tekrar ve rezervasyon durumu ızgarada okunabilir.
**In scope:** Chip'te başlık + saat + oda göstergesi · **çok günlü / tüm gün etkinlik gösterimi** *(D-033 ile bitiş tarihi geldiği için mümkün)* · çakışan etkinliklerin yan yana gösterimi · şimdi çizgisi · hafta sonu ve mesai dışı görsel ayrımı · **rezervasyon durumu göstergesi: Müsait · Onay bekliyor · Rezerve** (D-036) · tekrarlayan etkinlik göstergesi (D-043) · ⭐ **hover önizleme kartı** *(U-05 — 1 Eylül 2026'da kapsama alındı; `14` BR-SHELL-41…45, SR-SHELL-07)*.
**Out of scope:** Sürükle-bırak ve yeniden boyutlandırma *(karar alınmadı — bkz. Bölüm 4)*.

> ⚠️ **Kapsam değişikliği — 1 Eylül 2026.** Hover önizleme detay kartı bu belgede başlangıçta
> kapsam dışıydı *("spec seviyesinde önerilecek")*. Ürün sahibi FAZ 7 prototipini gördükten sonra
> kapsama almaya karar verdi. Kart yeni bir domain state üretmez, yeni yetki modeli getirmez ve
> bilgiyi hover'a hapsetmez (`14` BR-SHELL-42, `11` ST-DIS-03) — bu nedenle bağımlı kararlar
> değişmedi.
**Bağımlı kararlar:** D-033, D-036, D-043, D-045
**FAZ 4 spec:** Calendar Shell

---

### PC-03 · Taksonomi, Takvimler ve Renk
**Final scope:** Renk kaynağı tekilleşir. Takvim, basit bir etkinlik gruplama mekanizmasıdır.
**In scope:** **Takvim = isim + renk + sahip taşıyan etkinlik gruplama kaynağı** (D-049, **D-064**) · **varsayılan takvim ve zorunlu atama** (**D-065**) · etkinliğin bir takvime atanması · **renk kaynağının takvim olması** · takvim bazlı filtreleme · filtre lejantı ile ızgara renklerinin eşleşmesi · ⭐ **Calendar Sharing V1** — tek seviyeli *("etkinlik detaylarını görebilir")*, salt okunur, organizasyon içi **tekil kullanıcıya**, sahip istediğinde kaldırır, alıcıda **"Benimle paylaşılanlar"** (**D-067**) · sahibi organizasyondan ayrılan takvimin arşivlenmesi (**D-066**).
**Out of scope:** **"Toplantı"/"Etkinlik" tip ayrımı — kaldırıldı** (D-037) · kullanıcı tanımlı kategori/etiket sistemi *(D-037)* · ⚠️ **paylaşımda kapsam dışı olanlar** (D-067): **grup paylaşımı** · düzenleme/yönetme yetkisi · delegation · harici kullanıcı · çapraz-organizasyon · public link · free/busy için ayrı **sharing tier / subscription / overlay permission** · **event-level privacy** (D-041, D-068) · yeni admin calendar-management yüzeyi (D-066) · **etkinlik başına serbest renk geçersiz kılma** *(spec seviyesinde önerilen davranış: kaldırılır — üç çakışan renk kaynağı sorununun `UX-20` kökü budur)*.
**Bağımlı kararlar:** D-037, D-049
**FAZ 4 spec:** Calendar Shell

---

### PC-04 · Etkinlik Oluşturma ve Düzenleme
**Final scope:** A + B seviyesi. Form doğru sıralanır, iki katmanlı oluşturma gelir, katılımcı modeli sadeleşir.
**In scope:** **Düzenlenebilir tarih ve bitiş tarihi** (`UX-23`, `UX-24`) · görsel hiyerarşinin düzeltilmesi (Konu birincil, renk ikincil) · tek birincil aksiyon · yazılabilir saat alanları · zorunlu alan işareti ve alan altı hata satırı · **Quick Create** (başlık · tarih/saat · Oluştur) → **"Daha fazla seçenek"** → detaylı form (D-038) · **tek "Konum" mantığı** — oda seçiliyse odadan türer (D-033) · **zorunlu/opsiyonel katılımcı ayrımı** (D-040) · iç/harici katılımcı ayrımının iş modelinde korunması · üç katmanlı katılımcı tekrarının kaldırılması · **etkinlik detay / düzenleme / silme akışı** · düzenleme yetkisi: organizatör + organizasyon yöneticisi (D-039).
**Out of scope:** Şablon/kopyalama · ek dosya · online toplantı bağlantısı *(U-17/18/19 — audit karşılığı yok, D-013)* · etkinlik hatırlatıcısı *(C-5 — PC-04 C dışarıda kaldığı için; iç kaynaklı aday olduğundan ileride yeniden değerlendirilebilir)* · katılımcılara düzenleme hakkı (D-039).
**Bağımlı kararlar:** D-033, D-037, D-038, D-039, D-040
**FAZ 4 spec:** Event

---

### PC-05 · Tekrar ve Seri Yönetimi
**Final scope:** Temel recurrence.
**In scope:** **Günlük · haftalık · aylık** tekrar · bitiş koşulu: **bitiş tarihi / tekrar sayısı / süresiz** · seri düzenleme: **yalnızca bu etkinlik · bu ve sonraki etkinlikler · tüm seri** · seri düzenleme sözlüğünün önceden sabitlenmesi *(benchmark uyarısı: Google kendi platformlar arası etiket tutarsızlığını kabul ediyor `[O]`)*.
**Out of scope:** "Ayın ikinci Salısı" tipi gelişmiş kurallar · karmaşık istisna kuralları · seri içi tek örneğin serbestçe taşınması.
**Spec içinde çözülecek:** Seri boyunca oda çakışmasının nasıl hesaplanacağı · seri rezervasyon onayının seri bazında mı örnek bazında mı işleyeceği · seri değişikliğinde bildirim davranışı. *(D-043: "gereksiz enterprise karmaşıklığına çıkarma")*
**Bağımlı kararlar:** D-043, D-034, D-036
**FAZ 4 spec:** Event

---

### PC-06 · Çalışma Zamanı Kuralları 🔷
**Final scope:** B — görsel ve navigasyon. Mesai saatleri organizasyon seviyesinde veri olarak var; kısıtlayıcı değil.
**In scope:** Organizasyon mesai saatleri tanımı · takvimin mesai saatlerine scroll etmesi · mesai dışının görsel olarak geri plana atılması · mesai saatlerinin scheduling'e girdi olması (D-050 ile birlikte).
**Out of scope:** ⚠️ **Mesai dışında etkinlik/oda rezervasyonu oluşturmanın engellenmesi** (D-045) · resmî tatil takvimi (C-6) · oda seviyesinde mesai penceresi kuralı (D-035c).
**Mümkün kıldığı:** PC-01 (görsel bastırma) · PC-07 (müsaitlik hesabı girdisi)
**Bağımlı kararlar:** D-045, D-035(c)
**FAZ 4 spec:** Calendar Shell *(veri modeli)*, Scheduling *(tüketici)*

---

### PC-07 · Katılımcılar ve Scheduling
**Final scope:** **Balanced scheduling** (D-050). Ayrı bir Scheduling Assistant ekranı zorunlu değil; öncelik etkinlik oluşturma deneyiminin içinde doğru zamanı bulmak.
**In scope:** **Organizasyon içinde varsayılan free/busy** — yalnızca müsait/meşgul (D-027) · **event formunda katılımcı müsaitliği** · **zorunlu/opsiyonel ayrımının hesaba katılması** (D-040) · **çakışmaların görünür gösterilmesi** · **Suggested Times / uygun zaman önerileri** · mesai saatlerinin öneri girdisi olması (D-045).
**Out of scope:** Tam ölçekli ayrı **Scheduling Assistant** ekranı/subsystem'i *(ileride eklenebilir)* · kademeli takvim paylaşımı (free/busy ötesi görünürlük seviyeleri) (D-027) · RSVP'nin ötesinde katılımcı yönetimi *(RSVP kapsamı Notifications ile birlikte spec'te netleşir)*.
**Bağımlı kararlar:** D-027, D-040, D-045, D-050 · **ön koşul: PC-11 (D-027)**
**FAZ 4 spec:** Scheduling

---

### PC-08 · Oda Veri Modeli ve Yönetimi 🔷
**Final scope:** B + C'den ince bir dilim (onay bayrağı + onaylayıcı).
**In scope:** Oda kimliği (ad · açıklama · **durum: aktif/pasif**) · **kapasite** (D-048) · **oda özellikleri/donanım — sınırlı, yönetilebilir set** (D-048; ör. projeksiyon/ekran, video konferans, beyaz tahta, erişilebilirlik) · **Bina + Kat, opsiyonel** (D-028) + progressive disclosure · **oda × zaman müsaitlik sorgusu** · **oda oluşturma/düzenleme tek ekran, bölümlü form** (D-032) · oda listesinde satır aksiyonları ve arama · **"Rezervasyon onayı gerekli" bayrağı + onaylayıcı kullanıcı/grup** (D-034, D-042) · varsayılan erişim: herkese açık (D-030).
**Out of scope:** Serbest çoklu etiket / genişletilmiş taxonomy (D-028, D-048) · oda fotoğrafı · **maksimum süre · önden rezervasyon penceresi · oda mesai penceresi** (D-035c) · analytics/doluluk metadata'sı · oda durumunun "bakımda" gibi genişletilmiş halleri *(spec'te önerilebilir)*.
**Mümkün kıldığı:** PC-09 B · PC-10 · PC-14 (oda araması)
**Bağımlı kararlar:** D-028, D-030, D-032, D-034, D-035(c), D-042, D-048
**FAZ 4 spec:** Rooms

---

### PC-09 · Oda Keşfi ve Rezervasyonu
**Final scope:** B — müsaitlik-farkında oda seçici.
**In scope:** **"Oda Seç" checkbox'ının kalkması**, doğrudan oda seçici · oda listesinin **seçili zaman aralığına göre** gelmesi · **dolu odaların "Dolu" olarak görünmesi ve seçilememesi** (D-031) · **rezerve yetkisi olmayan odanın görünür ama seçilemez olması** (D-026) · **kapasite / kat / özellik filtreleri** — veri tanımlıysa (D-028, D-048) · katılımcı sayısı ile kapasite karşılaştırması · **çakışma kontrolü** (`FN-03`) · "Odalara Göre" görünümünde dolu slot renklendirmesi · **oda durumlarının ayrıştırılması: Müsait · Onay bekliyor · Rezerve** (D-036).
**Out of scope:** **Sonraki müsait zamanın gösterilmesi** (D-031) · **oda öneri motoru** *(cold-start riski: Robin'in 60 günlük geçmişi ve Google'ın konum verisi Narbulut'ta yok)* · ayrı Room Finder paneli · birden fazla oda seçimi · kat planı / harita üzerinden seçim.
**Bağımlı kararlar:** D-026, D-028, D-031, D-036, D-048 · **ön koşul: PC-08**
**FAZ 4 spec:** Room Booking

---

### PC-10 · Rezervasyon Kuralları ve Onay
**Final scope:** Basit, oda-bazlı onay. *(CONDITIONAL gate D-034 ile açıldı ve sınırı çizildi.)*
**In scope:** Odada **"Rezervasyon onayı gerekli"** anahtarı · **onaylayıcı kullanıcı/grup — oda seviyesinde** (D-042) · akış: **Talep → Beklemede → Onaylandı / Reddedildi** · bekleyen talebin zaman aralığını **geçici olarak tutması** (D-036) · onay kuyruğu yüzeyi · red gerekçesi · dört durum değişiminin bildirim üretmesi (D-044) · onay açıkken *Rezerve edebilir* yetkisinin fiilen "talep gönderebilir"e dönmesi (D-035a).
**Out of scope:** ⚠️ Haftanın gününe göre kural · kullanıcı tipine göre policy · maksimum süreye göre approval · **approval chain** · **çok aşamalı onay** (D-034) · merkezi/sistem geneli approver rolü (D-042) · check-in / no-show / auto-release *(T-12 — audit karşılığı yok)*.
**Spec içinde çözülecek:** Bekleyen talep için expiration/auto-cancel önerisi (D-036) · etkinlik silindiğinde rezervasyona ne olacağı (D-039).
**Bağımlı kararlar:** D-034, D-035, D-036, D-042, D-044
**FAZ 4 spec:** Reservation Approval

---

### PC-11 · İzin ve Erişim Modeli 🔷
**Final scope:** B — tipli oda erişimi + free/busy. C (rol × yetki matrisi) açılmadı.
**In scope:** **Oda erişiminin iki tipe ayrılması: Görebilir / Rezerve edebilir** (D-026) · rezerve edilemeyen odanın görünür kalması · **oda erişiminin sihirbaz dışından yönetilebilmesi** · İzinler yüzeyinin pasif olmaktan çıkması (`IA-01`) · **organizasyon içi varsayılan free/busy** (D-027) · migration: mevcut erişimler → her iki yetki (D-026) · grup bazlı yetkilendirmenin korunması (`KEEP-11`).
**Out of scope:** **Rol × yetki matrisi** (C-1) · **"Onaylayabilir" genel permission tipi** (D-042) · kapsamlı admin rolleri ("sadece 3. kattaki odaların yöneticisi") · **delegasyon** · **event-level privacy — Normal/Özel/Gizli** (D-041) · kademeli takvim paylaşımı (D-027) · çapraz-organizasyon görünürlük (D-025).
**Mümkün kıldığı:** PC-07 (free/busy) · PC-09 B · PC-10 (oda seviyesinde onaylayıcı)
**Bağımlı kararlar:** D-025, D-026, D-027, D-041, D-042
**FAZ 4 spec:** Permissions *(foundation — önce yazılmalı)*

---

### PC-12 · Sistem Durumları ve Geri Bildirim 🟨
**Final scope:** Modül genelinde tek bir durum ve geri bildirim sözleşmesi.
**In scope:** **Sessiz hatanın sonlandırılması** (`FB-01`) · **erken başarı mesajının düzeltilmesi** (`UX-50`) · gözden geçirme özetinin erişim bilgisini göstermesi (`UX-51`) · yükleme / boş / hata / başarı durumlarının tanımlanması · **tek birincil buton dili ve pasif/aktif ayrımı** (`UX-26`, `UX-39`) · zorunlu alan işareti ve alan altı hata satırı (`FN-06`) · boş "Takvimlerim" durumu (`UX-16`) · boş oda listesi durumu ve CTA (`UX-45`) · rezervasyon ve etkinlik durum makinelerinin görsel olarak okunabilir olması.
**Out of scope:** Geri alma / undo *(U-32 — karar alınmadı; ilk kapsam dışı önerilir)* · **backend'deki HTTP 500 hatasının düzeltilmesi** *(A-10 açık; bu çalışmada backend geliştirilmiyor — frontend tarafında hatanın görünür kılınması kapsamdadır)*.
**Spec içinde önerilecek davranış:** Geçmiş tarihe etkinlik oluşturma (`FN-02`) — D-045'in "engelleme, uyar" felsefesiyle tutarlı olarak **uyarı ver, engelleme** önerilir.
**Bağımlı kararlar:** D-029 *(mini-spec yaklaşımı)*, D-036, D-045
**FAZ 4 spec:** System States *(foundation — paylaşılan sözleşme, diğer spec'ler referans verir)*

---

### PC-13 · Bildirim ve E-posta 🟨
**Final scope:** İki kanal onaylandı; olay–kanal dağılımı FAZ 8'de.
**In scope:** **E-posta + uygulama içi bildirim** (D-044) · **misafir kullanıcılar için e-posta temel kanal** · olay sınıfları: davet · güncelleme · iptal · RSVP · **rezervasyon talebi / onay / red / iptal** · gürültü kontrolü ilkesi *(benchmark: Outlook'un "sadece değişen katılımcılara gönder" ve Skedda'nın kapatılabilir mekân bildirimi `[O]`)*.
**Out of scope:** Etkinlik hatırlatıcısı *(C-5 — PC-04 C dışarıda; iç kaynaklı aday olduğu için yeniden değerlendirilebilir)* · her olayın her iki kanaldan gitmesi (D-044).
**FAZ 8'e devredilen:** **Calendar Email & Notification Matrix** — hangi olay hangi kanaldan, kime.
**Bağımlı kararlar:** D-034, D-036, D-039, D-040, D-043, D-044
**FAZ 4 spec:** Notifications *(matris FAZ 8)*

---

### PC-14 · Arama ve Bulunabilirlik 🟨
**Final scope:** İki hedefli arama: etkinlik ve oda.
**In scope:** Takvimde **etkinlik araması** (`UX-17`) · **oda listesinde arama** (`UX-43`) · oda aramasının PC-08 alanları üzerinde çalışması (ad, lokasyon, özellik).
**Out of scope:** Platform geneli global arama · gelişmiş arama operatörleri / kayıtlı aramalar · katılımcı/kişi araması *(spec'te değerlendirilebilir)*.
**Bağımlı kararlar:** D-028, D-048 · **ön koşul: PC-08**
**FAZ 4 spec:** Calendar Shell *(etkinlik araması)* + Rooms *(oda araması)*

---

### PC-15 · Tasarım Dili ve Yatay Tutarlılık 🟪
**Final scope:** ⚠️ **Ürün feature'ı değildir.** FAZ 2B'de kapsam seviyesi üretilmedi (D-018).
**Statü:** **FAZ 6 — Design Brief Input.** İçerik: modül içi yoğunluk tutarsızlığı (`GN-02`) · dark mode davranışı (`GN-03`) · responsive davranış (`GN-04`, D-047) · footer telif yılı (`GN-01`) · platform kabuğuyla bütünlük (`KEEP-09`).
**FAZ 4 spec:** Yok — doğrudan FAZ 6'ya girdi.

---

## 2. In-scope ana capability listesi

**Takvim kabuğu:** bugüne dönüş · aralık etiketi · ileri/geri navigasyon · 4 görünüm modu (Odalara Göre dahil) · mesai saatlerine scroll ve mesai dışı bastırma · Pazartesi başlangıç · etkinlik araması · sol rail filtreleme · responsive desktop-first

**Etkinlik:** Quick Create + detaylı form · düzenlenebilir tarih ve bitiş tarihi · çok günlü etkinlik · tek konum mantığı · zorunlu/opsiyonel katılımcı · iç/harici katılımcı · detay/düzenleme/silme · organizatör + organizasyon yöneticisi yetkisi · temel recurrence + üçlü seri düzenleme

**Takvimler ve renk:** takvim = isim + renk + **sahip** · **varsayılan takvim (silinemez)** · zorunlu takvim ataması · tek renk kaynağı · takvim bazlı filtreleme · **Calendar Sharing V1** *(tek seviye, salt okunur, tekil kullanıcı)* · **"Benimle paylaşılanlar"** bölümü

**Scheduling:** organizasyon içi free/busy · formda katılımcı müsaitliği · çakışma gösterimi · Suggested Times

**Odalar:** kapasite · sınırlı özellik seti · opsiyonel Bina+Kat · aktif/pasif durum · tek ekran oluşturma/düzenleme · liste aksiyonları ve arama · onay bayrağı + onaylayıcı

**Oda rezervasyonu:** müsaitlik-farkında seçici · dolu ve yetkisiz odaların görünür-seçilemez gösterimi · kapasite/kat/özellik filtreleri · çakışma kontrolü · Müsait/Onay bekliyor/Rezerve durumları

**Onay:** oda bazlı onay anahtarı · oda seviyesinde onaylayıcı · Talep→Beklemede→Onaylandı/Reddedildi · onay kuyruğu · red gerekçesi

**İzinler:** Görebilir/Rezerve edebilir ayrımı · merkezî izin yüzeyi · grup bazlı yetkilendirme · free/busy görünürlüğü

**Sistem durumları:** hata görünürlüğü · yükleme/boş/hata/başarı · tek birincil buton dili · validasyon işaretleri

**Bildirim:** e-posta + uygulama içi · misafir için e-posta

---

## 3. Explicitly out of scope

| Alan | Kapsam dışı |
|---|---|
| **Organizasyon** | Bayi için bağımsız takvim · çapraz-organizasyon görünürlük *(D-025, provisional)* |
| **Zaman** | Kullanıcı bazlı timezone · resmî tatil takvimi · mesai dışı rezervasyon yasağı |
| **Etkinlik** | Şablon/kopyalama · ek dosya · online toplantı bağlantısı · etkinlik hatırlatıcısı · "Toplantı/Etkinlik" tip ayrımı · etkinlik başına serbest renk · event-level privacy (Normal/Özel/Gizli) |
| **Tekrar** | "Ayın ikinci Salısı" tipi gelişmiş kurallar · karmaşık istisna kuralları |
| **Scheduling** | Ayrı Scheduling Assistant ekranı · kademeli takvim paylaşımı |
| **Odalar** | Serbest çoklu etiket sistemi · oda fotoğrafı · maksimum süre · önden rezervasyon penceresi · oda mesai penceresi · analytics/doluluk metadata |
| **Oda keşfi** | Oda öneri motoru · ayrı Room Finder paneli · birden fazla oda seçimi · kat planı/harita seçimi · sonraki müsait zaman gösterimi |
| **Onay** | Approval chain · çok aşamalı onay · gün/kullanıcı-tipi/süre bazlı kural motoru · merkezi approver rolü · check-in / no-show / auto-release |
| **İzinler** | Rol × yetki matrisi · kapsamlı admin rolleri · delegasyon · "Onaylayabilir" genel permission tipi · **kademeli takvim paylaşımı** *(tek seviye var — D-067)* · **grup paylaşımı** |
| **Genel** | ICS içe/dışa aktarma · harici takvim aboneliği · global platform araması · undo · native mobil uygulama · mobile-first ürün · backend geliştirmesi (HTTP 500 düzeltmesi dahil) |

---

## 4. Kapatılamayan kalıntılar

> Karar alınmadı; **yeni product decision üretmedim**. Aşağıdakiler spec içinde *önerilen davranış* olarak ele alınacak veya açık kalacak.

| Konu | Durum | Önerilen davranış |
|---|---|---|
| **Sürükle-bırak / yeniden boyutlandırma** (`U-04`) | Karar alınmadı | **İlk kapsam dışı.** Gerekçe: oda rezervasyonu içeren bir etkinlikte taşıma, çakışma ve onay durumunun yeniden hesaplanmasını gerektirir (D-034, D-036) — bedelsiz değil. İtiraz edilirse ayrı karar açılmalı. |
| **Geçmiş tarihe etkinlik** (`FN-02`) | Karar alınmadı | **Uyar, engelleme** — D-045'in mesai dışı için aldığı tutumla tutarlı. |
| **Etkinlik hatırlatıcısı** (`C-5`) | PC-04 C dışarıda kaldığı için türetilerek dışarıda | İç kaynaklı aday olduğu için **FAZ 8'de yeniden değerlendirilebilir**. |
| **Undo** (`U-32`) | Karar alınmadı | İlk kapsam dışı. |
| **A-08** — "Odalara Göre" bugün kullanılıyor mu? | Açık, blocker değil | `KEEP-02` gereği korunuyor; doğrulama fırsat oldukça. |
| **A-10** — HTTP 500 bu çalışmanın kapsamında mı? | Açık | Backend geliştirilmediği için **frontend'de hatanın görünür kılınması** kapsamda; düzeltme değil. |
| **P-015** — Bayilerin bağımsız takvim/oda kullanımı var mı? | Açık | D-025 provisional kalmaya devam ediyor. |

**Çelişki taraması:** D-025…D-051 arasında **gerçek bir çelişki bulunmadı.** Türetilmiş gerilimlerin üçü (D-035a/b/c) zaten açıkça kayda geçirilmiş ve D-042 ile kapatılmış durumda.

---

## 5. Faz kapısı

**Bu belgede yer almayan şeyler:**
❌ Product Spec · ❌ Modül spec'leri · ❌ UX flow · ❌ Ekran tanımı · ❌ Component yapısı · ❌ Tasarım · ❌ Kod · ❌ Yeni ürün kararı

**Durum:** FAZ 3 kapandı (D-051). FAZ 2B scope closure tamamlandı. **FAZ 4 spec dosya/modül yapısı onayı bekleniyor.**
