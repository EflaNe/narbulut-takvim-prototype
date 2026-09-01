# 10 — Permissions Spec

**Cluster:** PC-11 · **Katman:** Foundation · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-025, D-026, D-027, D-030, D-041, D-042 · **Scope referansı:** `04-scope-closure.md` §PC-11

---

## 1. Purpose

Narbulut Takvim'de **kim neyi görebilir ve kim ne yapabilir** sorusunun tek tanımı. İki ayrı görünürlük ekseni vardır ve bu spec ikisini de tanımlar:

- **Oda erişimi** — bir odayı kimin *görebileceği* ve kimin *rezerve edebileceği*
- **Takvim görünürlüğü** — bir kullanıcının başka kullanıcıların meşguliyetini nasıl gördüğü

Diğer tüm modüller yetki sorularında bu spec'e referans verir; kendi yetki kuralını tanımlamaz.

---

## 2. Scope

### In Scope
- Oda erişiminin iki yetki tipine ayrılması: **Görebilir** / **Rezerve edebilir**
- Yetki öznesi olarak **kullanıcı** ve **grup**
- Yeni odaların varsayılan erişimi
- Oda erişiminin oda oluşturma akışı **dışından** yönetilebilmesi
- Merkezî izin yüzeyi (bugün pasif olan İzinler sekmesinin işlevi)
- **Organizasyon içi free/busy görünürlüğü**
- Organizasyon sınırının yetki üzerindeki etkisi
- Mevcut erişim kayıtlarının göç kuralı

### Out of Scope
- Rol × yetki matrisi (C-1)
- **"Onaylayabilir" genel permission tipi** — onaylayıcı oda seviyesinde tanımlanır, bkz. `18-reservation-approval-spec.md` (D-042)
- Kapsamlı admin rolleri ("yalnızca 3. kattaki odaların yöneticisi")
- Delegasyon
- **Event-level privacy (Normal/Özel/Gizli)** (D-041)
- Kademeli takvim paylaşımı — free/busy ötesi görünürlük seviyeleri (D-027)
- Çapraz-organizasyon görünürlük (D-025)
- Takvim paylaşımı (D-049 — `12-calendars-spec.md`)

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Normal kullanıcı** | Oda erişimini tüketir; başkalarının free/busy bilgisini görür |
| **Organizasyon yöneticisi** | Oda erişimini tanımlar ve değiştirir; merkezî izin yüzeyini kullanır |
| **Harici misafir** | Organizasyonun kullanıcısı değildir. **Hiçbir oda erişimine ve free/busy görünürlüğüne sahip değildir.** Yalnızca davet edildiği etkinliği bilir. |

> **Oda onaylayıcısı** bu spec'in aktörü değildir — genel bir yetki tipi olmadığı için (D-042) `18-reservation-approval-spec.md`'de tanımlanır.

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Organizasyon** | Sistemin temel çalışma sınırı. Takvimler, odalar, gruplar ve kullanıcılar tek bir organizasyon context'inde yaşar (D-025). |
| **Kullanıcı** | Organizasyona ait hesap. |
| **Grup** | Organizasyon içinde kullanıcı kümesi. Yetkinin birincil öznesi olabilir (`KEEP-11`). |
| **Yetki tipi** | İki değer: `Görebilir` · `Rezerve edebilir` (D-026). |
| **Erişim kuralı** | Bir oda + bir yetki tipi için geçerli olan tanım. İki biçimden biri: **Tüm kullanıcılar** *veya* açık bir **özne listesi** (grup ve/veya kullanıcı). |
| **Oda erişim yapılandırması** | Bir odanın iki erişim kuralının toplamı (biri görüntüleme, biri rezervasyon için). |
| **Free/busy** | Bir kullanıcının belirli bir zaman aralığında meşgul olup olmadığı bilgisi. Detay içermez. |

---

## 5. Business Rules

### 5.1 Oda erişimi

