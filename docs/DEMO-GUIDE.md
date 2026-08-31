# DEMO-GUIDE — 4–6 dakikalık sunum akışı

Hazırlık: `npm run dev` → http://localhost:5180 · pencere **1440×900 veya daha geniş**.
Sayfayı yenilemek her zaman başlangıç durumuna döndürür.

Açılışta gördükleriniz: **28 Ağustos 2026 Cuma** haftası, saat **15:00** (mavi "şimdi" çizgisi).
Oturum sahibi: **Deniz Aydın · Ürün Yöneticisi**.

---

## Akış

### Bölüm 1 · Takvim kabuğu (≈45 sn)

| # | Ne yapılır | Ne söylenir / beklenen sonuç |
|---|---|---|
| 1 | Ekranı göster | Hafta ızgarası, sol rail, "24 – 30 Ağustos 2026". Çalışma saatleri dışı bantlar soluk; bugün sütunu hafif mavi; 15:00'te "şimdi" çizgisi. |
| 2 | Üstteki **›** okuna bas | Hafta ileri gider, başlık "31 Ağustos – 6 Eylül 2026" olur. *Eski üründe hafta gezinme kontrolleri yoktu.* |
| 3 | Sol karttaki **Bugün** | Bugünkü haftaya döner. |
| 4 | Sol raildeki **Proje** onay kutusunu kapat, tekrar aç | Yeşil etkinlikler ızgaradan düşer ve geri gelir. Takvim görünürlüğü gerçekten çalışır. |

### Bölüm 2 · Etkinlik ve paylaşım okunabilirliği (≈45 sn)

| # | Ne yapılır | Beklenen sonuç |
|---|---|---|
| 5 | **Cuma 09:30 "Kick-off"** bloğuna tıkla | Etkinlik drawer'ı açılır. Başlıkta **"Onay bekliyor"** rozeti; "Nerede" bölümünde Boğaziçi ve onaylayıcı bilgisi. Kapat (**×**). |
| 6 | **Çarşamba 11:00 "Ürün Demo"** (koyu yeşil) bloğuna tıkla | Farklı bir drawer açılır: **Düzenle / Sil aksiyonu yok**. Altta "Mert Kaya'nın paylaştığı takvim" notu. *Paylaşım salt okunurdur; pasif buton bile göstermiyoruz.* Kapat. |

### Bölüm 3 · Etkinlik oluşturma (≈90 sn)

| # | Ne yapılır | Beklenen sonuç |
|---|---|---|
| 7 | **Cuma sütununda 11:00 satırındaki boş alana** tıkla | Hızlı oluşturma balonu açılır: tarih/saat ve **varsayılan takvim** yazılı. |
| 8 | Başlığa **`Sunum Provası`** yaz | — |
| 9 | **Daha fazla seçenek** | Detaylı etkinlik formu açılır; başlık taşınır. |
| 10 | "Kimlerle" arama kutusuna **`Ayşe`** yaz, **Ayşe Demir**'i seç | Satırda kırmızı **"Meşgul 11:00 – 12:00"** görünür. *Bu uyarıdır, engel değildir — Kaydet hâlâ aktif.* |
| 11 | "Nerede" bölümünde **Oda seç** | Oda seçici yandan açılır; etkinlik formu beyaz peçe altında durur. |

### Bölüm 4 · Oda seçici — dört durum (≈60 sn)

Ekranda dört odanın dördü de farklı bir durumu gösterir:

| Oda | Durum | Gösterilen |
|---|---|---|
| **İstanbul** | Müsait, yetkili | **Seç** aktif, uygun saat çipleri |
| **Boğaziçi** | Müsait ama **onay gerekli** | "Onaylayıcı Zeynep Aksoy · rezervasyon 'Onay bekliyor' başlar." |
| **Topkapı** | **Dolu** | "Talep edilen saat dolu" · sağda **Seçilemez** |
| **Galata** | **Yetki yok** | "Rezervasyon yetkiniz yok" · oda gizlenmez, saat bilgisi paylaşılmaz, **Yetki iste** |

| # | Ne yapılır | Beklenen sonuç |
|---|---|---|
| 12 | Topkapı'yı seçmeye çalış | Seçilemez. *Eski üründe dolu oda kavramı yoktu.* |
| 13 | **Boğaziçi → Seç**, sonra **Odayı ata** | Formda Boğaziçi görünür, altında onay uyarısı. |
| 14 | **Kaydet** | Alt şeritte: **"Talebiniz gönderildi, onay bekliyor."** *Başarı dili kullanmıyoruz — çünkü henüz onaylanmadı.* |
| 15 | Izgaraya bak | "Sunum Provası" bloğu Cuma 11:00'de; şeritte **saat ikonu** = onay bekliyor. |

### Bölüm 5 · Onay (≈75 sn)

