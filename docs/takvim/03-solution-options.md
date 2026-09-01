# FAZ 2B · Adım 2 — Solution Options (Parti 1 / 4 cluster)

**Tarih:** 2026-08-27 · **Durum:** ✅ **FINAL / SUPERSEDED**
> 🔒 Bu doküman **tarihsel kayıttır** — kapsam alternatiflerinin nasıl üretildiğini gösterir.
> **Güncel kapsamın tek referansı `04-scope-closure.md`'dir.** FAZ 3 kararları (D-025…D-051) buradaki ⭐ önerilerinin bir kısmını doğruladı, bir kısmını değiştirdi.
**Girdiler:** `00-current-state-audit.md` rev.3 · `01-competitor-capability-map.md` v2 · `02-problem-clusters.md` v2
**Bu partide:** PC-08 · PC-09 · PC-11 · PC-04
**Bu partide YOK:** PC-01, 02, 03, 05, 06, 07, 10, 12, 13, 14 *(onay sonrası aynı yöntemle)* · PC-15 *(Design Brief Input, kapsam üretilmiyor)*

> 🚨 **⭐ İŞARETLERİ SEÇİLMİŞ KAPSAM DEĞİLDİR.**
> ⭐ = Claude'un önerisi. Kullanıcı açıkça seçim yapmadan **PC-08 B, PC-09 B, PC-11 B, PC-04 A veya başka hiçbir seviye Product Spec requirement'ı haline gelmez** (D-021).
> P0/P1/P2 önceliği **yok**. Seçim tablosu **yok**. Nihai seçim kullanıcıdadır.
>
> **Durum:** FAZ 2B geçici olarak **duraklatıldı**. Kapsam seçimleri FAZ 3 — Interactive Requirement Discovery sonucunda netleşecek (D-022).

---

## 0. Okuma kılavuzu

**Sunum sırasını değiştirdim.** Sen PC-04 → PC-08 → PC-09 → PC-11 sırasıyla istedin; ben **bağımlılık sırasıyla** yazdım:

```
PC-08 (Foundation)  →  PC-09 (bunun üstüne kuruluyor)
PC-11 (Foundation)  →  PC-04'ün ve PC-09'un bazı seviyelerini kilitliyor
PC-04 (en bağımsız olan, en sonda)
```

Gerekçe: PC-09'un B seviyesi PC-08'in B seviyesi olmadan **anlamsız**. Ters sırada okursan PC-09'un maliyetini eksik tahmin edersin. Farklı bir sıra istersen değiştiririm.

**Foundation cluster'larda format farklı** (senin kuralın): "kullanıcı bunu görür" diye yazmadım. Bunun yerine her seviye için **hangi üst seviye deneyimleri mümkün kıldığını** ve **neyi hâlâ mümkün kılmadığını** yazdım.

**Kullanılan işaretler:**
- 🔷 Foundation · 🟦 Direct UX · ⚠️ Conditional
- `⚠ FAZ 3` — bu iş kuralı cevaplanmadan seviye kesinleşmez
- `[O]` / `[I]` / `[U]` / `[O-zayıf]` — kanıt seviyesi (D-001, D-011)
- **Backend notu:** FAZ 0 gereği backend geliştirmiyoruz. "Backend/domain bağımlılığı" alanı, bir seviyenin **frontend'de mock'lanabilir mi yoksa gerçek bir domain değişikliği mi gerektirdiğini** söylüyor — API veya şema önermiyor.

---

# 🔷 PC-08 · Oda Veri Modeli ve Yönetimi — FOUNDATION

### Kullanıcı problemi
> Oda kaydı yalnızca ad, lokasyon ve açıklama tutuyor; bu yüzden odayı filtrelemek, kapasitesine göre elemek, doluluğunu hesaplamak veya üzerine kural uygulamak için **veri yok**.

### İlgili audit ID'leri
`FN-16` (rezervasyon kuralı kavramı yok) · `FN-11` (paylaşımlı oda semantiği) · `FN-17` (varsayılan herkese açık) · `UX-41` (sihirbaz ağırlığı) · `UX-42` (satır aksiyonu yok) · `UX-44`, `UX-45`, `UX-46`, `UX-47`, `UX-48`, `UX-49`, `UX-52`, `UX-53` · `IA-02`, `IA-04`, `IA-05` · `U-21`…`U-24`, `U-27`, `U-29` · `KEEP-05` · `⚠ FAZ 3` **A-07**

### Benchmark pattern
T-3. **En net ders `[O]`:** Microsoft'un kendi dokümanı, City/Floor/Capacity özellikleri doldurulmazsa Room Finder filtrelerinin çalışmadığını yazıyor. *Oda arama deneyimi, oda veri modelinin doğrudan fonksiyonudur.* Google'ın "structured resources" kavramı aynı şeyi söylüyor `[O]`.
**Koşul uyarısı:** Google'ın yapısal kaynak verisi yöneticinin doldurmasına bağlı (benchmark 6.1).

---

### Seviye A — Kimlik ve Müsaitlik