| ID | Kural |
|---|---|
| **BR-PRM-01** | Her odanın **iki bağımsız erişim kuralı** vardır: biri `Görebilir`, biri `Rezerve edebilir` yetki tipi için. |
| **BR-PRM-02** | Her erişim kuralı ya **"Tüm kullanıcılar"** değerini alır ya da **en az bir özne** (grup veya kullanıcı) içeren açık bir liste olur. Boş liste geçersizdir (bkz. BR-PRM-14). "Tüm kullanıcılar" ile açık liste **birbirini dışlar değil, birleşir** — ikisi de bir yetki kaynağıdır (BR-PRM-05). |
| **BR-PRM-03** | **Yeni oluşturulan odada her iki erişim kuralı da "Tüm kullanıcılar" değerindedir.** Kısıtlama istisnadır (D-030). |
| **BR-PRM-04** | **Invariant: `Rezerve edebilir` → `Görebilir`'i gerektirir.** Bir kullanıcı odayı rezerve edebiliyorsa görebilir de. Sistem eksik `Görebilir` hakkını **otomatik tamamlar** ve bunu **arayüzde kullanıcıya açıkça belirtir** (IR-PRM-03). *(Spec-level recommendation — D-026'da yazılmadı; görmediği odayı rezerve edemeyeceği için mantıksal zorunluluk.)* |
| **BR-PRM-05** | **Yetki atamaları toplamsaldır (additive / union-based).** Bir kullanıcı yetkiyi üç kaynaktan alabilir: **doğrudan kendisine** verilen · **üyesi olduğu bir gruba** verilen · **"Tüm kullanıcılar"** kuralı. **Bu kaynaklardan herhangi biri ilgili hakkı veriyorsa kullanıcı o hakka sahiptir.** ⚠️ Bu kapsamda **explicit `DENY` (reddetme) yetkisi ve deny önceliği modeli yoktur** — bir yetkiyi geri almak, onu veren tüm kaynaklardan kaldırmakla olur. |
| **BR-PRM-06** | **Görebilir** yetkisi şunları verir: odayı oda listelerinde ve oda seçicilerde görmek · odanın kapasite, özellik ve lokasyon bilgisini görmek · odanın **müsaitlik durumunu** görmek (Müsait / Onay bekliyor / Rezerve). Odadaki etkinliklerin **detayını vermez** (BR-PRM-11 ile tutarlı). |
| **BR-PRM-07** | **Rezerve edebilir** yetkisi, `Görebilir`in verdiklerine ek olarak odayı bir etkinliğe bağlama hakkını verir. Odada onay gerekliyse bu hak fiilen **"talep gönderebilir"** anlamına gelir (D-035a). |
| **BR-PRM-08** | **Rezerve edemediği bir oda kullanıcıdan gizlenmez.** `Görebilir` yetkisi varsa oda listede kalır, müsaitliği okunur, ancak seçim aksiyonu kapalıdır (D-026). |
| **BR-PRM-09** | `Görebilir` yetkisi olmayan bir oda, kullanıcının hiçbir oda listesinde veya seçicisinde **görünmez**. |
| **BR-PRM-10** | Oda erişimi **oda oluşturma akışından bağımsız olarak** her zaman düzenlenebilir. Erişimi değiştirmek için odayı yeniden oluşturmak gerekmez. |

### 5.2 Takvim görünürlüğü

| ID | Kural |
|---|---|
| **BR-PRM-11** | Aynı organizasyondaki kullanıcılar birbirlerinin takviminde **varsayılan olarak yalnızca müsait/meşgul** bilgisini görür. **Görünmez:** etkinlik başlığı · katılımcılar · oda/lokasyon · notlar · takvim adı · diğer tüm detaylar (D-027). ⚠️ **Tek istisna:** sahibi tarafından kendisiyle **paylaşılmış** bir takvim; o takvimin etkinlik detayları alıcıya görünür (D-067, `12` §5.6). |
| **BR-PRM-12** | Free/busy görünürlüğü **organizasyon içinde varsayılan olarak açıktır** ve kullanıcı başına kapatılamaz (D-027). **Kademeli paylaşım seviyeleri yoktur.** ⚠️ Calendar Sharing bir *kademe* değildir: free/busy tabanını **değiştirmez**, üstüne **tek seviyeli detay erişimi** ekler (D-067, `12` BR-CAL-29). |
| **BR-PRM-13** | **Etkinlik seviyesinde gizlilik yoktur.** Hiçbir etkinlik free/busy'de görünmez kılınamaz; her etkinlik sahibinin o aralıkta meşgul görünmesine yol açar (D-041). |

### 5.3 Sınırlar ve göç