| # | Ne yapılır | Beklenen sonuç |
|---|---|---|
| 16 | Sol raildeki **Odalar** → Durum kartında **"4 bekleyen talep"** | Talepler ekranı: solda liste, sağda seçili talebin detayı. |
| 17 | Listeden **"Sunum Provası"** | Detayda **Onayla/Reddet yok**. Yerine: *"Bu sizin talebiniz. Kendi rezervasyon talebinizi onaylayamazsınız; kararı Zeynep Aksoy verecek."* + **Talebi geri çek**. |
| 18 | Listeden **"Ürün Roadmap"** (Mert Kaya) | Deniz bu odanın onaylayıcısı olduğu için **Onayla / Reddet** görünür. Detayda oda, talep eden, katılımcı/kapasite ve **odanın o günkü yatay çizelgesi**. |
| 19 | **Onayla** | "Topkapı rezervasyonu onaylandı." |
| 20 | Sol üstteki **‹** ile takvime dön, **Perşembe 27**'ye bak | "Ürün Roadmap" bloğundaki saat ikonu kayboldu — rezervasyon kesinleşti. |

> İsteğe bağlı: **Reddet** akışını göstermek isterseniz gerekçe alanı inline açılır ve
> gerekçe opsiyoneldir; red sonrası oda serbest kalır, **etkinlik silinmez**.

### Bölüm 6 · Takvim paylaşımı (≈60 sn)

| # | Ne yapılır | Beklenen sonuç |
|---|---|---|
| 21 | Sol railde **Kişisel** satırının **⋯** → **Paylaş** | Paylaşım drawer'ı. Üstte zorunlu açıklama: *"mevcut ve gelecekteki etkinlik detayları…"* ve varsayılan takvim uyarısı. |
| 22 | Aramaya **`Selin`** yaz, **Selin Arı**'yı seç | Listeye eklenir: "Etkinlik detaylarını görebilir". Tek seviye vardır, izin dropdown'ı yoktur. |
| 23 | Bir kişinin **Kaldır**'ına bas → onayla | *"… erişimi kaldırıldı. Bu takvim artık kendisine görünmüyor."* Kaldırma anında etkilidir. **Bitti** ile kapat. |
| 24 | **Benimle paylaşılanlar → Ürün** onay kutusunu kapat | Mert Kaya'nın etkinlikleri ızgaradan düşer. Tekrar aç. Satırın üstüne gelince **⋯ → Takvimi kaldır** çıkar: alıcının çıkış yolu. |

---

## Mobil (isteğe bağlı, ≈30 sn)

Tarayıcı penceresini **390px** genişliğe daralt (veya cihaz emülasyonu).

- Hafta ızgarası **küçültülmez**; **gün/agenda** görünümüne geçer.
- Üstte tarih kartı + hafta şeridi, altta "N talebiniz onay bekliyor" şeridi.
- **Takvimler** → sheet: *Takvimlerim* / *Benimle paylaşılanlar* ayrımı, sahibin adı ikincil.
- Paylaşılan satırın **⋯** → **Takvimi kaldır** action sheet'i. Mobilde sahip tarafı paylaşım
  yönetimi yoktur.

---

## E-posta tasarım sistemi (isteğe bağlı, ≈30 sn)

`prototype/emails/dist/index.html` dosyasını tarayıcıda aç.
16 şablonun tamamı tek sayfada, konu satırı ve alıcı bilgisiyle listelenir.
Gerçek gönderim yoktur; şablonlar `19-notifications-spec.md`'de tanımlı olaylarla birebirdir.

---

## Kullanılan örnek veri

| | |
|---|---|
| **Oturum** | Deniz Aydın · Ürün Yöneticisi · Ürün + Operasyon gruplarında |
| **Takvimler (sahip)** | Kişisel *(varsayılan, mor)* · Proje *(yeşil)* · Ekip *(bordo)* · Toplantılar *(turuncu)* |
| **Paylaşılanlar** | Ürün *(Mert Kaya)* · Pazarlama *(Ayşe Demir, kapalı)* |
| **Odalar** | İstanbul 12 · Boğaziçi 6 *(onay: Zeynep Aksoy)* · Topkapı 20 *(onay: Ahmet Yıldız, Deniz Aydın)* · Galata 4 *(rezervasyon: Yönetim)* |
| **Bekleyen talepler** | Ürün Roadmap *(Mert Kaya → Topkapı)* · Ürün Demo ve Kick-off *(Deniz'in kendi talepleri)* |

---

## Sorun çıkarsa

| Belirti | Çözüm |
|---|---|
| Demo yarıda bozuldu | **F5** — başlangıç durumuna döner |
| Port dolu | Vite bir sonraki boş portu seçer; terminaldeki adresi kullanın |
| Font farklı görünüyor | `npm install` eksik olabilir; fontlar pakette gelir |
| "Kendi talebimi onaylatmam gerekiyor" | **Shift+D** → persona **Zeynep Aksoy** → onayla → persona geri al |
