# 16 — Room Booking Spec

**Cluster:** PC-09 · **Katman:** Core Experience · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-026, D-028, D-031, D-036, D-043, D-048 · **Scope referansı:** `04-scope-closure.md` §PC-09
**Source of truth:** izinler → `10` · durumlar → `11` · oda kaynak modeli → `13` · etkinlik → `15` · onay akışı → `18`

---

## 1. Purpose

Kullanıcının **etkinlik oluştururken doğru odayı bulup bağlaması**. Bu, oda yönetiminin (`13-rooms-spec.md`) tüketici tarafıdır.

Audit'in 2 numaralı bulgusuna doğrudan cevaptır: bugün oda sistemi var ama **"dolu" kavramı yok** — aynı oda aynı saatte iki kez rezerve edilebiliyor (`FN-03`). Ayrıca odayı görmek için önce bir checkbox işaretlemek gerekiyor (`UX-30`).

---

## 2. Scope

### In Scope
- Doğrudan oda seçici — checkbox katmanı kaldırılır
- **Müsaitlik-farkında liste:** seçili zaman aralığına göre gelen odalar
- **Dolu oda:** görünür ama seçilemez (D-031)
- **Yetkisi olmayan oda:** `Görebilir` hakkı varsa görünür ama seçilemez (D-026)
- **Kapasite / özellik / bina / kat filtreleri** — yalnızca veri varsa (D-028, D-048)
- Katılımcı sayısı ile kapasite karşılaştırması
- **Çakışma kontrolü — engelleyici**
- Rezervasyon durumları: **Müsait · Onay bekliyor · Rezerve** (D-036)
- **Bekleyen rezervasyonun slotu bloke etmesi** (D-036)
- Odalara Göre görünümünden başlayan rezervasyon
- Seri (tekrarlayan) etkinlikte oda davranışı

### Out of Scope
- **Oda veri modeli, oda CRUD, oda arama yönetimi** → `13-rooms-spec.md`
- **Onay akışının ayrıntısı** (kuyruk, red gerekçesi, onaylayıcı deneyimi) → `18-reservation-approval-spec.md`
- **Sonraki müsait zamanın gösterilmesi** (D-031)
- **Oda öneri motoru** · ayrı Room Finder paneli · **birden fazla oda seçimi** · kat planı/harita
- Katılımcı müsaitliği → `17-scheduling-spec.md`

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Etkinlik organizatörü** | Oda arar, filtreler, seçer; rezervasyon veya talep oluşturur |
| **Normal kullanıcı** | Odaları görür; yetkisi ölçüsünde seçebilir (`10` BR-PRM-06/07/08) |

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Oda seçici** | Etkinlik formunun içinde odayı bulup bağlayan yüzey. |
| **Müsaitlik durumu** | Bir oda + zaman aralığı için üç değerden biri: **Müsait · Onay bekliyor · Rezerve** (D-036). |
| **Seçilebilirlik** | Odanın o an seçilip seçilemeyeceği. Müsaitlikten **bağımsız** bir eksendir — yetki de seçilebilirliği etkiler. |
| **Rezervasyon** | Bir etkinlik ile bir oda arasındaki, belirli bir zaman aralığını kaplayan bağ. |
| **Çakışma** | Aynı oda + örtüşen zaman aralığı. |
| **Aktif filtre seti** | O an uygulanabilir filtreler. **Veri yoksa filtre gösterilmez** (D-028). |

### 4.1 Seçilebilirlik matrisi

| Yetki | Müsaitlik | Listede görünür | Seçilebilir | Gösterilen sebep |
|---|---|---|---|---|
| `Görebilir` yok | — | ❌ Hayır | — | *(oda hiç render edilmez)* |
| `Görebilir` var, `Rezerve edebilir` yok | Müsait | ✅ Evet | ❌ Hayır | "Bu odayı rezerve etme yetkiniz yok" |
| `Görebilir` var, `Rezerve edebilir` yok | Rezerve / Onay bekliyor | ✅ Evet | ❌ Hayır | Yetki sebebi öncelikli gösterilir |
| `Rezerve edebilir` var | **Müsait** | ✅ Evet | ✅ **Evet** | — |
| `Rezerve edebilir` var | **Rezerve** | ✅ Evet | ❌ Hayır | "Seçtiğiniz saatte dolu" |
| `Rezerve edebilir` var | **Onay bekliyor** | ✅ Evet | ❌ Hayır | "Bu saat için bekleyen bir talep var" |
| Oda **pasif** | — | ❌ Hayır | — | `13` BR-ROOM-07 |