| ID | Kural |
|---|---|
| **BR-PRM-14** | Bir erişim kuralı boş bırakılamaz. Kullanıcı "Tüm kullanıcılar" seçimini kaldırıp hiçbir özne eklemezse kayıt **kabul edilmez** (bkz. §9). |
| **BR-PRM-15** | Yetki değerlendirmesi **organizasyon sınırında** yapılır. Başka organizasyonun kullanıcısı hiçbir odaya ve hiçbir free/busy bilgisine erişemez (D-025). |
| **BR-PRM-16** | **Göç:** mevcut sistemde bir odaya erişimi olan kullanıcı/gruplar, yeni modelde **hem `Görebilir` hem `Rezerve edebilir`** yetkisine taşınır. Mevcut davranış bozulmaz (D-026). |
| **BR-PRM-17** | Mevcut sistemde "Bu Odaya Tüm Kullanıcılar Erişebilir" işaretli odalar, yeni modelde **her iki erişim kuralı da "Tüm kullanıcılar"** olarak taşınır. |
| **BR-PRM-18** | Harici misafir kullanıcılar organizasyonun üyesi değildir: hiçbir oda erişimine sahip olmazlar ve free/busy görünürlüğüne dahil edilmezler. |

---

## 6. User Flows

### F-PRM-1 · Oda erişimini kısıtlama *(organizasyon yöneticisi)*
```
Odalar → odayı aç (13-rooms-spec, tek ekran form) → Erişim bölümü
→ "Rezerve edebilir" kuralında "Tüm kullanıcılar" seçimini kaldır
→ grup ve/veya kullanıcı ekle
→ "Görebilir" kuralı "Tüm kullanıcılar" olarak kalır
→ Kaydet
→ Sonuç: oda herkese görünür, yalnızca seçilen özneler rezerve edebilir
```

### F-PRM-2 · Merkezî izin görünümü *(organizasyon yöneticisi)*
```
Takvim → İzinler
→ Odalar × erişim özeti listesi: her satırda oda adı, "Görebilir" özeti, "Rezerve edebilir" özeti
→ Satırdan doğrudan düzenleme veya odaya geçiş
```
> Bu yüzey, bugün pasif olan İzinler sekmesinin işlevidir (`IA-01`, `FN-09`).

