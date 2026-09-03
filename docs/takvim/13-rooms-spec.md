# 13 — Rooms Spec

**Cluster:** PC-08 + PC-14'ün oda arama kısmı · **Katman:** Foundation · **Durum:** ✅ FAZ 4 FINAL
**Bağlayıcı kararlar:** D-028, D-030, D-032, D-034, D-035(c), D-042, D-048 · **Scope referansı:** `04-scope-closure.md` §PC-08, §PC-14

---

## 1. Purpose

Oda, Narbulut Takvim'in **kaynak (resource) varlığıdır**. Bu spec odanın veri modelini, yönetim yüzeyini ve aranabilirliğini tanımlar.

Bu bir **foundation** spec'idir: değeri kendi ekranında değil, mümkün kıldığı deneyimlerde ölçülür. Benchmark'ın en net dersi burada geçerli — *oda arama deneyimi, oda veri modelinin doğrudan fonksiyonudur.* Microsoft'un dokümanı, kapasite/kat verisi doldurulmazsa Room Finder filtrelerinin çalışmadığını açıkça yazıyor `[O]`.

**Mümkün kıldıkları:** `16-room-booking-spec.md` (filtreleme, müsaitlik, çakışma) · `18-reservation-approval-spec.md` (onay bayrağı ve onaylayıcı) · `14-calendar-shell-spec.md` ("Odalara Göre" görünümü)

---

## 2. Scope