---

## 5. Business Rules

### 5.1 Oda seçici

| ID | Kural |
|---|---|
| **BR-RB-01** | Oda seçimi **doğrudan bir seçicidir**; önce işaretlenmesi gereken bir checkbox katmanı yoktur (`UX-30`'un çözümü). |
| **BR-RB-02** | Oda listesi **her zaman etkinliğin o anki zaman aralığına göre** hesaplanır. Zaman aralığı değişirse liste **yeniden değerlendirilir**. |
| **BR-RB-03** | Listede **yalnızca kullanıcının `Görebilir` yetkisi olan aktif odalar** görünür — `10` BR-PRM-09, `13` BR-ROOM-07. |
| **BR-RB-04** | **Dolu oda listeden gizlenmez** (D-031): görünür, müsaitlik durumu okunur, seçim kapalıdır. |
| **BR-RB-05** | **Rezerve etme yetkisi olmayan oda da gizlenmez** (D-026): görünür, müsaitliği okunur, seçim kapalıdır. |
| **BR-RB-06** | Seçilemez her oda satırı **sebebini taşır** — `11` ST-DIS-01/02, `10` IR-PRM-04. Sebep hover gerektirmeden okunur. |
| **BR-RB-07** | Aynı anda **tek bir oda** seçilebilir. Çoklu oda seçimi kapsam dışıdır. |
| **BR-RB-08** | Oda seçildiğinde etkinliğin **Konum** alanı odadan türetilir ve salt okunur olur — `15` BR-EVT-09 (D-033). |
| **BR-RB-09** | Odanın müsaitlik durumu, **seçim anında** görünür — sonradan uyarı olarak değil. *(Benchmark T-4.)* |

### 5.2 Filtreler

| ID | Kural |
|---|---|
| **BR-RB-10** | Filtre eksenleri: **kapasite · özellik · bina · kat**. |
| **BR-RB-11** | **Progressive disclosure:** ilgili veri organizasyonda hiç tanımlı değilse o filtre **arayüzde hiç render edilmez** — pasif de gösterilmez (D-028, `13` BR-ROOM-06). |
| **BR-RB-12** | **Kat filtresi yalnızca bir bina seçiliyken** anlamlıdır ve o binanın katlarını gösterir (`13` BR-ROOM-04/05). |
| **BR-RB-13** | Kapasite filtresi **"en az N kişi"** semantiğiyle çalışır. |
| **BR-RB-14** | Özellik filtresi **çoklu seçimdir** ve seçilen özelliklerin **tümünü** taşıyan odaları döndürür. |
| **BR-RB-15** | Filtreler seçilebilirliği değil, **listelenmeyi** etkiler. Filtreden geçen bir oda dolu veya yetkisizse yine listede kalır (BR-RB-04/05). |
| **BR-RB-16** | Aktif filtre sayısı ve **temizleme yolu** her zaman görünür — `11` ST-EMPTY-02. |

### 5.3 Kapasite ve çakışma

| ID | Kural |
|---|---|
| **BR-RB-17** | Etkinlikte katılımcı varsa ve odanın kapasitesi tanımlıysa, kapasite **katılımcı sayısıyla karşılaştırılır**. |
| **BR-RB-18** | **Kapasite yetersizliği engelleyici değildir.** `katılımcı sayısı > oda kapasitesi` durumunda **güçlü bir uyarı** gösterilir, oda **seçilebilir kalır** ve kullanıcı bilinçli olarak devam edebilir. ⚠️ Sistem **neden uyardığını açıkça gösterir** (ör. *"8 katılımcı seçildi, bu odanın kapasitesi 4 kişi"*). *(SR-RB-02)* |
| **BR-RB-19** | Kapasitesi tanımsız oda için kapasite uyarısı **hiç gösterilmez**; "bilinmiyor" durumu uyarıya dönüştürülmez. |
| **BR-RB-20** | **Oda çakışması engelleyicidir.** Çakışan bir oda seçilemez; seçilmiş bir oda çakışır hale gelirse etkinlik **kaydedilemez** — `11` ST-VAL-06 gereği sınıflandırma burada yapılır. |
| **BR-RB-21** | **Bekleyen rezervasyon talebi slotu bloke eder** (D-036). Oda "Onay bekliyor" durumunda görünür ve **seçilemez**. |
| **BR-RB-22** | Çakışma mesajı **neyle çakıştığını** söyler; kullanıcının kendi göremediği bir etkinliğin başlığı **açıklanmaz** — `10` BR-PRM-11. Bu durumda yalnızca "bu saatte dolu" denir. *(SR-RB-03)* |
| **BR-RB-23** | Çakışma kontrolü **kaydetme anında yeniden çalıştırılır**; form açıkken oluşan yeni çakışmalar sessizce geçmez. |

### 5.4 Seri (tekrarlayan) etkinlikte oda

| ID | Kural |
|---|---|
| **BR-RB-24** | Tekrarlayan bir etkinliğe oda bağlandığında rezervasyon **her örnek için ayrı ayrı** değerlendirilir. |
| **BR-RB-25** | Oda seçilirken **kaç örnekte müsait, kaç örnekte dolu** olduğu özetlenir. Örneğin: *"18 tarihten 15'inde müsait, 3'ünde dolu."* |
| **BR-RB-26** | **Kısmen dolu bir oda seçilebilir.** Bu durumda kullanıcı iki yoldan birini açıkça seçer: **çakışan örnekleri odasız bırak** veya **başka oda seç**. Sessizce bazı örneklerin odasız kalması yasaktır. *(SR-RB-04)* |
| **BR-RB-27** | Süresiz tekrarda oda rezervasyonu **sonlu bir ufukla** sınırlıdır (`15` BR-EVT-38); bu sınır kullanıcıya **açıkça bildirilir**. |
| **BR-RB-28** | Seri düzenlemede kapsam seçimi (`15` BR-EVT-34) **oda rezervasyonuna da uygulanır**; etkilenecek rezervasyon sayısı kapsam isteminde belirtilir. |
| **BR-RB-29** | Onay gerektiren bir odaya seri rezervasyon yapıldığında **tek bir talep** oluşur ve seri bütün olarak onaya düşer. Örnek bazında onay yoktur; onay kuyruğunda **N ayrı satır üretilmez**. *(SR-RB-05)* |
| **BR-RB-29a** | ⚠️ **Talep gönderilmeden önce serinin TÜM occurrence'larında ön kontrol yapılır:** oda çakışması · oda müsaitliği · gerekli rezervasyon yetkisi. |
| **BR-RB-29b** | Kısmi problem varsa kullanıcıya özet gösterilir (*"18 tekrarın 15'i uygun, 3'ünde çakışma var"*) ve **problem çözülmeden talep gönderilmez.** Kullanıcı çakışan occurrence'ları odasız bırakmayı veya başka oda seçmeyi açıkça seçer (BR-RB-26). |

### 5.5 Onaya düşen rezervasyon

| ID | Kural |
|---|---|
| **BR-RB-30** | Seçilen odada **"Rezervasyon onayı gerekli"** açıksa (`13` BR-ROOM-11), etkinlik oluşturulduğunda rezervasyon **Onay bekliyor** durumunda başlar. |
| **BR-RB-30a** | ⚠️ **İstisna — eligible approver kontrolü:** talebi oluşturan kullanıcı dışında en az bir eligible approver yoksa rezervasyon **oluşturulmaz**; engelleyici validasyon gösterilir (`18` BR-APR-17b/17d/17e). |
| **BR-RB-31** | Bu durumda kullanıcıya **başarı dili kullanılmaz**: "Talebiniz gönderildi, onay bekliyor" — `11` ST-PEND-04, ST-SUC-03. |
| **BR-RB-32** | Etkinliğin kendisi **oluşur**; onaya düşen yalnızca **oda rezervasyonudur**. Etkinlik takvimde görünür, oda durumu ayrı bir eksende gösterilir — `14` BR-SHELL-20. |
| **BR-RB-33** | Onay akışının geri kalanı (kuyruk, onaylama, red, red gerekçesi, bildirimler) → `18-reservation-approval-spec.md`. |

---

## 6. User Flows

### F-RB-1 · Etkinliğe oda bağlama
```
Etkinlik formu (15-event-spec) → Oda alanı
→ liste, etkinliğin zaman aralığına göre gelir (BR-RB-02)
→ (ops.) filtrele: kapasite · özellik · bina · kat   [yalnızca veri varsa]
→ satırlarda durum okunur: Müsait / Onay bekliyor / Rezerve
→ seçilemez satırlar sebebiyle görünür (BR-RB-06)
→ müsait bir oda seç
→ Konum odadan türetilir (BR-RB-08)
→ (ops.) kapasite uyarısı görünür ama engellemez (BR-RB-18)
```

### F-RB-2 · Çakışmayla karşılaşma
```
Oda seçili → kullanıcı etkinliğin saatini değiştirir
→ liste yeniden değerlendirilir (BR-RB-02)
→ seçili oda artık dolu
→ engelleyici hata: "Seçtiğiniz saatte bu oda dolu" (BR-RB-20)
→ birincil aksiyon pasif, sebebi okunur (11 ST-DIS-04)
→ kullanıcı ya saati ya odayı değiştirir
```

### F-RB-3 · Onay gerektiren oda
```
Onay gerektiren oda seçilir → [Oluştur]
→ etkinlik oluşur, oda rezervasyonu Onay bekliyor durumunda başlar (BR-RB-30)
→ bildirim: "Talebiniz gönderildi, onay bekliyor — [onaylayıcı]" (BR-RB-31)
→ oda o slotta diğer kullanıcılara "Onay bekliyor" görünür ve seçilemez (BR-RB-21)
→ devamı: 18-reservation-approval-spec
```

### F-RB-4 · Odalara Göre görünümünden başlama
```
14-calendar-shell → Odalara Göre → boş bir slot seç
→ 15-event-spec Quick Create açılır, odası ve zamanı önceden dolu
→ oda seçimi zaten yapılmış olarak gelir; değiştirilebilir
```

### F-RB-5 · Seri etkinliğe oda bağlama
```
Tekrar kuralı tanımlı etkinlik → Oda seç
→ özet: "18 tarihten 15'inde müsait, 3'ünde dolu" (BR-RB-25)
→ kullanıcı seçer:
   ( ) Çakışan 3 örneği odasız bırak
   ( ) Başka bir oda seç
→ onay gerektiren odaysa: önce tüm occurrence'lar kontrol edilir (BR-RB-29a)
   → kısmi problem varsa çözülmeden talep GÖNDERİLMEZ (BR-RB-29b)
   → çözüldükten sonra seri bütün olarak TEK talep oluşturur (BR-RB-29)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-RB-01** | Zaman aralığı değiştiğinde oda listesi **otomatik** yeniden değerlendirilir; kullanıcı tetiklemek zorunda kalmaz. |
| **IR-RB-02** | Seçili oda, aralık değişimi sonrası dolu hale gelirse **seçim otomatik kaldırılmaz** — kullanıcı ne olduğunu görür ve kendi karar verir (BR-RB-20). |
| **IR-RB-03** | Seçilemez satırlar listede **aşağıya itilebilir** ancak gizlenemez. |
| **IR-RB-04** | Filtre uygulandığında **kaç odanın elendiği** okunabilir olmalıdır. |
| **IR-RB-05** | Oda satırı, kapasite ve özellik bilgisini **liste içinde** gösterir; detaya girmek gerekmez. |
| **IR-RB-06** | Oda seçimi tek etkileşimle **kaldırılabilir**; kaldırıldığında Konum alanının boşaldığı bildirilir (`15` IR-EVT-05). |
| **IR-RB-07** | Kapasite uyarısı, katılımcı sayısı değiştikçe **anında** güncellenir. |
| **IR-RB-08** | Seri özetindeki "kaç örnekte dolu" bilgisi, **hangi tarihlerde dolu** olduğunu görme yolu sunar. |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`.

| State | Davranış |
|---|---|
| **Loading (oda listesi)** | Müsaitlik hesaplanırken liste yapısı korunur; etkinlik formunun geri kalanı kullanılabilir kalır (ST-LOAD-01/04). |
| **Empty (hiç oda yok)** | Organizasyonda oda tanımlı değilse bu açıkça söylenir; boş liste sessizce gösterilmez. |
| **Empty (filtre sonucu)** | Filtre kaynaklı; kaç odanın elendiği ve temizleme yolu gösterilir (BR-RB-16, ST-EMPTY-02). |
| **Empty (görülebilir oda yok)** | Kullanıcının `Görebilir` yetkisi olan oda yoksa bu açıkça söylenir (`10` BR-PRM-09). |
| **Disabled (satır)** | Dolu, onay bekliyor veya yetkisiz. Sebep okunur (BR-RB-06). |
| **Error (çakışma)** | Engelleyici; birincil aksiyon pasif ve sebebi okunur (BR-RB-20, ST-DIS-04). |
| **Warning (kapasite)** | Engelleyici olmayan; birincil aksiyon aktif kalır (BR-RB-18, ST-VAL-05). |
| **Pending** | Oda "Onay bekliyor" durumunda; kalıcı rozet (ST-PEND-01/02). |

---

## 9. Validation

`11` ST-VAL-06 gereği sınıflandırma:

| ID | Kural | Sınıf |
|---|---|---|
| **V-RB-01** | Oda çakışması (BR-RB-20) | **Engelleyici** |
| **V-RB-02** | Bekleyen talep slotu bloke ediyor (BR-RB-21) | **Engelleyici** |
| **V-RB-03** | Kullanıcının rezervasyon yetkisi yok | **Engelleyici** — satır zaten seçilemez |
| **V-RB-04** | Kapasite yetersiz (BR-RB-18) | ⚠️ **Engelleyici olmayan uyarı** |
| **V-RB-05** | Oda pasife alınmış | **Engelleyici** — oda listede yok |
| **V-RB-07** | Onaylı odada eligible approver yok (`18` BR-APR-17b) | **Engelleyici** — rezervasyon oluşturulmaz |
| **V-RB-06** | Seride kısmi çakışma (BR-RB-26) | ⚠️ **Engelleyici olmayan, ancak açık seçim zorunlu** |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-RB-01** | Oda, form açıkken başka kullanıcı tarafından rezerve edilir | Kaydetme anındaki yeniden kontrol (BR-RB-23) çakışmayı yakalar; kullanıcıya açıkça bildirilir, veri korunur (`11` ST-ERR-03). |
| **EC-RB-02** | Oda, form açıkken pasife alınır | Kaydetmede engelleyici hata; kullanıcı başka oda seçer. |
| **EC-RB-03** | Kullanıcının rezervasyon yetkisi form açıkken kaldırılır | Kaydetmede engelleyici hata (`11` EC-ST-02); veri korunur. |
| **EC-RB-04** | Etkinlik tüm gün yapılır | Oda rezervasyonu **günün tamamını** kaplar; müsaitlik buna göre hesaplanır. |
| **EC-RB-05** | Çok günlü etkinliğe oda bağlanır | Rezervasyon **kesintisiz** olarak tüm aralığı kaplar; ara günlerde de oda dolu görünür. |
| **EC-RB-06** | Bekleyen talep reddedilir | Slot **serbest kalır** ve oda tekrar Müsait olur → `18-reservation-approval-spec.md`. |
| **EC-RB-07** | Aynı slota iki kullanıcı aynı anda talep gönderir | İlk talep slotu bloke eder (BR-RB-21); ikinci kullanıcı "Onay bekliyor" görür ve seçemez. Aynı slota ikinci talep oluşmaz. |
| **EC-RB-08** | Kapasite, oda seçildikten sonra yöneticice düşürülür | Mevcut rezervasyon etkilenmez (`13` EC-ROOM-06); uyarı yalnızca yeni seçimlerde çalışır. |
| **EC-RB-09** | Seride tüm örnekler dolu | Oda seçilemez; sebep "seçilen tarihlerin tümünde dolu" olarak gösterilir. |
| **EC-RB-10** | Onay gerektiren odada seri talebi kısmen çakışıyor | Ön kontrol çakışmayı yakalar (BR-RB-29a); özet gösterilir ve **talep gönderilmez** (BR-RB-29b). Kullanıcı çözdükten sonra kalan occurrence'lar için tek talep oluşur. |
| **EC-RB-11** | Etkinlik silinir | Rezervasyon düşer; bekleyen talep iptal edilir ve onaylayıcı bilgilendirilir (`15` BR-EVT-30). |
| **EC-RB-12** | Odanın onay ayarı, bekleyen talep varken kapatılır | Bekleyen talep **otomatik onaylanmaz** (`13` BR-ROOM-15); onaylayıcının kararına kalır. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | Seçilebilirlik matrisinin yetki ekseni (BR-PRM-06/07/08/09) |
| `11-system-states-spec.md` | Disabled sebebi, engelleyici/engelleyici olmayan ayrımı, pending |
| `13-rooms-spec.md` | **Tükettiği kaynak modeli:** kapasite, özellik, bina/kat, durum, onay bayrağı, müsaitlik verisi |
| `14-calendar-shell-spec.md` | Odalara Göre görünümünden başlayan akış; chip'te durum render'ı |
| `15-event-spec.md` | Oda alanı; Konum türetimi; seri kapsam seçimi |
| `17-scheduling-spec.md` | Katılımcı sayısı (kapasite karşılaştırması için) |
| `18-reservation-approval-spec.md` | **Onaya düşen rezervasyonun devamı** |

---

## 12. Responsive Expectations

Desktop-first (D-047). **Oda arama ve oda rezervasyonu mobil zorunlu akışlardandır.**

| ID | Kural |
|---|---|
| **RS-RB-01** | Oda seçici mobilde tam işlevsel olmalıdır: liste, durum, seçilemezlik sebebi ve filtreler. |
| **RS-RB-02** | Filtreler mobilde katlanabilir bir yüzeye alınabilir; **aktif filtre sayısı her zaman görünür** kalmalıdır (BR-RB-16). |
| **RS-RB-03** | Seçilemezlik sebebi mobilde **hover olmadan** okunabilir olmalıdır (`11` ST-DIS-03). |
| **RS-RB-04** | Oda satırında kapasite ve özellik bilgisi mobilde kısaltılabilir ancak kaybolmamalıdır (IR-RB-05). |

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Oda satırı dört bilgi taşıyor:** kimlik (ad, lokasyon) · nitelik (kapasite, özellikler) · müsaitlik durumu · seçilebilirlik sebebi. Bu yoğunluk mobilde de korunmalı (RS-RB-04).
- **İki ayrı "seçilemez" sebebi var** — dolu ve yetkisiz — ve bunlar farklı şeyler. Görsel olarak ayırt edilebilmeliler; kullanıcı "bekleyeyim mi, yetki mi isteyeyim?" sorusunu ayırt edebilmeli.
- **Üç müsaitlik durumu** (Müsait / Onay bekliyor / Rezerve) burada, `14-calendar-shell`'de ve `13-rooms`'ta aynı görsel dille görünmeli — `11` ST-PEND-02.
- **Progressive disclosure filtre yüzeyini değiştiriyor** (BR-RB-11): bina tanımlı olmayan bir organizasyonda filtre alanı iki eksene iner. Yerleşim buna esnek olmalı.
- **Seri özeti** (BR-RB-25) yeni bir bileşen: "N tarihten M'sinde müsait" + hangi tarihlerin dolu olduğunu görme yolu (IR-RB-08).
- Çakışma hatası, kapasite uyarısından **görsel olarak ayrılmalı** — biri engelliyor, diğeri engellemiyor (`11` ST-VAL-05).

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-RB-01 | Oda seçimi, önce işaretlenmesi gereken bir checkbox olmadan doğrudan yapılır. |
| AC-RB-02 | Oda listesi etkinliğin zaman aralığına göre gelir ve aralık değişince yeniden değerlendirilir. |
| AC-RB-03 | Seçili saatte dolu oda listede görünür, "Rezerve" olarak işaretlenir ve seçilemez. |
| AC-RB-04 | Rezervasyon yetkisi olmayan ama görülebilen oda listede görünür ve seçilemez. |
| AC-RB-05 | Her seçilemez satır sebebini hover gerektirmeden gösterir. |
| AC-RB-06 | Bina tanımlı olmayan organizasyonda bina ve kat filtreleri hiç render edilmez. |
| AC-RB-07 | Kapasite tanımsız odada kapasite uyarısı gösterilmez. |
| AC-RB-08 | Kapasite yetersizliği uyarı üretir ancak seçimi ve kaydetmeyi engellemez. |
| AC-RB-09 | Oda çakışması kaydetmeyi engeller ve birincil aksiyon sebebiyle pasif olur. |
| AC-RB-10 | Bekleyen bir rezervasyon talebi, o slotta odayı diğer kullanıcılar için seçilemez yapar. |
| AC-RB-11 | Çakışma mesajı, kullanıcının görme hakkı olmayan bir etkinliğin başlığını açıklamaz. |
| AC-RB-12 | Onay gerektiren oda seçildiğinde etkinlik oluşur ancak rezervasyon "Onay bekliyor" durumunda başlar ve başarı dili kullanılmaz. |
| AC-RB-19 | Talebi oluşturan dışında eligible approver yoksa onaylı odaya rezervasyon oluşturulmaz; engelleyici hata gösterilir. |
| AC-RB-13 | Seri etkinlikte oda seçilirken kaç örnekte müsait/dolu olduğu özetlenir. |
| AC-RB-14 | Kısmen dolu bir oda seçildiğinde kullanıcı açık bir seçim yapmadan kayıt tamamlanmaz. |
| AC-RB-15 | Onay gerektiren odaya yapılan seri rezervasyon tek bir talep oluşturur; onay kuyruğunda occurrence başına satır üretilmez. |
| AC-RB-17 | Seri talebi gönderilmeden önce tüm occurrence'larda çakışma, müsaitlik ve yetki kontrolü yapılır; kısmi problem çözülmeden talep gönderilmez. |
| AC-RB-18 | Kapasite uyarısı, uyarının sebebini sayısal olarak gösterir. |
| AC-RB-16 | Kaydetme anında çakışma yeniden kontrol edilir. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-RB-01 | Seçilemez odalar listede nerede? | **Görünür kalır, aşağı itilebilir; gizlenemez** (IR-RB-03) | D-026 ve D-031'in ortak ilkesi: oda kaybolmaz. Gizlemek "odam nerede?" sorusunu üretir |
| SR-RB-02 | Kapasite yetersizliği engelleyici mi? | **Hayır — güçlü uyarı, oda seçilebilir kalır, sebep açıkça gösterilir** (BR-RB-18) | Kapasite bir tahmindir; katılımcıların hepsi fiziksel gelmeyebilir. ⚠️ İleride organizasyon bazında strict capacity policy'ye genişletilebilir; **şu an kapsam dışı** |
| SR-RB-03 | Çakışma mesajı ne kadar açık? | **Etkinlik başlığı açıklanmaz** (BR-RB-22) | D-027/BR-PRM-11 free/busy'de detay yasağı koyuyor; çakışma mesajı bir sızıntı kanalı olamaz |
| SR-RB-04 | Seride kısmi çakışma | **Açık seçim zorunlu** (BR-RB-26) | Sessizce bazı örnekleri odasız bırakmak `11` ST-CORE-01 ihlali olur |
| SR-RB-05 | Seri onayı: örnek mi, seri mi? | **Seri bütün olarak tek talep**, ancak **gönderim öncesi tüm occurrence'lar kontrol edilir** (BR-RB-29/29a/29b) | D-034 "basit tutma" kısıtı; örnek bazında onay kuyruğu N kata çıkarır. Ön kontrol olmadan tek talep, onaylayıcıyı uygulanamaz bir talebi onaylamaya zorlar |
| SR-RB-06 | Aralık değişince seçili oda dolu olursa | **Otomatik kaldırılmaz** (IR-RB-02) | Sessiz kaldırma, kullanıcının odasız kaydetmesine yol açar; görünür hata daha güvenli |
