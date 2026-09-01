# 11 — System States Spec

**Cluster:** PC-12 · **Katman:** Foundation · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-029, D-036, D-045 · **Scope referansı:** `04-scope-closure.md` §PC-12

---

## 1. Purpose

Takvim modülünün **tüm ekranlarında geçerli olan tek durum ve geri bildirim sözleşmesi**. Diğer spec'ler kendi durum kurallarını tanımlamaz; buraya referans verir ve yalnızca modüle özgü sapmaları yazar.

Bu spec, audit'in **1 numaralı bulgusuna** doğrudan cevaptır: *modülde durum iletişimi güvenilmez* — bir yerde hata sessizce yutuluyor (`FB-01`), başka bir yerde işlem bitmeden başarı ilan ediliyor (`UX-50`).

---

## 2. Scope

### In Scope
- Sekiz durum sınıfının davranış sözleşmesi: **default · loading · empty · success · error · pending · disabled · destructive**
- Validasyon zamanlaması ve mesaj yerleşimi kuralları
- Birincil/ikincil aksiyon dili ve buton durum dili
- Sessiz hata yasağı ve erken başarı yasağı
- Boş sonuç ile yüklenememiş sonucun ayrıştırılması

### Out of Scope
- Geri alma / undo *(karar alınmadı; ilk kapsam dışı)*
- Backend'deki HTTP 500 hatasının düzeltilmesi *(A-10; bu çalışmada backend geliştirilmiyor — hatanın **görünür kılınması** kapsamdadır)*
- Görsel tasarım: renk, tipografi, ikon, spacing → **FAZ 6**
- Metinlerin nihai kopyası → FAZ 6 ile birlikte netleşir; burada yalnızca **mesajın taşıması gereken bilgi** tanımlanır

---

## 3. Actors

Tüm aktörler için geçerlidir. Aktöre göre farklılaşan tek nokta: **disabled sebebi**, o aktörün anlayabileceği dille yazılmalıdır (bkz. ST-DIS-02).

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Durum sınıfı** | Bir yüzeyin veya kontrolün içinde bulunabileceği sekiz sınıftan biri. |
| **Birincil aksiyon** | Bir yüzeyde kullanıcının yapması beklenen tek ana eylem. |
| **Alan hatası** | Tek bir girdiye bağlı, o girdinin altında gösterilen hata. |
| **Yüzey hatası** | Tüm işlemi engelleyen, formun/ekranın üstünde gösterilen hata. |
| **Geçici bildirim (toast)** | İşlem sonucunu bildiren, kaybolan mesaj. |
| **Kalıcı durum** | Yüzeyin kendisinde okunan, kaybolmayan durum (ör. "Onay bekliyor" rozeti). |

---

## 5. Business Rules

### 5.1 Temel yasaklar