### F-PRM-3 · Yetkisiz odayla karşılaşma *(normal kullanıcı)*
```
Etkinlik oluşturma → oda seçici
→ kullanıcının yalnızca "Görebilir" yetkisi olan oda listede görünür
→ satır seçilemez durumda; sebep okunabilir: "Bu odayı rezerve etme yetkiniz yok"
→ odanın müsaitlik durumu yine de okunur
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-PRM-01** | İki erişim kuralı **aynı ekranda, ayrı ayrı** düzenlenir. Kullanıcı hangi yetkiyi verdiğini her an görebilmelidir. |
| **IR-PRM-02** | "Tüm kullanıcılar" seçiliyken özne listesi **pasif** görünür ama gizlenmez — kullanıcı neyi devre dışı bıraktığını görür. |
| **IR-PRM-03** | `Rezerve edebilir` kuralına bir özne eklendiğinde ve `Görebilir` kuralı o özneyi kapsamıyorsa, sistem BR-PRM-04 gereği görüntüleme yetkisini **otomatik olarak ekler** ve bunu kullanıcıya bildirir. |
| **IR-PRM-04** | Seçilemez durumdaki her oda satırı **sebebini taşımalıdır**. Sebepsiz pasif kontrol yasaktır — bkz. `11-system-states-spec.md` §disabled. |
| **IR-PRM-05** | Erişim değişikliği kaydedildiğinde etkisi **hemen** geçerlidir; oda seçicileri güncel yetkiyi yansıtır. |

---

## 8. States

Ortak davranış sözleşmesi: **`11-system-states-spec.md`**. Bu modüle özgü olanlar:

| State | Davranış |
|---|---|
| **Default** | Yeni odada her iki kural "Tüm kullanıcılar" (BR-PRM-03). |
| **Kısıtlı** | En az bir kural açık özne listesi. Oda listesinde ve izin yüzeyinde ayırt edilebilir olmalı. |
| **Disabled (oda satırı)** | `Görebilir` var, `Rezerve edebilir` yok. Satır görünür, seçim kapalı, sebep okunabilir (IR-PRM-04). |
| **Hidden** | `Görebilir` yok. Oda kullanıcı için hiç render edilmez (BR-PRM-09). |
| **Error** | Boş erişim kuralı kaydedilmeye çalışıldı (BR-PRM-14). |

---

## 9. Validation

| ID | Kural | Mesaj davranışı |
|---|---|---|
| **V-PRM-01** | Bir erişim kuralı boş olamaz | Alan altı hata: kaydetme engellenir; hangi kuralın boş olduğu belirtilir |
| **V-PRM-02** | Aynı özne bir kurala iki kez eklenemez | Sessizce yok sayılır (tekrar eklenmez), hata gösterilmez |
| **V-PRM-03** | Organizasyon dışı kullanıcı özne olarak eklenemez | Seçicide zaten listelenmez (BR-PRM-15) |
| **V-PRM-04** | `Rezerve edebilir`de olup `Görebilir`de olmayan özne | Hata değil — IR-PRM-03 gereği otomatik düzeltilir ve bildirilir |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-PRM-01** | Kullanıcı hem doğrudan hem grup üzerinden yetkili | Yetkiler birleşir (BR-PRM-05). Çifte kayıt hata değildir; kaldırma işlemi **her iki kaynaktan** yapılmalıdır. |
| **EC-PRM-02** | Yetki verilmiş grup silinir | Grubun sağladığı yetki düşer. Kural boş kalırsa oda **erişilemez** hale gelir; izin yüzeyinde bu durum **uyarı olarak işaretlenmelidir**. *(Spec-level recommendation)* |
| **EC-PRM-03** | Kullanıcı organizasyondan çıkarılır | Tüm yetkileri düşer. Organizatörü olduğu etkinlikler için bkz. `15-event-spec.md` (D-039: organizasyon yöneticisi müdahale edebilir). |
| **EC-PRM-04** | Oda pasife alınır | Erişim yapılandırması korunur ancak oda yeni rezervasyonlarda seçilemez. Mevcut rezervasyonlar etkilenmez. Detay: `13-rooms-spec.md`. |
| **EC-PRM-05** | Kullanıcının rezervasyon yetkisi, bekleyen bir talebi varken kaldırılır | Bekleyen talep **otomatik iptal edilmez**; onaylayıcının kararına bırakılır. *(Spec-level recommendation — sessiz veri kaybını önler.)* |
| **EC-PRM-06** | Kullanıcının rezervasyon yetkisi, onaylanmış bir rezervasyonu varken kaldırılır | Mevcut rezervasyon **geçerli kalır**. Yetki değişikliği geriye dönük uygulanmaz. *(Spec-level recommendation)* |
| **EC-PRM-07** | Odanın `Görebilir` yetkisi daraltılır, kullanıcının o odada etkinliği vardır | Kullanıcı kendi etkinliğini görmeye devam eder; oda adı etkinlik detayında görünür. Ancak oda seçicilerinde artık listelenmez. *(Spec-level recommendation)* |
| **EC-PRM-08** | Free/busy sorgusu, hiç etkinliği olmayan kullanıcı için yapılır | "Müsait" döner. Boş takvim ile veri gelmemesi **ayırt edilebilir olmalıdır** — bkz. `11-system-states-spec.md`. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `11-system-states-spec.md` | Disabled/error/empty davranış sözleşmesi |
| `13-rooms-spec.md` | Oda varlığı ve oda formundaki Erişim bölümü |
| `16-room-booking-spec.md` | BR-PRM-06/07/08/09'u tüketir |
| `17-scheduling-spec.md` | BR-PRM-11/12/13'ü (free/busy) tüketir |
| `12-calendars-spec.md` | **Calendar Sharing** BR-PRM-11'in tek istisnasını tanımlar (`12` §5.6). Paylaşım bu spec'te bir yetki tipi **değildir** |
| `18-reservation-approval-spec.md` | BR-PRM-07'nin "talep gönderebilir"e dönüşmesi; onaylayıcı tanımı orada |

---

## 12. Responsive Expectations

Desktop-first (D-047). İzin yüzeyi bir yönetim aracıdır ve **mobilde birincil akış değildir** — D-047'nin mobil için zorunlu tuttuğu 6 akış arasında izin yönetimi yoktur. Mobilde izin yapılandırması **okunabilir** olmalı, düzenleme masaüstüne yönlendirilebilir.

Buna karşılık **BR-PRM-08'in sonucu (yetkisiz odanın görünür-seçilemez gösterimi) mobilde de geçerlidir** — oda rezervasyonu mobil zorunlu akışlar arasındadır.

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- İki erişim kuralının **tek ekranda yan yana ve karıştırılmadan** okunabilmesi gerekiyor. Benchmark'ta hiçbir üründe "kim neyi görüyor?" sorusuna tek ekranda cevap veren bir özet görünüme rastlanmadı `[I]` — burada rakiplerin önüne geçme fırsatı var.
- Kısıtlı oda ile açık odanın listede **bir bakışta ayırt edilebilmesi** gerekiyor.
- Seçilemez oda satırının sebebi, hover'a gizlenmeden okunabilir olmalı.
- Free/busy gösterimi, "meşgul" ile "veri yok"u görsel olarak ayırmalıdır.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-PRM-01 | Yeni oluşturulan bir odada her iki erişim kuralı da "Tüm kullanıcılar" değerindedir. |
| AC-PRM-02 | Bir odanın `Rezerve edebilir` kuralı bir gruba daraltıldığında, grup dışındaki kullanıcı odayı **listede görür** ama **seçemez** ve **sebebi okuyabilir**. |
| AC-PRM-03 | `Görebilir` yetkisi olmayan kullanıcı, odayı hiçbir liste veya seçicide görmez. |
| AC-PRM-04 | `Rezerve edebilir` kuralına eklenen bir özne `Görebilir` kuralında yoksa, sistem görüntüleme yetkisini otomatik ekler ve **bunu arayüzde açıkça belirtir**. |
| AC-PRM-11 | Yetki değerlendirmesi toplamsaldır: üç kaynaktan (doğrudan / grup / tüm kullanıcılar) herhangi biri hakkı veriyorsa kullanıcı o hakka sahiptir. Sistemde explicit deny yoktur. |
| AC-PRM-05 | Erişim kuralı boş bırakılarak kaydedilemez; hata alan altında gösterilir. |
| AC-PRM-06 | Oda erişimi, oda oluşturma akışı dışından düzenlenebilir. |
| AC-PRM-07 | Bir kullanıcı, aynı organizasyondaki başka bir kullanıcının takviminde yalnızca müsait/meşgul görür; hiçbir etkinlik detayı görünmez. |
| AC-PRM-08 | Hiçbir etkinlik, free/busy'de görünmez hale getirilemez. |
| AC-PRM-09 | Göç sonrası, önceden erişimi olan tüm kullanıcı/gruplar her iki yetkiye de sahiptir ve hiçbir kullanıcı yetki kaybetmez. |
| AC-PRM-10 | Harici misafir hiçbir oda listesinde yetki öznesi olarak seçilemez. |

---

## Spec-level recommendations *(bu spec'te alınan küçük kararlar)*

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-PRM-01 | Rezervasyon yetkisi görüntülemeyi ima eder mi? | **Evet** (BR-PRM-04) | Görmediğin odayı rezerve edemezsin — mantıksal zorunluluk |
| SR-PRM-02 | Birden fazla kaynaktan gelen yetki nasıl birleşir? | **Toplamsal (union-based); explicit deny yok** (BR-PRM-05) | Deny modeli tanımlanmadı; union en basit ve öngörülebilir sözleşme. Deny önceliği ileride gerekirse ayrı bir ürün kararı olur |
| SR-PRM-03 | Yetki kaldırıldığında bekleyen talep | **Otomatik iptal edilmez** (EC-PRM-05) | Sessiz veri kaybını önler; audit'in 1 numaralı bulgusuyla tutarlı |
| SR-PRM-04 | Yetki kaldırıldığında mevcut rezervasyon | **Geçerli kalır** (EC-PRM-06) | Geriye dönük yetki uygulaması takvimi öngörülemez kılar |
| SR-PRM-05 | Grup silindiğinde erişilemez kalan oda | **Uyarı olarak işaretlenir** (EC-PRM-02) | Sessizce erişilemez oda, FB-01 tipi sessiz hatanın yeni bir örneği olurdu |
