# 12 — Calendars Spec

**Cluster:** PC-03 · **Katman:** Foundation · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-037, D-049⚠, D-027, D-041, **D-064, D-065, D-066, D-067, D-068, D-069** · **Scope referansı:** `04-scope-closure.md` §PC-03
**rev.2 (2026-08-31):** Takvim sahipliği kapandı (D-064) · varsayılan takvim bağlayıcı hale geldi (D-065) · **Calendar Sharing V1 eklendi** (D-067) · §15 kaldırıldı (dört açık konu da kapandı)

---

## 1. Purpose

**Takvim**, Narbulut Takvim'de gerçek bir ürün varlığıdır: isim ve renk taşır, etkinlikler ona atanır, kullanıcı ona göre filtreler.

Bu spec üç işi yapar:
1. Takvim varlığını ve **sahipliğini** tanımlar.
2. **Renk kaynağını tekilleştirir.** Bugün renk en az üç kaynaktan geliyor — etkinlik tipi, özel takvim ve kullanıcının serbest seçimi — ve önceliği tanımsız (`UX-20`). Bu spec o karmaşayı bitirir.
3. **Takvim paylaşımını** tanımlar: sahibin takvimini organizasyon içindeki tek bir kullanıcıyla salt okunur olarak paylaşması (D-067).

---

## 2. Scope

### In Scope
- Takvim varlığı: **isim + renk + sahip** (D-064)
- **Varsayılan takvim** ve zorunlu takvim ataması (D-065)
- **Renk kaynağının tekilleştirilmesi**
- Takvim bazlı filtreleme ve sol rail'deki takvim listesi
- Takvim oluşturma / düzenleme / silme
- Filtre lejantı ile ızgara renklerinin eşleşmesi
- **Calendar Sharing V1** — tek seviyeli, salt okunur, organizasyon içi tekil kullanıcıya (D-067)
- Sahibin paylaşımı kaldırması; alıcının "Benimle paylaşılanlar" deneyimi
- Kullanıcı organizasyondan ayrılınca takvimlerin akıbeti (D-066)

### Out of Scope
- **"Toplantı" / "Etkinlik" tip ayrımı — kaldırıldı** (D-037)
- Kullanıcı tanımlı kategori/etiket sistemi *(D-037 — ileride ayrıca değerlendirilebilir)*
- ⚠️ **Paylaşımda kapsam dışı olanlar** (D-067): **grup paylaşımı** · **düzenleme/yönetme yetkisi** · **delegation** · **harici kullanıcıyla paylaşım** · **çapraz-organizasyon paylaşımı** · **public link** · free/busy için ayrı **sharing tier / subscription / calendar overlay permission**
- **Event-level privacy** — eklenmez (D-041, D-068)
- **Etkinlik başına serbest renk geçersiz kılma** *(spec-level recommendation SR-CAL-02)*
- Harici takvim aboneliği, ICS içe/dışa aktarma
- **Yeni admin calendar-management yüzeyi** (D-066)
- Oda erişim yetkileri — `10-permissions-spec.md`'in konusudur

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Takvim sahibi** | Takvimi oluşturan kullanıcı (D-064). Adlandırır, renklendirir, siler; etkinlikleri atar; **paylaşır ve paylaşımı kaldırır** |
| **Paylaşım alıcısı** | Kendisiyle takvim paylaşılan, aynı organizasyondaki kullanıcı. Takvimi **salt okunur** görür; kendi sidebar'ında görünürlüğünü açıp kapatır. **Düzenleyemez, yeniden paylaşamaz** |
| **Organizasyon yöneticisi** | Bu modülde **ayrıcalıklı bir rolü yoktur.** Takvim yönetimi son kullanıcıya aittir; ayrı bir admin calendar-management yüzeyi yoktur (D-066). Etkinliklere müdahale **event-level** modelle yapılır (D-039) |

---

## 4. Concepts / Entities

| Kavram | Tanım |
|---|---|
| **Takvim** | **İsim · renk · sahip** taşıyan etkinlik gruplama kaynağı (calendar source). **Bir kullanıcıya aittir; sahibi oluşturan kişidir** (D-064). Organizasyon context'i içinde yaşar (D-025). |
| **Varsayılan takvim** | Her kullanıcı için **otomatik oluşan, silinemez** takvim. Adı ve rengi değiştirilebilir. Takvim seçilmeden oluşturulan etkinlik buraya düşer (D-065). |
| **Takvim ataması** | Bir etkinliğin bir takvime bağlanması. ⚠️ **Zorunludur** — her etkinliğin tam olarak bir takvimi vardır (D-065). |
| **Renk** | Yönetilen bir paletten seçilen, takvime ait değer. **Etkinliğin görsel kimliğinin tek kaynağı.** |
| **Takvim filtresi** | Sol rail'de takvimlerin açılıp kapatılmasıyla ızgaranın daralması. |
| **Paylaşım (share)** | Sahip ile **tek bir alıcı kullanıcı** arasındaki, bir takvim üzerinde tanımlı **salt okunur detay erişimi** ilişkisi (D-067). |
| **Arşivlenmiş takvim** | Sahibi organizasyondan ayrılmış takvim. Etkinlikleri korunur, paylaşımları kaldırılmıştır, hiçbir sidebar'da görünmez (D-066). |