| ID | Kural |
|---|---|
| **ST-CORE-01** | **Sessiz hata yasağı.** Kullanıcının başlattığı hiçbir işlem, sonucu kullanıcıya bildirilmeden sonlanamaz. Başarısız bir istek **her zaman** kullanıcıya görünür bir hata üretir. *(`FB-01` — audit'te HTTP 500 dönen istek forma hiçbir şey göstermiyordu.)* |
| **ST-CORE-02** | **Erken başarı yasağı.** Bir işlem tamamlanmadan başarı dili kullanılamaz. "Oluşturuldu", "Kaydedildi", "Tebrikler" gibi ifadeler yalnızca işlem **gerçekten tamamlandıktan sonra** görünür. *(`UX-50` — oda sihirbazı, "Oluştur" butonu hâlâ basılmamışken "Tebrikler, yeni odanız oluşturuldu!" diyordu.)* |
| **ST-CORE-03** | **Sebepsiz pasif kontrol yasağı.** Devre dışı bırakılmış her kontrol, neden devre dışı olduğunu okunabilir biçimde taşımalıdır. |
| **ST-CORE-04** | **Tek birincil aksiyon.** Bir yüzeyde aynı anda yalnızca bir kontrol birincil aksiyon dilini kullanır. *(`UX-26` — etkinlik formunda üç koyu buton birincil görünüyordu.)* |
| **ST-CORE-05** | **Tek buton durum dili.** Aktif ve pasif buton görünümü modülün tamamında aynıdır. *(`UX-39` — sihirbaz adım 1 gri-pasif, adım 2 mavi, adım 3 yeşil, etkinlik drawer'ı koyu gri: dört farklı dil.)* |
| **ST-CORE-06** | **Boş ≠ yüklenemedi.** Veri olmaması ile veri gelmemesi görsel olarak ayırt edilebilir olmalıdır. *(`FB-04` — boş hafta ile yüklenememiş hafta aynı görünüyordu.)* |

### 5.2 Loading

| ID | Kural |
|---|---|
| **ST-LOAD-01** | Yükleme durumu, gelecek içeriğin **yapısını koruyan** bir yer tutucu ile gösterilir; içerik geldiğinde düzen zıplamaz. |
| **ST-LOAD-02** | Kullanıcının başlattığı bir aksiyonun yüklenmesi **aksiyonun kendisinde** gösterilir (butonda), sayfa genelinde değil. |
| **ST-LOAD-03** | Yükleme sırasında aynı aksiyon **tekrar tetiklenemez**. |
| **ST-LOAD-04** | Takvim ızgarası yüklenirken navigasyon kontrolleri (bugün, ileri/geri, görünüm seçici) **kullanılabilir kalır**. |

### 5.3 Empty

| ID | Kural |
|---|---|
| **ST-EMPTY-01** | Her boş durum üç bilgi taşır: **ne yok** · **neden yok** *(filtre sonucu mu, hiç veri yok mu)* · **ne yapılabilir**. |
| **ST-EMPTY-02** | Filtre sonucu boş ise, boş durum **filtreyi temizleme** yolunu sunar. Hiç veri yoksa **oluşturma** yolunu sunar. |
| **ST-EMPTY-03** | Sıfır kayıtta **sayfalama kontrolleri gösterilmez**. *(`UX-45` — boş oda listesinde sayfalama render ediliyor, aralık göstergesi `–` görünüyordu.)* |
| **ST-EMPTY-04** | Boş takvim ızgarası, "bu aralıkta etkinlik yok" bilgisini taşır; sessiz boş ızgara yeterli değildir (ST-CORE-06). |

### 5.4 Success

| ID | Kural |
|---|---|
| **ST-SUC-01** | Başarı **her zaman** bildirilir. Sessiz başarı, sessiz hata kadar sorunludur — kullanıcı işlemin geçtiğini bilemez. |
| **ST-SUC-02** | Sonucu ekranda **doğrudan görülebilen** işlemler (ör. takvimde beliren yeni etkinlik) için geçici bildirim yeterlidir. |
| **ST-SUC-03** | Sonucu ekranda görülemeyen işlemler (ör. bildirim gönderimi, onaya düşen talep) için **ne olduğu açıkça yazılır**: "Talebiniz gönderildi, onay bekliyor." |
| **ST-SUC-04** | Başarı bildirimi, işlemin **yan etkilerini** de içerir: kaç kişiye davet gitti, oda rezerve edildi mi, onaya mı düştü. |

### 5.5 Error

| ID | Kural |
|---|---|
| **ST-ERR-01** | Hata, sorunun **kaynağına en yakın yerde** gösterilir: tek alana bağlıysa alan altında, tüm işlemi engelliyorsa yüzey üstünde. |
| **ST-ERR-02** | Hata mesajı **ne olduğunu ve ne yapılabileceğini** söyler. Teknik kod veya ham sunucu mesajı gösterilmez. |
| **ST-ERR-03** | Hata durumunda **kullanıcının girdiği veri korunur.** Form kapanmaz, alanlar temizlenmez. |
| **ST-ERR-04** | Yeniden denenebilir hatalar bir **tekrar dene** yolu sunar. |
| **ST-ERR-05** | Beklenmeyen sunucu hataları da ST-CORE-01 kapsamındadır: kullanıcıya ne olduğu söylenir, sessizce yutulmaz. |

### 5.6 Pending

> "Pending", bu modülde **birinci sınıf ve kalıcı** bir durumdur — geçici bir yükleme değil (D-034, D-036).

| ID | Kural |
|---|---|
| **ST-PEND-01** | Onay bekleyen bir rezervasyon, hem etkinlikte hem odada **kalıcı bir durum rozeti** ile gösterilir: **Onay bekliyor**. |
| **ST-PEND-02** | Oda müsaitliği üç ayrı durum taşır: **Müsait · Onay bekliyor · Rezerve** (D-036). Bunlar görsel olarak birbirinden ayırt edilebilir olmalıdır. |
| **ST-PEND-03** | Bekleyen durum, kullanıcının **kimden ne beklediğini** söyler: "Onay bekliyor — [onaylayıcı]". |
| **ST-PEND-04** | Pending durumu asla success dili kullanmaz (ST-CORE-02 ile tutarlı). "Rezerve edildi" değil, "Talebiniz gönderildi". |

### 5.7 Disabled

| ID | Kural |
|---|---|
| **ST-DIS-01** | Devre dışı kontrol **gizlenmez** — görünür kalır, sebebi okunur (ST-CORE-03). |
| **ST-DIS-02** | Sebep, aktörün diliyle yazılır: *"Bu odayı rezerve etme yetkiniz yok"*, *"Bu oda seçtiğiniz saatte dolu"*, *"Konu alanı zorunlu"*. |
| **ST-DIS-03** | Sebep, yalnızca hover ile erişilebilir olamaz — dokunmatik ve klavye kullanıcısı da erişebilmelidir. |
| **ST-DIS-04** | Birincil aksiyon devre dışıysa, **hangi koşulun sağlanmadığı** kullanıcıya gösterilir. |

### 5.8 Destructive

| ID | Kural |
|---|---|
| **ST-DES-01** | Yıkıcı işlemler (etkinlik silme, seri silme, oda silme, rezervasyon reddi) **onay ister**. |
| **ST-DES-02** | Onay diyaloğu **etkinin kapsamını** söyler: kaç kişi etkilenecek, kaç etkinlik silinecek, oda rezervasyonuna ne olacak. |
| **ST-DES-03** | Seri silmede kapsam seçimi (bu / bu ve sonrakiler / tüm seri) **onay adımının parçasıdır** (D-043). |
| **ST-DES-04** | Onay diyaloğunda yıkıcı aksiyon birincil dili kullanmaz; iptal kolay erişilebilir olur. |

### 5.9 Validation

| ID | Kural |
|---|---|
| **ST-VAL-01** | Zorunlu alanlar **girişten önce** işaretlenir; kullanıcı neyi doldurması gerektiğini kaydetmeden önce bilir (`FN-06`). |
| **ST-VAL-02** | Alan hatası, alanın **altında** gösterilir ve alan için ayrılmış yer korunur — hata belirince düzen zıplamaz. |
| **ST-VAL-03** | Doğrulama, alan **terk edildiğinde** çalışır; her tuş vuruşunda değil. Kaydetme denemesinde tüm alanlar yeniden doğrulanır. |
| **ST-VAL-04** | Kaydetme başarısızsa **ilk hatalı alana odaklanılır**. |
| **ST-VAL-05** | **Engelleyici hata ile engelleyici olmayan uyarı ayrı görsel ve davranışsal sınıflardır.** Hata kaydetmeyi engeller; uyarı bilgilendirir ama engellemez. |
| **ST-VAL-06** | ⚠️ **Bir koşulun engelleyici olup olmadığını bu spec BELİRLEMEZ.** Sınıflandırma **ilgili domain spec'ine** aittir. Bu spec yalnızca iki sınıfın **nasıl sunulacağını** tanımlar. |
| **ST-VAL-07** | Engelleyici olmayan uyarı, kullanıcı işlemi tamamladıktan sonra da **kayıtta izlenebilir** kalmalıdır (ör. mesai dışı bir etkinlik, detayında bu bilgiyi taşır). |

**Sunum sözleşmesi:**

| Sınıf | Sunum | Birincil aksiyon |
|---|---|---|
| **Engelleyici hata** | Kaynağına en yakın yerde (alan altı veya yüzey üstü) · hata dili | **Pasif**, sebebi okunur (ST-DIS-04) |
| **Engelleyici olmayan uyarı** | Alan yakınında veya özet bölgesinde · uyarı dili | **Aktif kalır** |
| **Bilgi** | Bağlamda · nötr dil | Aktif kalır |

> Domain spec'lerinin sınıflandırma örnekleri *(bu spec'in kararı değildir, referans içindir)*: mesai saatleri dışı → **engelleyici olmayan** (D-045 bağlayıcı) · oda çakışması → **engelleyici** (`16-room-booking-spec.md`) · boş erişim kuralı → **engelleyici** (`10-permissions-spec.md` V-PRM-01) · zorunlu alan boş → **engelleyici**. **Geçmiş tarihe etkinlik oluşturma `15-event-spec.md`'de sınıflandırılır.**

---

## 6. User Flows

Bu spec bağımsız bir akış tanımlamaz; diğer modüllerin akışlarına durum davranışı sağlar. Referans örnek:

### F-ST-1 · Hata sonrası kurtarma *(genel kalıp)*
```
Kullanıcı formu doldurur → birincil aksiyona basar
→ buton loading durumuna geçer, tekrar tetiklenemez (ST-LOAD-02, ST-LOAD-03)
→ istek başarısız
→ hata kaynağına en yakın yerde gösterilir (ST-ERR-01)
→ girilen veri korunur, form açık kalır (ST-ERR-03)
→ tekrar dene yolu sunulur (ST-ERR-04)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-ST-01** | Geçici bildirimler, kullanıcının o an baktığı yeri kapatmaz. |
| **IR-ST-02** | Kalıcı durum bilgisi (pending, disabled sebebi) geçici bildirime bırakılmaz — kaybolmamalıdır. |
| **IR-ST-03** | Aynı anda birden fazla hata varsa, kullanıcı hepsini görebilmelidir; hatalar tek tek ortaya çıkmaz. |
| **IR-ST-04** | Bir durum değişikliği kullanıcının başlatmadığı bir sebeple olduysa (ör. talebi başkası onayladı), bu **bildirimle** iletilir — `19-notifications-spec.md`. |

---

## 8. States

Bu spec'in kendisi durum tanımıdır. Diğer spec'ler §5'teki sınıflara ID ile referans verir.

---

## 9. Validation

Bkz. §5.9.

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-ST-01** | İstek çok yavaş, kullanıcı sekmeyi değiştirip döndü | Yükleme durumu korunur; işlem iptal edilmiş gibi gösterilmez |
| **EC-ST-02** | Kullanıcı formu doldururken yetkisi değişti | Kaydetmede yetki hatası yüzey hatası olarak gösterilir; veri korunur (ST-ERR-03) |
| **EC-ST-03** | Aynı kaydı iki kullanıcı aynı anda değiştirdi | Kaybeden tarafa **ne olduğu** açıkça söylenir; sessiz üzerine yazma yapılmaz |
| **EC-ST-04** | Kısmi başarı: etkinlik oluştu ama oda talebi onaya düştü | Tek bir bildirimde **her iki sonuç** da yazılır (ST-SUC-04) |
| **EC-ST-05** | Kısmi başarı: etkinlik oluştu ama davet e-postası gönderilemedi | Etkinlik başarısı bildirilir, gönderim sorunu ayrıca ve açıkça belirtilir. Sessiz yutulmaz (ST-CORE-01) |
| **EC-ST-06** | Boş sonuç, bir filtre yüzünden | Filtre sonucu olduğu söylenir ve temizleme yolu sunulur (ST-EMPTY-02) |
| **EC-ST-07** | Kullanıcı yıkıcı onay diyaloğunu kapatır | Hiçbir şey yapılmaz; varsayılan güvenli taraftır |

---

## 11. Dependencies

Bu spec **hiçbir spec'e bağlı değildir** ve diğer tüm spec'ler buna bağlıdır.

Tüketiciler: `10-permissions` (disabled sebebi) · `12-calendars` (boş durum) · `13-rooms` (form validasyonu, boş liste) · `14-calendar-shell` (yükleme, boş ızgara) · `15-event` (validasyon, yıkıcı işlem) · `16-room-booking` (disabled, çakışma hatası) · `17-scheduling` (veri yok ≠ müsait) · `18-reservation-approval` (pending durumu) · `19-notifications` (IR-ST-04)

---

## 12. Responsive Expectations

Desktop-first (D-047). Durum kuralları **cihazdan bağımsızdır**; yalnızca sunum değişir:
- ST-DIS-03 mobilde kritiktir — hover yok, sebep dokunmayla erişilebilir olmalıdır
- Geçici bildirimler mobilde ekranın küçük olduğu için içeriği kapatmamalıdır (IR-ST-01)
- Yıkıcı onay diyalogları mobilde tam ekran olabilir

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Tek bir buton durum paleti** gerekiyor: birincil/ikincil/yıkıcı × aktif/pasif/yükleniyor. Bugün modülde dört farklı birincil buton görünümü var (`UX-39`).
- **Üç ayrı rezervasyon durumunun** (Müsait / Onay bekliyor / Rezerve) hem oda listesinde hem takvim ızgarasında ayırt edilebilir olması gerekiyor — bu, renk paletinde ayrılmış bir alan demek ve `12-calendars-spec.md`'deki takvim renkleriyle **çakışmamalıdır**.
- Hata, uyarı ve bilgi mesajlarının **ayrı görsel dilleri** olmalı (ST-VAL-05).
- Boş durumlar için ortak bir kompozisyon gerekiyor: başlık + açıklama + aksiyon.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-ST-01 | Başarısız olan hiçbir kullanıcı işlemi sessizce sonlanmaz; her başarısızlık görünür bir hata üretir. |
| AC-ST-02 | Hiçbir ekran, işlem tamamlanmadan başarı dili kullanmaz. |
| AC-ST-03 | Devre dışı olan her kontrolün sebebi, hover gerektirmeden okunabilir. |
| AC-ST-04 | Herhangi bir yüzeyde aynı anda yalnızca bir birincil aksiyon görünür. |
| AC-ST-05 | Aktif ve pasif buton görünümü modülün tamamında aynıdır. |
| AC-ST-06 | Boş sonuç ile yüklenememiş sonuç görsel olarak ayırt edilir. |
| AC-ST-07 | Sıfır kayıtlı listede sayfalama kontrolleri görünmez. |
| AC-ST-08 | Hata sonrası kullanıcının girdiği veri korunur ve form kapanmaz. |
| AC-ST-09 | "Onay bekliyor" durumu geçici bildirim değil, kalıcı ve okunabilir bir durumdur. |
| AC-ST-10 | Yıkıcı işlem onayı, etkilenecek kapsamı sayısal olarak belirtir. |
| AC-ST-11 | Engelleyici hata ile engelleyici olmayan uyarı, hem görsel dil hem birincil aksiyonun durumu bakımından ayırt edilebilir. Bir koşulun hangi sınıfa girdiği ilgili domain spec'inde tanımlıdır. |
| AC-ST-12 | Zorunlu alanlar, kaydetme denenmeden önce işaretlidir. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-ST-01 | Domain koşullarının sınıflandırılması | **Bu spec sınıflandırma yapmaz** (ST-VAL-06) | System States bir sunum sözleşmesidir; hangi koşulun engelleyici olduğu domain kararıdır. `FN-02` (geçmiş tarih) `15-event-spec.md`'de ele alınır |
| SR-ST-02 | Doğrulama zamanlaması | **Alan terk edildiğinde** + kaydetmede tümü | Her tuşta doğrulama erken ve rahatsız edici |
| SR-ST-03 | Başarı bildirimi kapsamı | **Yan etkileri de içerir** (ST-SUC-04) | Kısmi başarı en sık yanlış anlaşılan durum (EC-ST-04/05) |
| SR-ST-04 | Undo | **İlk kapsam dışı** | Karar alınmadı; ST-DES-01 onay mekanizması yıkıcı işlemleri zaten koruyor |
| SR-ST-05 | Eşzamanlı düzenleme çakışması | **Kaybeden tarafa açıkça bildirilir** (EC-ST-03) | Sessiz üzerine yazma ST-CORE-01'in ihlali olur |