**Veri modeli:** Oda Adı · Lokasyon (serbest metin, mevcut) · Açıklama · **Durum (aktif/pasif)** · **odanın rezervasyonlarının zaman ekseninde sorgulanabilir olması**

**Mümkün kıldığı deneyimler:**
- ✅ **Oda çakışma kontrolü** (PC-09 A) — "bu oda o saatte dolu" sorusu ilk kez cevaplanabilir hale gelir
- ✅ **"Odalara Göre" görünümünün anlamlı çalışması** (KEEP-02, FN-12) — mekân × zaman ızgarası gerçek veri gösterir
- ✅ **Oda yaşam döngüsünün tamamlanması** — oluşturulan oda düzenlenebilir, pasife alınabilir, silinebilir (`UX-42`, `U-27`, `U-29`)

**Hâlâ mümkün kılmadıkları:**
- ❌ Kapasiteye/kata/özelliğe göre filtreleme
- ❌ Oda önerisi
- ❌ Herhangi bir rezervasyon kuralı veya onay akışı (PC-10'un tamamı kapalı kalır)

**UX davranışı:** Odalar sekmesi liste-öncelikli hale gelir (`IA-04`); listede satır aksiyonları ve durum kolonu belirir; boş durum bir CTA taşır (`UX-45`). Sihirbaz bu alan sayısı için gereksiz — tek forma iner (`UX-41`).
**Frontend etkisi:** Orta — liste + CRUD formu + boş/hata durumları yeniden yazılır.
**Backend/domain bağımlılığı:** **Gerçek domain değişikliği gerekiyor** (durum alanı + müsaitlik sorgusu). Frontend'de mock'lanabilir ama gerçek değer backend'e bağlı.
**Cluster bağımlılıkları:** PC-12 (yeni durum/hata mesajları).
**Risk / trade-off:** Serbest metin "Lokasyon" korunuyor — bu, B'ye geçildiğinde **veri göçü** demek. Şimdi yapısal alan konulmazsa sonra dönülecek.
**Değer:** Medium *(tek başına görünmez; ama PC-09 A'nın tek ön koşulu)* · **Karmaşıklık:** Low–Medium

---

### Seviye B — Nitelikli Oda ⭐ *önerdiğim kapsam*

**A'ya eklenenler:** **Kapasite** (sayı) · **Özellikler/donanım** (yönetilebilir çoklu seçim listesi) · ✅ **Bina + Kat** — **KARAR: D-028**, *opsiyonel* (zorunlu değil) + progressive disclosure: veri yoksa filtre gösterilmez · **Paylaşımlı/özel bayrağının netleşmesi**

**Mümkün kıldığı deneyimler:**
- ✅ **Kapasite + kat + özellik filtresi** (PC-09 B) — benchmark'ın "evrensel dört filtre" dediği şeyin üçü
- ✅ **Kapasite uyarısı** — "8 katılımcı seçtin, bu oda 4 kişilik"
- ✅ **Oda araması** (PC-14) — aranacak anlamlı alan doğar
- ✅ **Free/busy ızgarasında anlamlı oda satırları** (PC-07 ile birleşince)
- ✅ **`FN-11` / `A-07` netleşir** — "paylaşımlı oda" kolonu ile erişim bayrağı arasındaki ilişki tanımlanır

**Hâlâ mümkün kılmadıkları:**
- ❌ Onay akışı, maksimum süre, rezervasyon penceresi (PC-10 kapalı kalır)
- ❌ Geçmişe/konuma dayalı oda önerisi (PC-09 C)

**UX davranışı:** Oda formu ~7 alana çıkar. **Burada gerçek bir tasarım gerilimi var:** A'da sihirbazı tek forma indirmeyi öneriyorum, ama B'de alan sayısı arttığı için sihirbaz *yeniden savunulabilir* hale geliyor. Bunu şimdi kararlaştırmıyorum — FAZ 4'te Rooms spec'inde ele alınacak bir açık nokta olarak işaretliyorum.
**Frontend etkisi:** Orta — özellik listesi yönetimi + bina/kat seçicisi yeni bileşen.
**Backend/domain bağımlılığı:** **Gerçek domain değişikliği.** Bina/kat, odanın alanı değil ayrı bir varlık olabilir — bu bir modelleme kararı, FAZ 3/4'e.
**Cluster bağımlılıkları:** PC-09 B (tüketicisi), PC-14 (arama), PC-07 (kapasite ↔ katılımcı sayısı).
**Risk / trade-off:** ✅ **Çözüldü (D-028).** Hiyerarşi *opsiyonel* yapılarak tek binalı müşterideki ağırlık ortadan kaldırıldı; veri tanımlı değilse ilgili filtreler arayüzde hiç görünmüyor. Serbest etiket sistemi (Skedda modeli `[I]`) eklenmedi — mevcut taksonomi karmaşası çözülmeden ikinci gruplama ekseni riskli.
**Değer:** High *(dört üst seviye deneyimin ön koşulu)* · **Karmaşıklık:** Medium

---

### Seviye C — Politika Taşıyan Oda

**B'ye eklenenler:** **Rezervasyon kuralları** (onay gerekli mi · maksimum süre · önden rezervasyon penceresi · mesai penceresi) · oda fotoğrafı · genişletilmiş durum (bakımda) · analytics metadata

**Mümkün kıldığı deneyimler:**
- ✅ **PC-10'un tamamı** — kural motoru ve onay akışı ancak bu alanlar varsa çalışır
- ✅ **PC-06 ile birleşince mesai dışı rezervasyon engeli** (C-7)
- ✅ İleride doluluk analitiği

**UX davranışı:** Oda formu kural sekmesine ayrılır (bilgi / erişim / kurallar).
**Backend/domain bağımlılığı:** Yüksek — kural değerlendirme mantığı domain'e girer.
**Cluster bağımlılıkları:** **PC-10 ⚠️ CONDITIONAL.**
**Risk / trade-off:** ⚠️ **PC-10 FAZ 3'te doğrulanmazsa bu seviyenin büyük kısmı kullanılmayan alan olur.** C'yi PC-10 kararından önce yapmak, en yüksek boşa yatırım riski.
**Değer:** Conditional High *(yalnızca PC-10 onaylanırsa)* · **Karmaşıklık:** High

---

### PC-08 özet

| Seviye | Değer | Karmaşıklık | Kilidini açtığı |
|---|---|---|---|
| A | Medium | Low–Medium | PC-09 A · KEEP-02 · oda CRUD |
| **B** ⭐ | **High** | Medium | PC-09 B · PC-14 · PC-07 kapasite kontrolü |
| C | Conditional High | High | PC-10 tamamı |

**Önerim: B.** Gerekçe: A tek başına çakışma kontrolünü açıyor ama filtreyi açmıyor; benchmark'ın en net dersi (veri yoksa filtre yok) tam olarak A ile B arasındaki farkta. C'yi PC-10 kararına bağlı tutmak, boşa yatırımı önlüyor.
**`⚠ FAZ 3`:** A-07 (paylaşımlı oda ne demek?) · çok binalı mı? · bina/kat mı, etiket mi?

---

# 🟦 PC-09 · Oda Keşfi ve Rezervasyonu

### Kullanıcı problemi
> Kullanıcı etkinlik oluştururken odayı bulamıyor, aday odaları daraltamıyor ve seçtiği odanın o saatte dolu olup olmadığını göremiyor — aynı oda iki kez rezerve edilebiliyor.

### İlgili audit ID'leri
`FN-03` (çakışma kontrolü yok) · `FN-12` ("Odalara Göre" içeriği bilinmiyor) · `UX-30` (Oda Seç checkbox) · `UX-31` (oda ↔ lokasyon ilişkisi tanımsız) · `C-3` (HTML'in çakışma önerisi) · `U-25` (room finder) · `KEEP-02` · `⚠ FAZ 3` **A-08**

### Benchmark pattern
T-4. **Zincir:** `Oda veri modeli → oda müsaitliği → Room Finder`. Dört ayrı felsefe gözlemlendi: filtrele (Outlook `[O]`) / öner (Google `[O]`, Robin `[O-zayıf]`) / haritadan seç (Envoy `[O-zayıf]`) / ızgaradan seç (Skedda `[I]`).
**Pattern (küçük):** *müsaitlik seçim anında görünmeli.* **Feature (büyük):** *Room Finder.* İkisi aynı şey değil (D-012).

---

### Seviye A — Doğrudan seçici + çakışma uyarısı

**UX davranışı:**
- "Oda Seç" checkbox'ı kalkar; yerine doğrudan bir oda seçici gelir (`UX-30`)
- Oda seçildiğinde, formdaki zaman aralığı için **dolu/müsait** anında gösterilir; çakışma varsa uyarı çıkar ve **Oluştur engellenir** (C-3'ün tarif ettiği davranış)
- Oda ↔ Lokasyon ilişkisi tanımlanır: oda seçilince Lokasyon otomatik dolar (`UX-31`)
- "Odalara Göre" görünümünde dolu slotlar renklenir

**Gerekli veri:** PC-08 **A** (oda × zaman sorgusu)
**Frontend etkisi:** Orta — seçici + anlık doğrulama + engellenen submit durumu.
**Backend/domain bağımlılığı:** Müsaitlik sorgusu gerçek; mock ile prototiplenebilir.
**Cluster bağımlılıkları:** PC-08 A · PC-12 (uyarı ve engelleme durum dili) · PC-05 (tekrarlayan etkinlikte çakışma nasıl hesaplanır? `⚠`)
**Risk / trade-off:** ⚠️ **Benchmark pattern'ini yarım karşılıyor.** Müsaitlik *seçimden sonra* uyarı olarak geliyor — kullanıcı zaten odayı seçmiş oluyor. Rakiplerde müsaitlik *seçerken* görünür. A, "yanlış seçimi engelleme" çözümü; "doğru seçime yönlendirme" değil.
**Değer:** High *(FN-03 audit'in 2 numaralı bulgusu — oda modülünü ilk kez işlevsel yapıyor)* · **Karmaşıklık:** Low–Medium

---

### Seviye B — Müsaitlik-farkında oda seçici ⭐ *önerdiğim kapsam*

**A'ya eklenenler:**
- Oda listesi **zaten seçili zaman aralığına göre** gelir: dolu odalar "dolu" rozetiyle ve seçilemez halde (veya filtreyle gizlenebilir)
- **Kapasite / kat / özellik filtreleri** (PC-08 B'ye bağlı)
- Katılımcı sayısı ile kapasite karşılaştırması: "8 kişi seçtin, bu oda 4 kişilik"
- Müsaitlik **süre olarak** ifade edilir — *"14:00'a kadar müsait"* (Envoy'un "Available for 45 mins" pattern'i `[O-zayıf]`)

**Gerekli veri:** PC-08 **B** (kapasite + kat + özellik)
**Frontend etkisi:** Yüksek — filtre paneli + müsaitlik-farkında liste + kapasite uyarısı.
**Backend/domain bağımlılığı:** Zaman aralığına göre filtrelenmiş oda sorgusu — gerçek domain işi.
**Cluster bağımlılıkları:** **PC-08 B zorunlu** · PC-11 B (rezerve edemeyeceğin oda nasıl gösterilir?) · PC-07 (katılımcı sayısı) · PC-14 (oda araması)
**Risk / trade-off:** Dolu odaları **gizlemek mi, gösterip devre dışı bırakmak mı?** (YENİ-03 — hâlâ açık, FAZ 3 kararı.) ⚠️ **Ayrım:** D-026 **yetkisi olmayan** oda için kararı verdi (görünür kalır, aksiyon kapalı). YENİ-03 ise **o saatte dolu olan** oda için ayrı bir karar — henüz verilmedi. D-026 bir emsal oluşturuyor ama aynı soru değil.
**Değer:** High · **Karmaşıklık:** Medium

---

### Seviye C — Room Finder + Öneri

**B'ye eklenenler:**
- Ayrı bir **Room Finder** paneli: bina → kat → filtre → sonuç akışı (Outlook modeli `[O]`)
- **Önerilen odalar** — kapasite + katılımcı konumu ve/veya geçmiş kullanım
- **Birden fazla oda** seçimi
- Uygun olmayan odanın **neden** uygun olmadığının gösterilmesi

**Gerekli veri:** PC-08 B + kullanım geçmişi ve/veya kullanıcı konum verisi
**Backend/domain bağımlılığı:** Yüksek — öneri sıralaması domain mantığı.
**Risk / trade-off:** ⚠️ **İki ciddi uyarı:**
1. **Öneri motoru cold-start'ta çalışmıyor.** Robin'in önerisi son 60 günlük kullanım geçmişine dayanıyor `[O-zayıf]` — Narbulut'ta bu geçmiş yok. Google'ın önerisi kullanıcının bina/kat konumuna dayanıyor `[O]` — bu veri de yok.
2. **Her iki üründe de öneri yönetici/ürün ayarına bağlı** (benchmark 6.1), yani varsayılan davranış değil.
Ayrıca bu seviyenin öneri kısmı **kısmen `[O-zayıf]` kaynağa dayanıyor** (Robin) — D-011 gereği bunu yüksek öncelikli bir öneri için tek başına yeterli kanıt saymıyorum.
**Değer:** Medium *(cold-start nedeniyle ilk günden düşük)* · **Karmaşıklık:** High

---

### PC-09 özet

| Seviye | Değer | Karmaşıklık | Ön koşul | Benchmark pattern'ini karşılıyor mu? |
|---|---|---|---|---|
| A | High | Low–Medium | PC-08 A | Yarım — uyarı, yönlendirme değil |
| **B** ⭐ | **High** | Medium | **PC-08 B** | Evet |
| C | Medium | High | PC-08 B + geçmiş veri | Fazlasıyla; ama cold-start riski |

**Önerim: B.** Gerekçe: A audit'in en ağır fonksiyonel boşluğunu (FN-03) kapatıyor ama benchmark'ın asıl dersini kaçırıyor. C'nin öneri katmanı Narbulut'ta veri olmadığı için ilk günden zayıf çalışır. B, "aday odaları daralt + doluyu gizle/işaretle" ile problemin merkezini vuruyor.
**`⚠ FAZ 3`:** A-08 ("Odalara Göre" bugün kullanılıyor mu? — KEEP-02'yi doğrular veya çürütür)

---

# 🔷 PC-11 · İzin ve Erişim Modeli — FOUNDATION

### Kullanıcı problemi
> Yetki modeli **tipsiz bir erişim listesi**: bir odaya "erişebilen" kişinin onu görebildiği mi, rezerve edebildiği mi belli değil. Merkezî yönetim yok — yetkiye tek giriş oda oluşturma sihirbazı. Kullanıcıların birbirlerinin takvimini görüp göremediği hiç bilinmiyor.

### İlgili audit ID'leri
`FN-09` (İzinler pasif) · `FN-10` (ACL, matris değil) · `IA-01`, `IA-03` · `C-1` (rol × yetki matrisi) · `U-16` (etkinlik gizliliği) · `U-30` (paylaşılan takvim / delegasyon) · `KEEP-04` ⚠, `KEEP-11` · `⚠ FAZ 3` **A-01, A-02, A-03**

### Benchmark pattern
T-6, T-7. **Zincir:** `tipsiz ACL → tipli yetki → rol matrisi`. Skedda'nın açık ifadesi `[O]`: *"bir mekânı görebilmek onu rezerve edebilme yetkisi anlamına gelmez."* Google/Outlook'ta görünürlük **kademeli** (free/busy → başlık+konum → tam detay) `[O]`.

> ⚠️ **rev.3 düzeltmesi — bu cluster'ın en önemli notu.**
> HTML taslağı C-1 için *"Odalar sihirbazındaki Yetkilendirme adımıyla aynı yetki modelini paylaşır"* diyor. **Bu artık yanlış olarak biliniyor `[O]`.** Mevcut model tipsiz bir ACL; rol × yetki matrisi mevcut modelin üstüne kurulamaz, **yeni bir model** demektir. C-1'in karmaşıklığı buna göre okunmalı.

---

### Seviye A — Mevcut modelin görünür ve yönetilebilir hale gelmesi

**Ne değişiyor:** Yeni yetki tipi **eklenmiyor**. Mevcut ACL (tüm kullanıcılar / grup + kullanıcı listesi) sihirbazın dışına çıkarılıyor ve İzinler sekmesi bu modelin merkezî görünümü oluyor: *hangi oda kime açık*, tek ekranda.

**Mümkün kıldığı deneyimler:**
- ✅ **Oda yetkisinin sonradan değiştirilebilmesi** — bugün mümkün olup olmadığı bile bilinmiyor (`UX-42`, `FN-10`)
- ✅ **`IA-01` çözülür** — İzinler ölü sekme olmaktan çıkar
- ✅ **`FN-17` görünür hale gelir** — "bu oda herkese açık" bilgisi yönetilebilir bir yerde durur
- ✅ Benchmark'ın "kim neyi görüyor tek ekranda" boşluğuna kısmi cevap *(incelenen ürünlerin hiçbirinde böyle bir özet görünüme rastlanmadı `[I]` — burada rakiplerin önüne geçme fırsatı olabilir)*

**Hâlâ mümkün kılmadıkları:**
- ❌ Görünürlük ile rezervasyon yetkisinin ayrılması
- ❌ **PC-07 (scheduling) tamamen kapalı kalır** — free/busy yok
- ❌ PC-10'da "kim onaylar" sorusu cevapsız

**Frontend etkisi:** Orta — yeni bir İzinler ekranı (matris değil, liste/tablo).
**Backend/domain bağımlılığı:** **Düşük — model değişmiyor**, sadece yönetim yüzeyi açılıyor. Bu seviyenin cazibesi burada.
**Cluster bağımlılıkları:** PC-08 A (oda CRUD ile birlikte anlamlı).
**Risk / trade-off:** Tipsiz modeli **kalıcılaştırma riski**. Kullanıcıya "izin yönetimi var" hissi verirken altındaki model hâlâ tek tip. B'ye geçişte kavramsal göç gerekir.
**Değer:** Medium *(görünür bir boşluğu kapatıyor ama üst deneyim açmıyor)* · **Karmaşıklık:** Low

---

### Seviye B — Tipli yetki: görünürlük ≠ rezervasyon ⭐ *önerdiğim kapsam*

> ✅ **KISMEN KARARA BAĞLANDI — D-026.** Oda erişiminin iki tipe ayrılması (*Görebilir* / *Rezerve edebilir*) **seçildi**. Rezerve edilemeyen oda listeden kaybolmaz; müsaitlik görünür kalır, aksiyon kapalıdır. "Onaylayabilir" üçüncü yetkisi eklenmedi (PC-10'a bağlı). Migration: mevcut erişimler → *Görebilir + Rezerve edebilir*.
> B'nin **free/busy ve etkinlik gizliliği** kısımları hâlâ karara bağlanmadı (A-02 bekliyor).

**A'ya eklenenler:**
- ✅ **Oda erişimi iki tipe ayrılır:** *görebilir* / *rezerve edebilir* — **KARAR: D-026**
- ✅ **Takvim tarafında free/busy kademesi** — **KARAR: D-027.** Organizasyon içinde varsayılan; yalnızca *müsait/meşgul*, hiçbir detay yok. Kullanıcı bazlı kademeli paylaşım eklenmedi.
- ⏳ **Etkinlik seviyesinde gizlilik** (özel etkinlik) — `U-16` · **ayrı karar olarak açık bırakıldı (P-016)**

**Mümkün kıldığı deneyimler:**
- ✅ **PC-07 (Scheduling) açılır.** Benchmark'ın en net bulgusu `[O]`: *free/busy, karşı tarafın takvimini paylaşmasına bağlı; paylaşım yoksa özellik sessizce boş çalışıyor.* **İzin modeli olmadan scheduling inşa edilemez.**
- ✅ **PC-09 B'de doğru davranış** — rezerve edemeyeceğin oda listede görünür ama seçilemez (Skedda pattern'i `[O]`)
- ✅ **PC-10 için zemin** — "rezerve edebilir" ile "onaylayabilir" arasındaki fark artık ifade edilebilir
- ✅ Gizlilik ile koordinasyon gerilimi çözülür (T-7)

**Hâlâ mümkün kılmadıkları:**
- ❌ Rol tabanlı merkezî yönetim (her oda hâlâ tek tek yönetiliyor)
- ❌ Kapsamlı admin rolleri ("sadece 3. kattaki odaların yöneticisi")
- ❌ Delegasyon

**Frontend etkisi:** Yüksek — izin ekranı iki boyutlu hale gelir; takvim tarafında free/busy render'ı yeni bir gösterim katmanı.
**Backend/domain bağımlılığı:** **Gerçek model değişikliği** — ACL kaydına tip alanı, takvime görünürlük kademesi.
**Cluster bağımlılıkları:** PC-07 (tüketicisi) · PC-09 B · PC-03 (etkinlik gizliliği taksonomiye dokunuyor)
**Risk / trade-off:** ✅ `A-02` **cevaplandı (D-027)** — free/busy organizasyon içinde varsayılan. Bu seviyenin en büyük belirsizliği kapandı; B'nin değeri doğrulandı. Kalan açık: event-level privacy (P-016).
**Değer:** High *(PC-07'nin tek ön koşulu)* · **Karmaşıklık:** Medium–High

---

### Seviye C — Rol × yetki matrisi + kapsamlı roller

**B'ye eklenenler:**
- **C-1'in matrisi:** roller × yetkiler (görüntüle / düzenle / rezerve et / onayla / sil)
- **Kapsamlı admin rolleri** — Skedda'nın Custom Admin Roles pattern'i `[O]`: belirli odalara/etiketlere sınırlı yönetici
- **Delegasyon** (`U-30`)

**Mümkün kıldığı deneyimler:**
- ✅ **PC-10 tamamen** — "onaylayan kim" merkezî olarak tanımlanabilir
- ✅ Büyük organizasyonda ölçeklenebilir yetki yönetimi

**Backend/domain bağımlılığı:** **Yüksek — yeni bir yetki modeli.** rev.3 uyarısı burada geçerli.
**Risk / trade-off:** ⚠️ **İki blokaj:**
1. **`A-03` bilinmeden matris tasarlanamaz.** Üç panel varsa (Bayi / Organizasyon / Kullanıcı) matris hangi seviyede yaşıyor? Roller tenant'a mı ait, organizasyona mı? Bu cevaplanmadan C bir mimari kumar.
2. Benchmark'ta bile bu granülerlik bir yük: Skedda'nın tag + rol + custom role üçlüsü **birkaç odalı bir kurulumda kavramsal olarak ağır**; Microsoft'un güçlü modeli **yalnızca PowerShell'de** yaşıyor, yani son kullanıcı arayüzü yok.
**Değer:** Conditional High *(PC-10 onaylanırsa)* · **Karmaşıklık:** High

---

### PC-11 özet

| Seviye | Değer | Karmaşıklık | Kilidini açtığı | Backend etkisi |
|---|---|---|---|---|
| A | Medium | **Low** | İzinler ekranı · oda yetkisi düzenlenebilirliği | Düşük — model değişmiyor |
| **B** ⭐ | **High** | Medium–High | **PC-07 tamamı** · PC-09 B doğru davranışı | Model değişikliği |
| C | Conditional High | High | PC-10 tamamı | Yeni model |

**Önerim: B.** ✅ **A-01 (D-026), A-02 (D-027) ve A-03 (D-025) cevaplandı** — bu cluster'ın üç bloke edici belirsizliği de kapandı ve ikisi doğrudan B'yi işaret etti. Öneri artık düşük güvenle değil, karara dayalı.
Yine de B'yi öneriyorum çünkü: A tek başına hiçbir üst deneyim açmıyor ve tipsiz modeli kalıcılaştırma riski taşıyor; C ise A-03 bilinmeden mimari kumar.
**`⚠ FAZ 3`:** A-01, A-02, A-03 — **üçü de bloke edici.**

---

# 🟦 PC-04 · Etkinlik Oluşturma ve Düzenleme

### Kullanıcı problemi
> Form kullanıcıyı yanlış slot'a tıkladığında cezalandırıyor (tarih değiştirilemiyor, girilen veri kaybolur), kozmetik bir kontrol asıl alanın üstünde duruyor, ve mevcut bir etkinliğin düzenlenip düzenlenemediği doğrulanmadı.

### İlgili audit ID'leri
`UX-23` (tarih değiştirilemiyor) · `UX-24` (bitiş tarihi yok) · `UX-25` (ters hiyerarşi) · `UX-26` (çoklu birincil buton) · `UX-27` (belirsiz tip kontrolü) · `UX-28` (dropdown saat) · `UX-29` (15 dk varsayılan) · `UX-31` · `UX-32` · `UX-33` · `UX-34` · `UX-35` · `UX-37` · `UX-38` · `FN-06` · `FN-13` · `U-17`, `U-18`, `U-19` · `KEEP-06`, `KEEP-07`, `KEEP-12` · `⚠ FAZ 3` **A-09**

### Benchmark pattern
T-2. İki katmanlı oluşturma bu sette güçlü ortak yaklaşım: Google `[O]` ("Add title and time" → "More options"), Notion `[O]` (çift tık / `C`), Outlook `[I]`. İncelenen ürünlerde **tarihin salt okunur bir başlık olduğu bir örneğe rastlanmadı** — bu bir yokluk gözlemi `[I]`, kanıtlanmış kural değil.

---

### Seviye A — Formu düzelt ⭐ *önerdiğim kapsam*

**UX davranışı:**
- **Tarih ve bitiş tarihi düzenlenebilir alan olur** (`UX-23`, `UX-24`) → çok günlü etkinlik mümkün hale gelir
- Alan sırası tersine döner: **Konu en üstte ve odaklanmış**; "Renk Değiştir" ikincil bir kontrole iner (`UX-25`)
- **Tek birincil aksiyon**: Oluştur; tip seçici net bir segment kontrolü olur (`UX-26`, `UX-27`)
- Saat alanları **yazılabilir** hale gelir (`UX-28`)
- Zorunlu alan işareti + alan altı hata satırı (`FN-06`)
- Katman/örtüşme hatası, terminoloji ve yazım düzeltmeleri (`UX-38`, `UX-34`, `UX-35`, `UX-37`)
- Varsayılan süre gözden geçirilir (`UX-29`)

**Gerekli veri:** Yok — mevcut alan setiyle çalışıyor.
**Frontend etkisi:** Orta — form yeniden düzenlenir, yeni bileşen sayısı az.
**Backend/domain bağımlılığı:** **Neredeyse yok.** Bitiş tarihi alanı domain'de zaten olabilir (`[U]`); geri kalanı sunum katmanı.
**Cluster bağımlılıkları:** PC-12 (buton durum dili, validasyon mesajları) · PC-03 (tip kontrolü neyi seçecek? `⚠ A-05`)
**Risk / trade-off:** Düşük. Tek gerçek risk: tip seçici `A-05` cevaplanmadan tasarlanırsa yanlış kavramı görselleştirebilir.
**Değer:** **High** · **Karmaşıklık:** **Low**

> 💡 **Bu, dört cluster içindeki tek High-değer / Low-karmaşıklık kombinasyonu.** Maddelerin tamamı **pattern seviyesinde**, yeni subsystem gerektirmiyor (D-012, benchmark Bölüm 13 satır 4).

---

### Seviye B — İki katmanlı oluşturma + katılımcı sadeleştirme

**A'ya eklenenler:**
- **Hızlı katman:** slot'a tıklayınca başlık + zaman + Oluştur; "Daha fazla seçenek" ile detaylı forma geçiş
- **Katılımcı kavramı üçten ikiye iner:** *Katılımcılar* (iç) + *Misafirler* (dış); "Tüm Katılımcılar" özeti tekrarı kaldırılır (`UX-32`); `(+)` butonu etiketlenir (`UX-33`)
- **Etkinlik detay / düzenleme / silme akışının tanımlanması** (`FN-13`)
- Tüm gün etkinlik anahtarı

**Frontend etkisi:** Yüksek — iki katmanlı form + yeni detay/düzenleme ekranı.
**Backend/domain bağımlılığı:** Orta — düzenleme/silme yetki kuralları domain'e dokunuyor.
**Cluster bağımlılıkları:** PC-03 (alan seti) · PC-11 (kim düzenleyebilir) · PC-02 (tüm gün gösterimi) · PC-05 (seri düzenleme aynı ekranı kullanacak)
**Risk / trade-off:** ⚠️ **`A-09` cevaplanmadan düzenleme/silme akışı tasarlanamaz** — organizatör mü, katılımcı mı, admin mi? Ayrıca `FN-13` hâlâ `[U]`: bugün düzenleme var mı bilmiyoruz. **D-006 gereği bu bloke edici değil** (nasılsa yeniden tasarlanacak) ama kapsamı etkiliyor.
**Değer:** High · **Karmaşıklık:** Medium

---

### Seviye C — Zengin etkinlik

**B'ye eklenenler:** Şablon / kopyalama (`U-17`) · ek dosya (`U-18`) · online toplantı linki (`U-19`) · hatırlatıcı alanı (`C-5`)

> ⚠️ **D-013 uyarısı:** **Bu seviyedeki `U-17`, `U-18`, `U-19` maddelerinin hiçbirinin audit'te doğrulanmış bir problem karşılığı yok.** Üçü de "ihtiyaç doğrulanmadı" etiketiyle Bölüm 6.3'ten geliyor. *"Rakipte var"* tek başına candidate oluşturmaz. Yalnızca `C-5` (hatırlatıcı) iç kaynaklı bir aday — Narbulut'un kendi test notundan geliyor.

**Cluster bağımlılıkları:** PC-13 (hatırlatıcı bildirim üretir)
**Değer:** Low–Medium *(doğrulanmamış)* · **Karmaşıklık:** Medium
**Önerim: Bu seviyeyi FAZ 3'e taşı**, kapsam kararı verme.

---

### PC-04 özet

| Seviye | Değer | Karmaşıklık | Audit karşılığı | Backend etkisi |
|---|---|---|---|---|
| **A** ⭐ | **High** | **Low** | Tamamı doğrulanmış | ~Yok |
| B | High | Medium | Doğrulanmış | Orta |
| C | Low–Medium | Medium | ⚠️ **3/4'ü doğrulanmamış** | Orta |

**Önerim: A kesinlikle, B muhtemelen, C için karar verme.**

---

# Toplu görünüm

| Cluster | Kategori | A | B | C | Önerim | En büyük belirsizlik |
|---|---|---|---|---|---|---|
| **PC-08** Oda Veri Modeli | 🔷 Foundation | Med / L-M | **High / Med** ⭐ | Cond.High / High | **B** | A-07 · çok binalı mı? |
| **PC-09** Oda Keşfi | 🟦 Direct | High / L-M | **High / Med** ⭐ | Med / High | **B** | A-08 |
| **PC-11** İzin Modeli | 🔷 Foundation | Med / **Low** | **High / M-H** ⭐ | Cond.High / High | **B** *(düşük güven)* | **A-01, A-02, A-03** |
| **PC-04** Etkinlik Oluşturma | 🟦 Direct | **High / Low** ⭐ | High / Med | Low-Med / Med | **A**, sonra B | A-05, A-09 |

### Bağımlılık zinciri — seviyeler nasıl kilitleniyor

```
PC-08 A ──> PC-09 A   (çakışma uyarısı)
PC-08 B ──> PC-09 B   (filtreli, müsaitlik-farkında seçici)      ← burası kırılma noktası
PC-08 C ──> PC-10     (⚠️ CONDITIONAL — FAZ 3 doğrulaması gerekli)

PC-11 B ──> PC-07     (free/busy olmadan scheduling inşa edilemez)
PC-11 B ──> PC-09 B   ("rezerve edemezsin" doğru gösterimi)
PC-11 C ──> PC-10     ("kim onaylar")

PC-04 A ──> (bağımsız)                                           ← tek serbest hamle
PC-04 B ──> PC-03 (alan seti) + PC-11 (kim düzenleyebilir)
```

**Okuma notu:** PC-04 A, hiçbir foundation'a bağlı olmayan **tek** yüksek değerli seviye. Diğer üç cluster'ın anlamlı seviyeleri bir foundation kararına bağlı.

---

# FAZ 3'e taşınan iş kuralı soruları

Bu partide açığa çıkan, **cevaplanmadan kapsamın kesinleşemeyeceği** sorular:

| ID | Soru | Kilitlediği |
|---|---|---|
| **A-01** | Oda erişim yetkisi ne veriyor — görme mi, rezerve etme mi? | PC-11 B/C · PC-10 |
| **A-02** | Kullanıcılar birbirlerinin takvimini görebilmeli mi? Free/busy mi, detay mı? | **PC-11 B · PC-07 tamamı** |
| **A-03** | Panel + tenant + rol yapısı — matris hangi seviyede yaşıyor? | PC-11 C |
| **A-05** | "Toplantı" ile "Etkinlik" gerçek bir iş ayrımı mı? | PC-04 A (tip kontrolü) · PC-03 |
| **A-07** | "Paylaşımlı oda" = "tüm kullanıcılar erişebilir" mi? | PC-08 B |
| **A-08** | "Odalara Göre" bugün kullanılıyor mu? | PC-09 · KEEP-02'nin geçerliliği |
| **A-09** | Etkinliği kim düzenleyebilir/silebilir? | PC-04 B |
| **YENİ-01** | Lokasyon modeli — basit etiket mi, bina+kat mı, hibrit mi? | PC-08 B — **FAZ 3 kararı** |
| **YENİ-02** | Oda oluşturma deneyimi tek ekran mı, sihirbaz mı? | PC-08 B — **FAZ 3 Product/UX kararı** |
| **YENİ-03** | Dolu odalar gizlensin mi, devre dışı gösterilsin mi? | PC-09 B — **FAZ 3 Product/UX kararı** |

---

# Faz kapısı

**Bu dokümanda yer almayan şeyler:**
❌ P0/P1/P2 önceliği · ❌ Seçim tablosu (`Kararım` kolonu) · ❌ Final feature seçimi · ❌ Product Spec · ❌ Tasarım · ❌ Kod · ❌ Kod süresi/efor tahmini

**Durum:** ✅ FINAL. Kalan cluster'lar için geniş A/B/C üretilmedi — FAZ 3 kararları sonrası **Scope Closure Pass** ile kapatıldılar (`04-scope-closure.md`). Bu dosya tarihsel kayıt olarak korunuyor.