### In Scope
- Oda veri modeli: ad · açıklama · **durum (aktif/pasif)** · **kapasite** · **özellikler/donanım**
- **Opsiyonel Bina + Kat** hiyerarşisi ve progressive disclosure
- **Oda × zaman müsaitlik sorgusu** (verinin kendisi; sunumu `16-room-booking-spec.md`)
- **Tek ekran, bölümlü oluşturma/düzenleme formu** — sihirbaz kaldırılır
- Oda listesi: arama, sıralama, satır aksiyonları, boş durum
- **"Rezervasyon onayı gerekli" bayrağı + onaylayıcı kullanıcı/grup** *(alanlar burada; akış `18-reservation-approval-spec.md`'de)*
- Oda erişim yapılandırmasının forma yerleşimi *(kurallar `10-permissions-spec.md`'de)*

### Out of Scope
- Serbest çoklu etiket / genişletilmiş taxonomy (D-028, D-048)
- Oda fotoğrafı
- **Maksimum rezervasyon süresi · önden rezervasyon penceresi · oda mesai penceresi** (D-035c)
- Analytics / doluluk metadata'sı
- Kat planı, harita, oda görselleştirmesi
- Oda öneri motoru → `16-room-booking-spec.md` out of scope
- Erişim **kuralları** → `10-permissions-spec.md`

---

## 3. Actors

| Aktör | Bu modüldeki rolü |
|---|---|
| **Organizasyon yöneticisi** | Oda oluşturur, düzenler, pasife alır, siler; kapasite/özellik/lokasyon tanımlar; erişim ve onay yapılandırmasını yapar |
| **Normal kullanıcı** | Odaları listeler ve arar (yetkisi ölçüsünde, `BR-PRM-06/09`); oda bilgisini okur. **Oda oluşturamaz veya düzenleyemez.** |

> **Oda onaylayıcısı** bu modülde bir *alan değeri* olarak tanımlanır; aktör olarak `18-reservation-approval-spec.md`'de yaşar (D-042).

---

## 4. Concepts / Entities

### 4.1 Oda

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| **Ad** | metin | ✅ | Organizasyon içinde benzersiz (V-ROOM-02) |
| **Açıklama** | metin | — | Serbest metin |
| **Durum** | `Aktif` / `Pasif` | ✅ | Varsayılan `Aktif` |
| **Kapasite** | sayı | — | Kişi sayısı (D-048) |
| **Özellikler** | çoklu seçim | — | Yönetilen sınırlı setten (§4.3) |
| **Bina** | referans | — | Opsiyonel (D-028) |
| **Kat** | referans | — | Opsiyonel; yalnızca Bina seçiliyse anlamlı |
| **Erişim yapılandırması** | 2 kural | ✅ | `10-permissions-spec.md` BR-PRM-01 |
| **Rezervasyon onayı gerekli** | anahtar | ✅ | Varsayılan **kapalı** (SR-ROOM-04) |
| **Onaylayıcılar** | kullanıcı/grup listesi | koşullu | Yalnızca onay açıkken; açıkken zorunlu (V-ROOM-05) |

### 4.2 Bina ve Kat

| Kavram | Tanım |
|---|---|
| **Bina** | Ad taşıyan opsiyonel konum varlığı. Organizasyona aittir. |
| **Kat** | Bir binaya ait, **okunabilir etiket** taşıyan konum varlığı (ör. "Zemin", "Bodrum", "3. Kat"). |

> **Progressive disclosure (D-028):** Organizasyonda hiç bina tanımlı değilse oda formunda Bina/Kat alanları **gösterilmez** ve oda listesinde/oda seçicide **bu filtreler hiç render edilmez**.

### 4.3 Oda özellikleri

**Yönetilen, sınırlı bir set** (D-048). İlk kapsam önerisi:
`Projeksiyon / Ekran` · `Video konferans` · `Beyaz tahta` · `Erişilebilirlik`

> Tam liste Product Spec sürecinde netleşecek (D-048). **Serbest etiket girişi yoktur** — kullanıcı yeni özellik yazamaz; set organizasyon seviyesinde yönetilir.

### 4.4 Oda müsaitliği

| Kavram | Tanım |
|---|---|
| **Müsaitlik sorgusu** | Bir oda + bir zaman aralığı için odanın durumunu döndüren sorgu. |
| **Müsaitlik durumu** | Üç değer: **Müsait · Onay bekliyor · Rezerve** (D-036). |

---

## 5. Business Rules

### 5.1 Oda modeli

| ID | Kural |
|---|---|
| **BR-ROOM-01** | Oda, organizasyona aittir (D-025). Başka organizasyondan görülemez veya rezerve edilemez. |
| **BR-ROOM-02** | Oda adı organizasyon içinde benzersizdir. |
| **BR-ROOM-03** | **Kapasite ve özellikler opsiyoneldir**, ancak tanımlıysa `16-room-booking-spec.md`'de filtre olarak kullanılır. Tanımlı değilse ilgili filtre **gösterilmez**. |
| **BR-ROOM-04** | **Kat yalnızca bir binaya bağlı tanımlanır.** Binasız kat olamaz. |
| **BR-ROOM-05** | Bir odaya kat atanabilmesi için önce bina atanmış olmalıdır. |
| **BR-ROOM-06** | Organizasyonda hiç bina tanımlı değilse Bina/Kat alanları ve filtreleri arayüzde **hiç görünmez** (D-028 progressive disclosure). |
| **BR-ROOM-07** | **Pasif oda** yeni rezervasyonlarda seçilemez; oda seçicilerinde görünmez. Mevcut ve gelecekteki rezervasyonları **etkilenmez**. |
| **BR-ROOM-08** | Pasif oda, yönetim listesinde görünür ve tekrar aktif edilebilir. |
| **BR-ROOM-29** | **Yeni oda, kaydedilene kadar taslaktır.** Oluşturma, düzenlemeyle **aynı formu** kullanır (sihirbaz yoktur, §2). Taslak listede ayrı bir satır olarak görünür ancak **kaydedilmeden oda listesine, oda seçicilere veya izin tablosuna girmez**. *(1 Eylül 2026'da eklendi, SR-ROOM-09.)* |
| **BR-ROOM-30** | **Bina, oda formundaki lokasyon alanından oluşturulur.** Ayrı bir bina yönetim ekranı **yoktur**. Bina adı organizasyon içinde benzersizdir; aynı adla ikinci bina oluşturulmaz, mevcut olan seçilir. ⚠️ Kat **serbest metindir** ve `BR-ROOM-04` gereği yalnız bina atanmışken girilebilir. |
| **BR-ROOM-31** | ⚠️ **Rezervasyon kaydı bulunan oda silinemez.** Silme aksiyonu pasiftir ve sebebi **hover gerektirmeden** okunur (`11` ST-DIS-02); kullanıcıya **pasife alma** yolu gösterilir (BR-ROOM-07/08). Hiç rezervasyon kaydı olmayan oda silinebilir; işlem açık onay ister (`11` ST-DES-01). *(Rezervasyon kaydı = geçmiş, iptal ve reddedilenler dâhil; kayıt silinirse denetim izi kopar — `18` BR-APR-43.)* |

### 5.2 Erişim ve onay yapılandırması

| ID | Kural |
|---|---|
| **BR-ROOM-09** | Her odanın iki erişim kuralı vardır; kurallar `10-permissions-spec.md` BR-PRM-01…BR-PRM-05'e tabidir. Bu spec yalnızca **formdaki yerleşimini** tanımlar. |
| **BR-ROOM-10** | Yeni odada her iki erişim kuralı da **"Tüm kullanıcılar"** değerindedir (D-030, BR-PRM-03). |
| **BR-ROOM-11** | **"Rezervasyon onayı gerekli"** anahtarı oda seviyesindedir ve varsayılan olarak **kapalıdır**. |
| **BR-ROOM-12** | ⚠️ **INVARIANT:** Onay açıkken **en az bir geçerli onaylayıcı** (kullanıcı veya grup) tanımlı olmak zorundadır. Onay açık + onaylayıcı boş bir oda **kaydedilemez** (V-ROOM-05). |
| **BR-ROOM-12a** | Onay açıkken **son onaylayıcı kaldırılamaz**; işlem engellenir. Kullanıcı ya yeni onaylayıcı ekler ya onayı kapatır. |
| **BR-ROOM-12b** | Onay kapatıldığında onaylayıcı zorunluluğu kalkar; mevcut onaylayıcı kayıtları korunabilir. |
| **BR-ROOM-13** | Onaylayıcı, **yalnızca o odanın** onaylayıcısıdır. Sistem geneli approver rolü yoktur (D-042). |
| **BR-ROOM-32** | ⭐ Oda ekranı iki sekmedir: **Ayarlar** (yapılandırma) ve **Takvim ve talepler** (işletme). İkisi aynı anda görünmez; alt çubuk yalnız Ayarlar'dadır (`14` BR-SHELL-55). İkinci sekmenin etiketinde o odanın bekleyen talep sayısı okunur. |
| **BR-ROOM-33** | ⚠️ **«Aktif» odanın bir ayarıdır**, başlıkta yalnız **okunur** (nokta + etiket). Değiştirme formdadır ve Kaydet'e tabidir. Başlıkta değiştirilebilir durması, taslağa yazan bir kontrolü anında uygulanıyormuş gibi gösteriyordu. |
| **BR-ROOM-14** | Onaylayıcı olmak, odayı düzenleme veya etkinlik düzenleme yetkisi **vermez** (D-039, D-042). ⚠️ Tek istisna: sorumlu olduğu odadaki rezervasyonu **gerekçeyle kaldırabilir** (`18` BR-APR-28, D-071) — bu odayı değil, odanın **doluluğunu** yönetmektir; oda ayarlarına ve etkinliğin içeriğine erişim vermez. |
| **BR-ROOM-15** | Onay anahtarı kapatıldığında **bekleyen talepler otomatik onaylanmaz.** Onaylayıcının kararına bırakılır. *(SR-ROOM-05)* |

### 5.3 Oda yönetim yüzeyi

| ID | Kural |
|---|---|
| **BR-ROOM-16** | **Oda oluşturma ve düzenleme aynı tek ekranlı, bölümlü formu kullanır** (D-032). Sihirbaz yoktur. |
| **BR-ROOM-17** | Form bölümleri: **Genel bilgiler** · **Kapasite ve özellikler** · **Lokasyon** *(yalnızca bina tanımlıysa)* · **Erişim** · **Rezervasyon onayı**. |
| **BR-ROOM-18** | Kaydetmeden önce form içinde **inline bir özet** bulunur; bu özet erişim ve onay yapılandırmasını **açıkça gösterir**. *(`UX-51`'in çözümü — sihirbazın "Gözden Geçirin" adımı kaldırıldığı için doğrulama forma taşınır.)* |
| **BR-ROOM-19** | Odalar sekmesi **liste-öncelikli** açılır; oluşturma bir aksiyondur, varsayılan görünüm değildir (`IA-04`). |
| **BR-ROOM-20** | Oda listesinde her satır **düzenle / pasife al / sil** aksiyonlarını taşır (`UX-42`). |
| **BR-ROOM-21** | Oda listesi varsayılan olarak **oda adına** göre sıralanır (`UX-44` — bugün "Oda açıklaması"na göre sıralı). |

### 5.4 Silme

| ID | Kural |
|---|---|
| **BR-ROOM-22** | Gelecek tarihli rezervasyonu olan oda **doğrudan silinemez.** Kullanıcıya iki yol sunulur: **pasife al** *(önerilen)* veya **rezervasyonları iptal ederek sil**. |
| **BR-ROOM-23** | Oda silme yıkıcı işlemdir; onay ister ve **etkilenecek rezervasyon sayısını** belirtir (ST-DES-01, ST-DES-02). |
| **BR-ROOM-24** | Silinen odanın geçmiş rezervasyonlarındaki etkinlikler **silinmez**; etkinlikte oda bilgisi "kaldırılmış oda" olarak korunur. *(SR-ROOM-06)* |

### 5.5 Oda arama (PC-14)

| ID | Kural |
|---|---|
| **BR-ROOM-25** | Oda listesinde arama bulunur (`UX-43`). |
| **BR-ROOM-26** | Arama şu alanlarda çalışır: **ad · açıklama · bina · kat · özellik adı**. |
| **BR-ROOM-27** | Arama, kullanıcının `Görebilir` yetkisi olan odalarla sınırlıdır (BR-PRM-09). |
| **BR-ROOM-28** | Arama sonucu boşsa, bu **filtre kaynaklı boş durum** olarak gösterilir ve temizleme yolu sunulur (ST-EMPTY-02). |

---

## 6. User Flows

### F-ROOM-1 · Oda oluşturma *(organizasyon yöneticisi)*
```
Odalar → (liste görünümü) → Yeni oda
→ Genel bilgiler: ad, açıklama, durum
→ Kapasite ve özellikler: kapasite, özellik seçimi
→ Lokasyon: bina + kat        [yalnızca bina tanımlıysa görünür]
→ Erişim: Görebilir = Tüm kullanıcılar · Rezerve edebilir = Tüm kullanıcılar  [varsayılan]
→ Rezervasyon onayı: kapalı   [varsayılan]
→ inline özet okunur (BR-ROOM-18)
→ Oluştur → başarı bildirimi → liste görünümüne dönülür
```

### F-ROOM-2 · Onay gerektiren oda yapılandırma
```
Oda formu → Rezervasyon onayı bölümü
→ "Rezervasyon onayı gerekli" anahtarını aç
→ onaylayıcı kullanıcı ve/veya grup ekle   [en az bir tane zorunlu]
→ (ops.) Erişim bölümünde "Rezerve edebilir" kuralını daralt
→ Kaydet
→ Sonuç: bu odaya yapılan rezervasyonlar "Onay bekliyor" durumunda oluşur (18-reservation-approval-spec)
```

### F-ROOM-3 · Odayı pasife alma
```
Oda listesi → satır aksiyonu → Pasife al
→ onay: "N gelecek rezervasyonu var. Pasife almak mevcut rezervasyonları etkilemez,
   ancak oda yeni rezervasyonlarda seçilemez."
→ onayla → oda listede "Pasif" olarak görünür
```

### F-ROOM-4 · Oda arama
```
Odalar → arama alanına yaz
→ ad / açıklama / bina / kat / özellik eşleşmeleri filtrelenir
→ sonuç yoksa filtre kaynaklı boş durum + temizleme yolu
```

---

## 7. Interaction Rules

| ID | Kural |
|---|---|
| **IR-ROOM-01** | Form bölümleri aynı ekranda, **başlıklarla ayrılmış** olarak durur; adım adım ilerleme yoktur (BR-ROOM-16). |
| **IR-ROOM-02** | Bina hiç tanımlı değilse Lokasyon bölümü **gösterilmez** — pasif de gösterilmez, hiç render edilmez (BR-ROOM-06). |
| **IR-ROOM-03** | "Rezervasyon onayı gerekli" kapalıyken onaylayıcı alanı **görünür ama pasif** durur; kullanıcı neyi açacağını görür. |
| **IR-ROOM-04** | Kapasite ve özellik alanları boş bırakılabilir; boş bırakmanın sonucu forma yazılır: *"Kapasite girilmezse odalar kapasiteye göre filtrelenemez."* |
| **IR-ROOM-05** | Oda listesinde **kısıtlı erişimli oda** ile herkese açık oda bir bakışta ayırt edilebilir olmalıdır. |
| **IR-ROOM-06** | Oda listesinde **onay gerektiren oda** ayırt edilebilir olmalıdır. |
| **IR-ROOM-07** | "Nasıl Kullanılır?" statik yardım paneli kalıcı bir sütun olarak **tutulmaz**; yardım içeriği bağlama gömülür veya isteğe bağlı açılır (`IA-05`). |

---

## 8. States

Ortak sözleşme: `11-system-states-spec.md`. Bu modüle özgü olanlar:

| State | Davranış |
|---|---|
| **Empty (hiç oda yok)** | Açıklama + "İlk odanı oluştur" aksiyonu. **Sayfalama kontrolleri gösterilmez** (ST-EMPTY-03 — bugün sıfır kayıtta sayfalama render ediliyor, `UX-45`). |
| **Empty (arama sonucu)** | Filtre kaynaklı; aramayı temizleme yolu sunulur (BR-ROOM-28). |
| **Pasif oda** | Listede görünür, "Pasif" rozeti taşır; oda seçicilerinde görünmez (BR-ROOM-07). |
| **Kısıtlı erişim** | Listede ayırt edilebilir (IR-ROOM-05). |
| **Onay gerektiren** | Listede ayırt edilebilir (IR-ROOM-06). |
| **Disabled (silme)** | Gelecek rezervasyonu olan odada silme pasif; sebep okunur: "Gelecek rezervasyonları var" + pasife alma önerilir (BR-ROOM-22, ST-DIS-02). |

---

## 9. Validation

| ID | Kural | Davranış |
|---|---|---|
| **V-ROOM-01** | Oda adı zorunludur | Alan altı hata; kaydetme engellenir |
| **V-ROOM-02** | Oda adı organizasyon içinde benzersizdir | Alan altı hata; kaydetme engellenir |
| **V-ROOM-03** | Kapasite girilmişse pozitif tam sayı olmalıdır | Alan altı hata |
| **V-ROOM-04** | Kat seçilmişse bina seçili olmalıdır | Kat alanı bina seçilene kadar pasif (BR-ROOM-05); hata durumuna düşülmez |
| **V-ROOM-05** | Onay açıkken en az bir onaylayıcı zorunludur (BR-ROOM-12) | **Engelleyici.** Alan altı hata: *"Rezervasyon onayı açık olduğu için en az bir onaylayıcı seçmelisiniz."* |
| **V-ROOM-08** | Onay açıkken son onaylayıcının kaldırılması (BR-ROOM-12a) | **Engelleyici.** İşlem engellenir; sebep okunur |
| **V-ROOM-06** | Erişim kuralı boş olamaz | `10-permissions-spec.md` V-PRM-01 |
| **V-ROOM-07** | Özellik seçimi yönetilen setten olmalıdır | Serbest giriş arayüzde mümkün değildir (§4.3) |

---

## 10. Edge Cases

| ID | Durum | Beklenen davranış |
|---|---|---|
| **EC-ROOM-01** | Bina silinir, odaları vardır | Bina silinemez; önce odaların bina ataması kaldırılmalıdır. Sebep okunabilir olmalıdır. *(SR-ROOM-07)* |
| **EC-ROOM-02** | Kat silinir, odaları vardır | Odaların kat ataması düşer, bina ataması korunur. Kullanıcıya kaç odanın etkilendiği bildirilir. |
| **EC-ROOM-03** | Organizasyondaki **son bina** silinir | Bina/Kat alanları ve filtreleri arayüzden kalkar (BR-ROOM-06). Odalardaki eski atamalar temizlenir. Bu sonuç kullanıcıya **önceden** bildirilir. |
| **EC-ROOM-04** | Onaylayıcı olarak tanımlı kullanıcı organizasyondan çıkarılır | Onaylayıcı listesinden düşer. ⚠️ Liste boşalırsa **BR-ROOM-12 invariant'ı ihlal edilmiş olur**: oda **uyarı ile işaretlenir** ve yöneticiden yeni onaylayıcı atanması veya onayın kapatılması istenir. Bu **kalıcı bir durum değil, çözülmesi gereken hatadır** (`18` EC-APR-03). |
| **EC-ROOM-05** | Onay açıkken oda pasife alınır | Bekleyen talepler durur ve onaylanabilir kalır; yeni talep oluşturulamaz (BR-ROOM-07). |
| **EC-ROOM-06** | Kapasite, mevcut bir rezervasyonun katılımcı sayısından düşük olacak şekilde değiştirilir | Değişikliğe **izin verilir**; mevcut rezervasyon etkilenmez. Kapasite uyarısı yalnızca yeni rezervasyonlarda çalışır. *(SR-ROOM-08)* |
| **EC-ROOM-07** | Oda özelliği yönetilen setten kaldırılır | O özelliğe sahip odalardan atama düşer; kaç odanın etkilendiği bildirilir. |
| **EC-ROOM-08** | Aynı anda iki yönetici aynı odayı düzenler | `11-system-states-spec.md` EC-ST-03 geçerlidir; sessiz üzerine yazma yapılmaz. |
| **EC-ROOM-09** | Kullanıcı odayı görebiliyor ama oda pasif | Oda seçicilerinde görünmez (BR-ROOM-07); ancak kullanıcının o odadaki mevcut etkinliğinde oda adı okunur. |

---

## 11. Dependencies

| Bağımlılık | İlişki |
|---|---|
| `10-permissions-spec.md` | Erişim kuralları (BR-PRM-01…05), görünürlük (BR-PRM-06/09) |
| `11-system-states-spec.md` | Boş durum, validasyon, yıkıcı işlem, disabled sebebi |
| `16-room-booking-spec.md` | **Bu spec'in tükettiği** — kapasite, özellik, lokasyon ve müsaitlik verisi filtre olarak orada kullanılır |
| `18-reservation-approval-spec.md` | Onay bayrağı ve onaylayıcı alanlarını **bu spec'ten tüketir**; akış orada tanımlıdır |
| `14-calendar-shell-spec.md` | "Odalara Göre" görünümü oda listesini ve müsaitliğini tüketir |

---

## 12. Responsive Expectations

Desktop-first (D-047). Oda **yönetimi** masaüstü odaklıdır — D-047'nin mobil zorunlu tuttuğu 6 akış arasında oda oluşturma/düzenleme yoktur.

Mobilde zorunlu olan: **oda arama** ve **oda rezervasyonu**. Bu nedenle:
- Oda listesi ve arama mobilde kullanılabilir olmalıdır
- Oda bilgisi (kapasite, özellikler, lokasyon) mobilde okunabilir olmalıdır
- Oda oluşturma/düzenleme formu mobilde erişilebilir olmalı ancak **birincil optimize edilen yüzey değildir**

---

## 13. Design Implications *(FAZ 6'ya taşınacak)*

- **Tek ekranlı form bölümlere ayrılmalı ama uzunluğu yönetilebilir kalmalı** — beş bölüm var ve ikisi (Erişim, Onay) koşullu karmaşıklık taşıyor. Sihirbazın kaldırılmasının bedeli budur (D-032).
- **İnline özet (BR-ROOM-18) formun neresinde duracak?** Sihirbazın "Gözden Geçirin" adımının işlevini devralıyor; kaydetmeden önce okunabilir olması gerekiyor.
- Oda listesinde **üç ayrı durum işareti** yan yana yaşayacak: pasif · kısıtlı erişim · onay gerektiren. Bunların birbirine karışmaması gerekiyor.
- Progressive disclosure (BR-ROOM-06) **arayüzün kendini yeniden düzenlemesi** demek: bina tanımlanınca formda yeni bir bölüm belirir. Bu geçişin şaşırtıcı olmaması gerekiyor.
- "Nasıl Kullanılır?" panelinin kaldırılması (IR-ROOM-07) yerine ne konacağı bir tasarım kararı.

---

## 14. Acceptance Criteria

| # | Kriter |
|---|---|
| AC-ROOM-01 | Oda oluşturma ve düzenleme aynı tek ekranlı formu kullanır; sihirbaz yoktur. |
| AC-ROOM-02 | Odalar sekmesi liste görünümüyle açılır. |
| AC-ROOM-03 | Oda listesindeki her satır düzenle / pasife al / sil aksiyonlarını taşır. |
| AC-ROOM-04 | Oda listesi varsayılan olarak oda adına göre sıralanır. |
| AC-ROOM-05 | Organizasyonda hiç bina tanımlı değilse Bina/Kat alanları ve filtreleri hiçbir yerde görünmez. |
| AC-ROOM-06 | Kat, bina seçilmeden atanamaz. |
| AC-ROOM-07 | Yeni odada her iki erişim kuralı "Tüm kullanıcılar", onay anahtarı kapalıdır. |
| AC-ROOM-08 | "Rezervasyon onayı gerekli" açıkken en az bir onaylayıcı olmadan kaydedilemez; alan bazlı hata gösterilir. |
| AC-ROOM-17 | Onay açıkken son onaylayıcı kaldırılamaz; onay kapatıldığında zorunluluk kalkar. |
| AC-ROOM-09 | Onaylayıcı olmak, odayı düzenleme veya etkinlik düzenleme yetkisi vermez. |
| AC-ROOM-10 | Pasif oda hiçbir oda seçicide görünmez; mevcut rezervasyonları etkilenmez. |
| AC-ROOM-11 | Gelecek rezervasyonu olan oda doğrudan silinemez; pasife alma veya rezervasyonları iptal etme seçeneği sunulur. |
| AC-ROOM-12 | Oda silme onayı, etkilenecek rezervasyon sayısını belirtir. |
| AC-ROOM-13 | Oda araması ad, açıklama, bina, kat ve özellik alanlarında çalışır. |
| AC-ROOM-14 | Arama yalnızca kullanıcının görebildiği odaları döndürür. |
| AC-ROOM-15 | Boş oda listesinde sayfalama kontrolleri görünmez ve bir oluşturma yolu sunulur. |
| AC-ROOM-16 | Kaydetmeden önce erişim ve onay yapılandırması form içinde özet olarak okunabilir. |

---

## Spec-level recommendations

| # | Konu | Seçilen davranış | Dayanak |
|---|---|---|---|
| SR-ROOM-01 | Sihirbazın "Gözden Geçirin" adımı nereye gitti? | **İnline özete dönüştü** (BR-ROOM-18) | D-032 sihirbazı kaldırdı; ama `UX-51`'in çözümü (erişimin kaydetmeden önce görünmesi) korunmalı |
| SR-ROOM-02 | Oda durumu kaç değer alır? | **Aktif / Pasif** — "Bakımda" eklenmedi | `U-29` doğrulanmamış aday; iki durum audit'teki ihtiyacı karşılıyor |
| SR-ROOM-03 | Özellik seti serbest mi? | **Yönetilen, kapalı set** | D-048 açıkça "gereksiz taxonomy kurma" diyor; serbest giriş `UX-18/19/20` tipi taksonomi karmaşasını tekrar üretir |
| SR-ROOM-04 | Onay anahtarının varsayılanı | **Kapalı** | D-030'un "kısıtlama istisnadır" felsefesiyle tutarlı; onay bir sürtünmedir, varsayılan olamaz |
| SR-ROOM-05 | Onay kapatılınca bekleyen talepler | **Otomatik onaylanmaz** (BR-ROOM-15) | Sessiz toplu onay, ST-CORE-02'nin ruhuna aykırı; onaylayıcının kararı korunur |
| SR-ROOM-06 | Silinen odanın geçmiş etkinlikleri | **Etkinlik korunur, oda "kaldırılmış" olarak görünür** (BR-ROOM-24) | Geçmiş takvim kaydının bozulmaması; sessiz veri kaybı olmaması |
| SR-ROOM-07 | Odası olan bina silinebilir mi? | **Hayır, önce atamalar kaldırılmalı** (EC-ROOM-01) | Zincirleme sessiz veri temizliği riskli; kullanıcı ne olacağını bilmeli |
| SR-ROOM-09 | Oda oluşturma ve bina yönetimi | **Oluşturma düzenlemeyle aynı formda, taslak olarak** (BR-ROOM-29); **bina oda formundan** oluşturulur, ayrı ekran yok (BR-ROOM-30); **rezervasyonlu oda silinmez, pasife alınır** (BR-ROOM-31) | Roller tablosu yöneticinin oda oluşturduğunu söylüyordu ama **oluşturma akışı hiçbir yerde tanımlı değildi**; `BR-ROOM-04/05/06` binayı ön koşul yapıyordu ama **binayı kimin oluşturduğu da tanımsızdı**. Ayrı bir bina yönetim ekranı `D-028` progressive disclosure kararına aykırı olurdu — bina yalnız gerektiğinde görünmeli. Silme yerine pasife alma, `BR-ROOM-07`'nin "mevcut rezervasyonlar etkilenmez" garantisini korur |
| SR-ROOM-08 | Kapasite düşürülünce mevcut rezervasyon | **Etkilenmez** (EC-ROOM-06) | Geriye dönük kural uygulaması takvimi öngörülemez kılar; `10-permissions` SR-PRM-04 ile aynı ilke |