> **Terminoloji (D-067 sonrası):** İki takvim **türü** yoktur; tek tür vardır. Ancak arayüzde **iki bölüm** oluşur: kullanıcının **sahip olduğu** takvimler *(mevcut "Takvimlerim" dili korunabilir)* ve **kendisiyle paylaşılan** takvimler *("Benimle paylaşılanlar")*. Bu bir tür ayrımı değil, **sahiplik ayrımıdır**. Bkz. SR-CAL-05.

---

## 5. Business Rules

### 5.1 Takvim varlığı

| ID | Kural |
|---|---|
| **BR-CAL-01** | Bir takvim **isim · renk · sahip** taşır. Başka nitelik taşımaz. |
| **BR-CAL-02** | **Her takvim tam olarak bir kullanıcıya aittir; sahibi onu oluşturan kişidir** (D-064). Sahiplik devredilemez. ⚠️ Takvim **paylaşılabilir** — kurallar §5.6 (D-067). |
| **BR-CAL-03** | **Her kullanıcı için otomatik bir varsayılan takvim oluşur.** **Silinemez.** Adı ve rengi değiştirilebilir (D-065). |
| **BR-CAL-04** | Takvim sayısına ürün seviyesinde sınır konmaz. *(Teknik sınır gerekiyorsa spec dışıdır.)* |
| **BR-CAL-05** | Renk, **yönetilen bir paletten** seçilir; serbest renk kodu girilmez. Palet, `11-system-states-spec.md`'deki durum renkleriyle (Müsait / Onay bekliyor / Rezerve) **çakışmayacak** şekilde tanımlanır. |
| **BR-CAL-41** | **Takvim oluşturma yüzeyi iki alan taşır: ad ve renk.** Başka alan sorulmaz (BR-CAL-01). Ad, **kullanıcının kendi takvimleri içinde** benzersizdir; organizasyon geneli benzersizlik aranmaz — takvim kullanıcıya aittir (BR-CAL-02). *(1 Eylül 2026'da eklendi, SR-CAL-10.)* |
| **BR-CAL-42** | Ad ve renk düzenleme **aynı yüzeyi** kullanır; "yeniden adlandır" ve "rengi değiştir" ayrı akışlar değil, aynı formun odaklandığı alanlardır. **Varsayılan takvim de düzenlenebilir** (BR-CAL-03). |

### 5.2 Etkinlik ↔ takvim ilişkisi

| ID | Kural |
|---|---|
| **BR-CAL-06** | **Her etkinliğin tam olarak bir takvimi vardır** (D-065). Takvimsiz etkinlik yoktur; çoklu takvim ataması yoktur. |
| **BR-CAL-07** | **Quick Create takvim alanı içermez** (`15-event-spec.md`, D-038); oradan oluşturulan etkinlik **varsayılan takvime** düşer (D-065). Aynı kural detaylı formda takvim seçilmediğinde de geçerlidir. |
| **BR-CAL-08** | Etkinliğin takvimi sonradan değiştirilebilir. Değiştirildiğinde etkinliğin rengi **yeni takvimin rengine** döner. |
| **BR-CAL-09** | Takvim ataması **görünürlüğü kendiliğinden etkilemez.** Paylaşılmamış bir takvimde başka kullanıcılar takvim adını görmez; yalnızca free/busy görür (D-027, `10` BR-PRM-11). ⚠️ **Tek istisna:** paylaşılan takvim, **alıcı için** adıyla ve etkinlik detaylarıyla görünür (§5.6). |
| **BR-CAL-10** | Takvim ataması **yetkiyi etkilemez.** Kimin etkinliği düzenleyebileceği `15-event-spec.md`'de tanımlıdır (D-039). |

### 5.3 Renk kaynağının tekilleştirilmesi

| ID | Kural |
|---|---|
| **BR-CAL-11** | **Bir etkinliğin rengi, atandığı takvimin rengidir.** Tek kaynak budur. |
| **BR-CAL-12** | **Etkinlik tipi diye bir renk kaynağı yoktur** — "Toplantı" / "Etkinlik" ayrımı kaldırıldı (D-037). |
| **BR-CAL-13** | **Etkinlik başına renk geçersiz kılma yoktur.** Mevcut "Renk Değiştir" kontrolü kaldırılır (SR-CAL-02). |
| **BR-CAL-14** | **Filtre lejantındaki renk, ızgaradaki etkinlik rengiyle birebir aynıdır.** *(`UX-19` — bugün lejant yeşil/turuncu, chip'ler lacivert/gri.)* |
| **BR-CAL-15** | Rezervasyon durumu (Müsait / Onay bekliyor / Rezerve) **takvim renginden ayrı bir görsel eksende** taşınır; takvim rengini ezmez. Bkz. `11-system-states-spec.md` ST-PEND-02. |

### 5.4 Filtreleme

| ID | Kural |
|---|---|
| **BR-CAL-16** | Sol rail'de **iki bölüm** listelenir: kullanıcının **sahip olduğu** takvimler ve **kendisiyle paylaşılan** takvimler. Her takvim ayrı ayrı açılıp kapatılabilir (D-067). |
| **BR-CAL-17** | Kapatılan takvimin etkinlikleri **hiçbir görünümde** render edilmez (Günlük / Haftalık / Aylık / Odalara Göre). |
| **BR-CAL-18** | Takvim filtresi **kullanıcının kendi görünümünü** etkiler; veriyi veya başkalarının görünümünü etkilemez. Paylaşılan bir takvimi kapatmak **paylaşımı kaldırmaz** — yalnızca görünümü daraltır. |
| **BR-CAL-19** | Filtre durumu kullanıcı oturumları arasında **korunur**. *(Spec-level recommendation SR-CAL-03)* |
| **BR-CAL-20** | Tüm takvimler kapatıldığında ızgara boş görünür ve bu **filtre kaynaklı boş durum** olarak gösterilir — `11-system-states-spec.md` ST-EMPTY-02. |

### 5.5 Silme

| ID | Kural |
|---|---|
| **BR-CAL-21** | **Varsayılan takvim silinemez** (D-065, BR-CAL-03). Silme aksiyonu pasiftir ve sebebi okunur (`11` ST-DIS-02). |
| **BR-CAL-22** | ⚠️ **Bağlayıcı olan tek kural:** içinde etkinlik olan bir takvim silinirken **etkinlikler sessizce ve topluca silinemez.** Açık kullanıcı onayı olmadan etkinlik silinmesi hiçbir durumda varsayılan davranış değildir (ST-CORE-01, ST-DES-01). Hangi seçeneklerin sunulacağı → SR-CAL-06. |
| **BR-CAL-23** | Takvim silme yıkıcı işlemdir; **açık kullanıcı onayı gerektirir** ve etkilenecek etkinlik sayısını belirtir — `11-system-states-spec.md` ST-DES-01, ST-DES-02. ⚠️ Takvim **paylaşılmışsa** onay diyaloğu **kaç kişiyle paylaşıldığını** da belirtir; silme tüm paylaşımları kaldırır. |

### 5.6 Paylaşım (Calendar Sharing V1)

| ID | Kural |
|---|---|
| **BR-CAL-24** | **Yalnızca takvimin sahibi paylaşabilir** (D-064). Alıcı takvimi **yeniden paylaşamaz**. |
| **BR-CAL-25** | **Paylaşım hedefi: aynı organizasyondaki tekil bir kullanıcı** (D-025, D-067). **Grup paylaşımı yoktur.** Harici kullanıcı, başka organizasyon ve public link kapsam dışıdır. |
| **BR-CAL-26** | **Tek paylaşım seviyesi vardır: "Etkinlik detaylarını görebilir".** Kademeli seviye, "sadece müsaitlik" tier'ı, abonelik veya overlay izni **yoktur** (D-067). |
| **BR-CAL-27** | Paylaşım **salt okunurdur.** Alıcı etkinlikleri **oluşturamaz, düzenleyemez, silemez**; takvimin adını ve rengini **değiştiremez** (D-067, D-039). |
| **BR-CAL-28** | Paylaşım **takvimin tamamını** kapsar: mevcut **ve gelecekteki** tüm etkinlikler. Etkinlik bazında seçim yoktur (D-068). |
| **BR-CAL-29** | ⚠️ **Organizasyon içi free/busy modeli değişmez.** Paylaşım, D-027'nin üstüne **eklenen** bir detay erişimidir; free/busy'yi ne genişletir ne daraltır (`10` BR-PRM-11/12). |
| **BR-CAL-30** | Paylaşılan takvim alıcının sol rail'inde **"Benimle paylaşılanlar"** bölümünde görünür ve **sahibinin adıyla** ilişkilendirilir (BR-CAL-16). |
| **BR-CAL-31** | Paylaşılan takvim **kendi rengini korur** (BR-CAL-11). Alıcı rengi değiştiremez (BR-CAL-27). |
| **BR-CAL-32** | Alıcı, paylaşılan takvimin **görünürlüğünü kendi sidebar'ında açıp kapatabilir**; bu paylaşımı kaldırmaz (BR-CAL-18). |
| **BR-CAL-33** | **Sahip paylaşımı istediği zaman kaldırabilir; kaldırma anında etkilidir.** Alıcı takvimi ve etkinliklerini o andan itibaren göremez. |
| **BR-CAL-34** | Alıcı, kendisiyle paylaşılan bir takvimi **kendi tarafından kaldırabilir** *(paylaşımı reddetme)*. Bu, paylaşım kaydını sonlandırır. *(SR-CAL-07)* |
| **BR-CAL-35** | Aynı takvim + aynı alıcı için **birden fazla paylaşım kaydı bulunamaz.** |
| **BR-CAL-36** | Sahip, takvimi **kendisiyle paylaşamaz.** |
| **BR-CAL-37** | **Paylaşım ve paylaşım kaldırma bildirim üretir** — `19-notifications-spec.md` N-CAL-01 / N-CAL-02 (`19` BR-NOT-06). |
| **BR-CAL-38** | ⚠️ **Zorunlu açıklama:** paylaşım yüzeyi, paylaşımın **mevcut ve gelecekteki** etkinlik detaylarını kapsadığını **açıkça** belirtir (D-068). Bu, özellikle **varsayılan takvim** paylaşılırken kritiktir — Quick Create etkinlikleri oraya düşer (D-065). |
| **BR-CAL-39** | **Event-level privacy yoktur** (D-041, D-068). Hassas bir etkinlik görünmemeliyse kullanıcı onu **paylaşılmayan başka bir takvime** taşır. |
| **BR-CAL-40** | Sahibi organizasyondan ayrılırsa takvimleri **arşivlenir** ve **tüm aktif paylaşımları kaldırılır** (D-066). |
| **BR-CAL-43** | ⚠️ **Paylaşım giriş noktası, sahibin takvim satırında bulunur ve keşfedilebilir olmalıdır.** Yalnızca bir taşma menüsünün içinde saklı kalamaz. **Paylaşılmış bir takvim satırda görünür bir iz taşır** — en az kaç kişiyle paylaşıldığı — ve bu iz **paylaşım yüzeyine götürür**. *(1 Eylül 2026'da eklendi, SR-CAL-10.)* |
| **BR-CAL-44** | Paylaşım izi **yalnızca sahibe** gösterilir. Alıcı tarafında karşılığı `BR-CAL-30`'dur (sahibin adı) — alıcı, takvimin başka kaç kişiyle paylaşıldığını görmez. |

---

## 6. User Flows

### F-CAL-1 · Takvim oluşturma
```
Sol rail → Takvimlerim → Yeni takvim
→ isim gir → paletten renk seç
→ Oluştur
→ takvim listeye eklenir ve açık (görünür) gelir
→ başarı bildirimi (ST-SUC-01)
```
> **Not:** Bu akış bugün **kırık** (`FN-01` — `POST /organization/transactions/calendar` HTTP 500, sessiz başarısızlık). Backend düzeltmesi bu çalışmanın kapsamında değil (A-10); ancak `11-system-states-spec.md` ST-CORE-01 gereği **hatanın kullanıcıya görünür olması** kapsamdadır.

### F-CAL-2 · Etkinliği başka takvime taşıma
```
Etkinlik detayı → Düzenle → Takvim alanı → başka takvim seç → Kaydet
→ etkinliğin rengi yeni takvimin rengine döner (BR-CAL-08)
```

### F-CAL-3 · Takvim silme (içinde etkinlik varken)
```
Takvim → Sil
→ onay diyaloğu: "Bu takvimde N etkinlik var."
→ kullanıcı ne olacağını açıkça seçer   [önerilen seçenekler: SR-CAL-06]
→ onayla → sonuç bildirilir
⚠️ Etkinliklerin topluca silinmesi hiçbir durumda varsayılan/otomatik davranış değildir (BR-CAL-22)
```

### F-CAL-5 · Takvim paylaşma *(sahip)*
```
Sol rail → takvim → Paylaş
→ organizasyon içinden bir kullanıcı seç          [tekil kullanıcı — BR-CAL-25]
→ ⚠️ açıklama okunur (BR-CAL-38):
   "Bu takvimdeki mevcut ve gelecekteki etkinlik detayları
    paylaştığınız kişi tarafından görülebilir."
→ Paylaş
→ başarı bildirimi + alıcıya bildirim (N-CAL-01)
→ alıcının sidebar'ında "Benimle paylaşılanlar" altında belirir
```

### F-CAL-6 · Paylaşımı kaldırma *(sahip)*
```
Sol rail → takvim → Paylaşım yönetimi
→ kiminle paylaşıldığı listelenir
→ [Kaldır] → onay
→ kaldırma ANINDA etkili (BR-CAL-33)
→ alıcıya bildirim (N-CAL-02); takvim sidebar'ından kalkar
```

### F-CAL-4 · Takvime göre filtreleme
```
Sol rail → Takvimlerim → bir takvimi kapat
→ o takvimin etkinlikleri tüm görünümlerden kalkar
→ akordeon kapalıyken bile kaç takvimin gizli olduğu okunabilir (IR-CAL-03)
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-CAL-01** | Takvim listesindeki her satır kendi rengini taşır; renk ile isim aynı satırda okunur. |
| **IR-CAL-02** | Takvimi açıp kapatmak **tek tıklık** bir eylemdir; menü içine gizlenmez. |
| **IR-CAL-03** | Sol rail akordeonu kapalıyken **kaç takvimin gizlendiği** okunabilir olmalıdır. *(`UX-14` — bugün akordeon kapalıyken filtre durumu görünmüyor.)* |
| **IR-CAL-04** | "Tümünü göster / tümünü gizle" toplu eylemi bulunur. *(`UX-22`)* |
| **IR-CAL-05** | Takvim seçici (etkinlik formunda) takvimin **rengini de** gösterir; yalnızca isim yeterli değildir. |
| **IR-CAL-06** | Renk paleti seçiminde renkler **isimleriyle birlikte** erişilebilir olmalıdır; yalnızca renge dayalı ayrım erişilebilirlik açısından yetersizdir. |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`. Bu modüle özgü olanlar:

| State | Davranış |
|---|---|
| **Empty (takvim listesi)** | Hiç takvim yoksa liste, takvimin ne işe yaradığını açıklayan bir metin ve oluşturma yolu taşır. *(`UX-16` — bugün "Takvimlerim" yalnızca bir ekleme butonu gösteriyor, açıklama yok.)* |
| **Empty (filtre kaynaklı)** | Tüm takvimler kapatılmışsa ızgara boş durumu **filtre sebebini** söyler ve temizleme yolu sunar (BR-CAL-20). |
| **Error (oluşturma)** | Takvim oluşturma başarısızsa form kapanmaz, veri korunur, hata görünür (ST-ERR-03, ST-CORE-01). Bu, `FN-01`'in doğrudan karşılığıdır. |
| **Disabled (silme)** | **Varsayılan takvimin** silme aksiyonu pasiftir; sebep okunur: *"Varsayılan takvim silinemez"* (BR-CAL-21, ST-DIS-02). |
| **Empty (paylaşılanlar)** | Kullanıcıyla hiç takvim paylaşılmamışsa **"Benimle paylaşılanlar" bölümü gösterilmez** — boş bölüm render edilmez. *(SR-CAL-08)* |
| **Shared — salt okunur** | Paylaşılan takvimin etkinliklerinde düzenleme aksiyonları **gösterilmez veya sebebiyle pasiftir** (BR-CAL-27, ST-DIS-01/02). Takvim satırı sahibinin adını taşır (BR-CAL-30). |
| **Shared — kaldırıldı** | Paylaşım kaldırıldığında takvim alıcının sidebar'ından **anında** kalkar; alıcı bildirimle haberdar edilir (BR-CAL-33, N-CAL-02). |
| **Arşivlenmiş** | Sahibi organizasyondan ayrılmış takvim hiçbir sidebar'da görünmez; etkinlikleri korunur (BR-CAL-40, D-066). |

---

## 9. Validation

| ID | Kural | Davranış |
|---|---|---|
| **V-CAL-01** | Takvim adı zorunludur | Alan altı hata; kaydetme engellenir |
| **V-CAL-02** | Takvim adı, kullanıcının gördüğü takvim listesi içinde benzersiz olmalıdır | Alan altı hata; kaydetme engellenir |
| **V-CAL-03** | Renk zorunludur | Bir renk **önceden seçili gelir**; boş bırakılamaz |
| **V-CAL-04** | Takvim adı uzunluk sınırı | Sınır aşılırsa alan altı hata. *(Sayısal sınır FAZ 6/7'de netleşir)* |
| **V-CAL-05** | Paylaşım hedefi **aynı organizasyondan tekil bir kullanıcı** olmalıdır (BR-CAL-25) | **Engelleyici.** Grup, harici kullanıcı ve organizasyon dışı hesaplar seçicide **listelenmez** |
| **V-CAL-06** | Sahip takvimi **kendisiyle paylaşamaz** (BR-CAL-36) | **Engelleyici.** Sahip seçicide listelenmez |
| **V-CAL-07** | Aynı takvim + aynı alıcı **iki kez paylaşılamaz** (BR-CAL-35) | Sessiz — zaten paylaşılmış kullanıcı seçicide "paylaşıldı" olarak işaretlenir |
| **V-CAL-08** | **Arşivlenmiş takvim paylaşılamaz** (BR-CAL-40) | **Engelleyici** — takvim zaten hiçbir yüzeyde görünmez |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-CAL-01** | Kullanıcı iki takvime aynı rengi seçer | **İzin verilir.** Renk benzersizliği zorunlu değildir; kullanıcı kendi görsel düzenini kurar. Ancak seçicide uyarı gösterilebilir. |
| **EC-CAL-02** | Etkinliğin atandığı takvim silinir *(taşıma seçildi)* | Etkinlik hedef takvime geçer ve **rengi değişir** (BR-CAL-08). Kullanıcıya bu sonuç bildirilir. |
| **EC-CAL-03** | **Takvim sahibi** organizasyondan çıkarılır | Takvimleri **arşivlenir**, etkinlikleri **korunur**, **tüm aktif paylaşımları kaldırılır**, hiçbir sidebar'da görünmez (D-066, BR-CAL-40). Etkinliklere müdahale **event-level** admin modeliyle devam eder (D-039, `15` EC-EVT-02). ⚠️ **Yeni admin calendar-management yüzeyi açılmaz.** |
| **EC-CAL-08** | **Paylaşım alıcısı** organizasyondan çıkarılır | Paylaşım kaydı düşer; sahip listede bu kişiyi artık görmez. Sahibe ayrıca bildirim gitmez. *(SR-CAL-09)* |
| **EC-CAL-09** | Paylaşılan takvim **silinir** | Silme onayı **kaç kişiyle paylaşıldığını** belirtir (BR-CAL-23); silme tüm paylaşımları kaldırır ve alıcılar bildirim alır (N-CAL-02). |
| **EC-CAL-10** | Alıcı, paylaşılan takvimdeki bir etkinliğe **davetlidir** | İki erişim yolu çakışmaz; etkinlik zaten görünür. Paylaşımdan **düzenleme hakkı türemez** — yetki `15` D-039'a tabidir (BR-CAL-27). |
| **EC-CAL-11** | Sahip, paylaşılan takvimdeki bir etkinliği **başka takvime taşır** | Etkinlik hedef takvimin paylaşım durumuna tabi olur. Paylaşılmayan bir takvime taşınırsa alıcı **artık göremez** — D-068'in öngördüğü gizlilik mekanizması budur. |
| **EC-CAL-12** | Paylaşım kaldırıldığı anda alıcı takvimi açık tutuyor | Görünüm **anında** güncellenir, alıcı bildirimle haberdar edilir (BR-CAL-33). Sessiz kaybolma olmaz (`11` ST-CORE-01). |
| **EC-CAL-04** | Kullanıcı tüm takvimlerini kapatır | Izgara boş; filtre kaynaklı boş durum gösterilir (BR-CAL-20). Bu bir hata değildir. |
| **EC-CAL-05** | Takvim oluşturma isteği başarısız *(mevcut HTTP 500 senaryosu)* | Form **kapanmaz**, girilen isim ve renk korunur, hata görünür kılınır, tekrar dene yolu sunulur. `FN-01`'in çözümü budur. |
| **EC-CAL-06** | Bir etkinlik, kullanıcının kapattığı bir takvime aitken davet/güncelleme alır | Bildirim yine üretilir — filtre görünümü etkiler, bildirimi değil (BR-CAL-18). |
| **EC-CAL-07** | Rezervasyon durumu rozeti ile takvim rengi görsel olarak yarışır | Durum rozeti takvim renginden **ayrı eksende** taşınır (BR-CAL-15); ikisi aynı görsel kanalı kullanamaz. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `11-system-states-spec.md` | Boş, hata, yıkıcı işlem ve disabled davranışı |
| `10-permissions-spec.md` | Free/busy tabanı (BR-PRM-11/12) — paylaşım bunun **üstüne** eklenir. ⚠️ Paylaşım **yeni permission tipi yaratmaz**; oda yetki modeline dokunmaz |
| `14-calendar-shell-spec.md` | Sol rail'in iki bölümü, paylaşılan takvim render'ı ve **arama kapsamı** (D-069); renk kurallarını **buradan tüketir** |
| `15-event-spec.md` | Etkinliğin takvim alanı; **varsayılan takvim ataması** (D-065); düzenleme yetkisi paylaşımdan türemez (D-039) |
| `17-scheduling-spec.md` | Free/busy müsaitlik okuması **paylaşımdan etkilenmez** (BR-CAL-29) |
| `19-notifications-spec.md` | **N-CAL-01 / N-CAL-02** paylaşım bildirimleri (BR-CAL-37) |

---

## 12. Responsive Expectations

Desktop-first (D-047). Mobilde:
- Takvim listesi ve filtreleme **erişilebilir olmalıdır** — "etkinlikleri görüntüleme" ve "günler arası gezinme" mobil zorunlu akışlar arasında, filtre bu akışın parçası
- Takvim oluşturma/düzenleme mobilde birincil akış değildir; erişilebilir olması yeterlidir
- Sol rail mobilde katlanabilir bir yüzeye dönüşebilir; IR-CAL-03'ün "kaç takvim gizli" bilgisi bu durumda daha da kritiktir

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Renk paleti iki kısıtla tasarlanmalı:** yeterli sayıda ayırt edilebilir takvim rengi **ve** rezervasyon durumu renkleriyle çakışmama (BR-CAL-05, BR-CAL-15). Bu, palet tasarımının en önemli girdisidir.
- **Renk tek başına anlam taşıyıcı olamaz** (IR-CAL-06) — erişilebilirlik gereği renk + metin birlikte çalışmalı.
- Filtre lejantı ile ızgara chip'inin **aynı renk değerini** kullandığı görsel olarak kanıtlanmalı (BR-CAL-14).
- Sol rail'de takvim listesi, oda listesi ve filtreler yan yana yaşıyor; **hiyerarşinin karışmaması** gerekiyor (`IA-02` — "Odalar" bugün iki farklı anlamda iki yerde).

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-CAL-01 | Oluşturulan takvim listede görünür ve etkinliklere atanabilir hale gelir. |
| AC-CAL-02 | Quick Create takvim alanı içermez; oradan oluşturulan etkinlik **varsayılan takvime** atanır. |
| AC-CAL-03 | Bir etkinliğin rengi, atandığı takvimin rengidir; başka hiçbir kaynak rengi belirlemez. |
| AC-CAL-04 | Arayüzde etkinlik başına renk değiştirme kontrolü bulunmaz. |
| AC-CAL-05 | Filtre lejantındaki renk ile ızgaradaki etkinlik rengi aynıdır. |
| AC-CAL-06 | Etkinliğin takvimi değiştirildiğinde rengi yeni takvimin rengine döner. |
| AC-CAL-07 | Kapatılan takvimin etkinlikleri hiçbir görünümde render edilmez. |
| AC-CAL-08 | İçinde etkinlik olan takvim silinirken etkinlik sayısı belirtilir ve etkinlikler **açık kullanıcı onayı olmadan silinmez**. |
| AC-CAL-09 | Takvim oluşturma başarısız olursa form kapanmaz, veri korunur ve hata görünür olur. |
| AC-CAL-10 | **Paylaşılmamış** bir takvimdeki etkinliğin hangi takvime ait olduğunu başka kullanıcı göremez. |
| AC-CAL-11 | Sol rail akordeonu kapalıyken kaç takvimin gizli olduğu okunabilir. |
| AC-CAL-12 | Takvim rengi ile rezervasyon durumu göstergesi aynı görsel kanalı kullanmaz. |
| AC-CAL-13 | Her kullanıcının otomatik oluşan, **silinemez** bir varsayılan takvimi vardır; adı ve rengi değiştirilebilir. |
| AC-CAL-14 | Takvimsiz etkinlik oluşturulamaz; her etkinliğin tam olarak bir takvimi vardır. |
| AC-CAL-15 | Bir takvim yalnızca **sahibi** tarafından, yalnızca **aynı organizasyondaki tekil bir kullanıcıyla** paylaşılabilir. |
| AC-CAL-16 | Paylaşım seçicisinde grup, harici kullanıcı ve sahibin kendisi listelenmez. |
| AC-CAL-17 | Paylaşılan takvim alıcıda **salt okunurdur**: etkinlik oluşturma/düzenleme/silme ve takvim adı/rengi değiştirme mümkün değildir. |
| AC-CAL-18 | Paylaşılan takvim alıcının **"Benimle paylaşılanlar"** bölümünde, sahibinin adıyla ve **kendi rengiyle** görünür. |
| AC-CAL-19 | Alıcı paylaşılan takvimin görünürlüğünü açıp kapatabilir; bu paylaşımı kaldırmaz. |
| AC-CAL-20 | Sahip paylaşımı kaldırdığında alıcının erişimi **anında** sona erer ve alıcı bildirim alır. |
| AC-CAL-21 | Paylaşım yüzeyi, paylaşımın **mevcut ve gelecekteki** etkinlik detaylarını kapsadığını açıkça belirtir. |
| AC-CAL-22 | Arayüzde etkinlik bazında gizlilik seçeneği bulunmaz. |
| AC-CAL-23 | Sahibi organizasyondan ayrılan takvim arşivlenir, paylaşımları kaldırılır ve hiçbir sidebar'da görünmez; etkinlikleri silinmez. |
| AC-CAL-24 | Paylaşım ve paylaşım kaldırma bildirim üretir. |

---

## 15. *(Kaldırıldı)*

> ✅ Bu bölüm **FAZ 4'te dört açık konuyu** taşıyordu (§15-R1…R4). **Dördü de kapandı:**
> **R1** takvim sahipliği → **D-064** *(takvim bir kullanıcıya aittir; sahibi oluşturandır)*
> **R2** varsayılan takvim → **D-065** *(otomatik oluşur, silinemez)*
> **R3** atama zorunluluğu → **D-065** *(zorunlu; her etkinliğin bir takvimi vardır)*
> **R4** kullanıcı organizasyondan ayrılırsa → **D-066** *(arşivlenir, paylaşımlar kaldırılır)*
>
> Kurallar §5'e taşındı. Bu spec'te artık **açık integration/domain konusu yoktur.**

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| ~~SR-CAL-01~~ | ~~Takvimsiz etkinliğin rengi~~ | ⛔ **GEÇERSİZ — D-065 ile supersede edildi.** Takvimsiz etkinlik artık yoktur (BR-CAL-06); her etkinlik varsayılan takvime düşer | — |
| SR-CAL-02 | "Renk Değiştir" kontrolü korunsun mu? | **Kaldırılır** (BR-CAL-13) | `UX-20`'nin kökü bu: üç çakışan renk kaynağı. Ayrıca `UX-25` — bu kontrol bugün asıl alan "Konu"nun üstünde birincil buton olarak duruyor |
| SR-CAL-03 | Filtre durumu oturumlar arası korunsun mu? | **Evet** (BR-CAL-19) | Her girişte filtreyi yeniden kurmak sürtünme; benchmark'ta takvim seçimleri kalıcı `[I]` |
| SR-CAL-04 | Aynı renk iki takvimde kullanılabilir mi? | **Evet, izin verilir** (EC-CAL-01) | Zorunlu benzersizlik, çok takvimli kullanıcıyı gereksiz kısıtlar |
| SR-CAL-05 | Kişisel/organizasyonel takvim ayrımı | **Tek takvim türü var; arayüzde iki bölüm var** — sahip olunanlar *("Takvimlerim")* ve paylaşılanlar *("Benimle paylaşılanlar")* | Bu bir **tür** ayrımı değil, **sahiplik** ayrımıdır (D-064, D-067) |
| SR-CAL-06 | Takvim silinirken etkinliklere ne olur? | ✅ **KARARA BAĞLANDI (1 Eylül 2026):** onay diyaloğu **açık seçim** sunar — *etkinlikleri başka takvime taşı* **veya** *etkinlikleri de sil*. **Taşıma önce ve varsayılan olarak** sunulur; taşınacak başka takvim yoksa seçenek pasiftir ve sebebi okunur. Etkinlik yoksa seçim hiç gösterilmez. Etkinlikler silinirse bağlı rezervasyon ve talepler `Cancelled` olur (`18` BR-APR-31) | FAZ 3'te açık bırakılmıştı; `BR-CAL-22` yalnızca sessiz toplu silmeyi yasaklıyordu, hangi seçeneklerin sunulacağını söylemiyordu. Ürün sahibi taşımayı varsayılan seçti: veri kaybı geri alınamaz, taşıma alınabilir |
| SR-CAL-10 | Paylaşım nasıl keşfedilir? | **Satırda paylaşım izi + `⋯` menüsü birlikte** (BR-CAL-43/44) | Paylaşım yüzeyi vardı ama yalnızca düşük kontrastlı bir `⋯` ikonunun arkasındaydı ve **paylaşılmış olma durumu hiçbir yerde görünmüyordu**. Alıcı tarafı ("Benimle paylaşılanlar") adlandırılmış ve görünürken veren tarafın saklı olması asimetriydi. Alternatif *(başlığa ayrı eylem)* rail'i kalabalıklaştırırdı |
| SR-CAL-07 | Alıcı paylaşımı kendi tarafından kaldırabilir mi? | **Evet** (BR-CAL-34) | İstenmeyen bir paylaşımı kabul etmeye zorlanmak sidebar'ı kirletir; alıcının çıkış yolu olmalı |
| SR-CAL-08 | "Benimle paylaşılanlar" boşken | **Bölüm hiç gösterilmez** | Boş bir bölüm sürekli görünür yer kaplar; `13` BR-ROOM-06'nın progressive disclosure ilkesiyle aynı mantık |
| SR-CAL-09 | Alıcı organizasyondan ayrılırsa sahip bilgilendirilir mi? | **Hayır** (EC-CAL-08) | Sahibin eylemi değil ve aksiyon gerektirmiyor; `19` BR-NOT-07 gürültü kontrolüyle tutarlı |
