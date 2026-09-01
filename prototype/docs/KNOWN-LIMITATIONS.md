# KNOWN-LIMITATIONS

Bu prototipin **kasıtlı** sınırları. Hiçbiri hata değildir; kapsam dışı bırakılmış
veya backend gerektiren konulardır.

---

## Altyapı

| # | Sınır | Sonuç |
|---|---|---|
| L-01 | **Backend yok** | Tüm veri bellekte; `src/lib/state/demoData.ts` |
| L-02 | **Veritabanı yok** | Sayfa yenilendiğinde her şey başlangıç durumuna döner |
| L-03 | **Kimlik doğrulama yok** | Oturum kullanıcısı sabit: Deniz Aydın |
| L-04 | **Kalıcılık yok** (`localStorage` dahil) | Bilinçli: bozuk bir demo durumu kalıcılaşmasın |
| L-05 | **Gerçek e-posta gönderimi yok** | SMTP/API kurulmadı; `emails/dist/` statik önizleme |
| L-06 | **Eşzamanlılık yok** | İki kullanıcının aynı slotu istemesi modellenmedi |
| L-07 | **Sunucu tarafı yetki uygulaması yok** | İstemcideki kontroller güvenlik sınırı **değildir** |

## Zaman ve takvim

| # | Sınır | Sonuç |
|---|---|---|
| L-08 | **Demo saati sabit:** 28 Ağustos 2026 Cuma 15:00 | Sunum her açılışta aynı ekranı gösterir |
| L-09 | **Saat dilimi desteği yok** | Tarih `YYYY-MM-DD`, saat gün içi dakika |
| L-10 | **Tekrarlayan seri açılmıyor** | `recurrence` alanı taşınır, rozet/ikon gösterilir; occurrence'lar ızgarada çoğaltılmaz. "Bu / bu ve sonrakiler / tüm seri" düzenleme kapsamı uygulanmadı |
| L-11 | **`BR-APR-42` uygulanmadı** | Başlangıcı geçmiş bekleyen talebin otomatik terminal duruma alınması zamanlanmış iş gerektirir |
| L-12 | **Ay görünümü basitleştirilmiş** | Hücre başına en fazla 3 etkinlik + "N daha" |

## Kapsam dışı bırakılanlar

| # | Konu | Kaynak karar |
|---|---|---|
| L-13 | ICS içe/dışa aktarma | Kapsam dışı |
| L-14 | Harici takvim senkronizasyonu (Google/Outlook) | Kapsam dışı |
| L-15 | Public link / harici paylaşım | `BR-CAL-25` — yalnız organizasyon içi tekil kullanıcı |
| L-16 | Grup ile takvim paylaşımı | `BR-CAL-25` |
| L-17 | Etkinlik seviyesinde gizlilik | `BR-PRM-13`, `D-041` |
| L-18 | Kademeli paylaşım seviyeleri | `BR-CAL-26` — tek seviye |
| L-19 | Delegation / self-approval politikası | `BR-APR-17c` |
| L-20 | Çok adımlı onay, eskalasyon, kural motoru | `BR-APR-21`, `D-034` |
| L-21 | RSVP akışının ürün tasarımı | `19` §2 — yalnız bildirim tanımlı |
| L-22 | Takvim oluşturma / yeniden adlandırma / renk değiştirme / silme | Prototipte menü açılır, aksiyon bilgi mesajı verir |
| L-23 | Oda oluşturma / silme | Mevcut odalar düzenlenebilir; ekleme kapsam dışı |
| L-24 | Mobilde sahip tarafı paylaşım yönetimi | Talimatla kapsam dışı; mobilde yalnız "Takvimi kaldır" |

## Arayüz sınırları

| # | Sınır |
|---|---|
| L-25 | Filtreler kartı (Etkinlik türü / Katılımcı) görsel durumdur; filtreleme uygulanmadı |
| L-26 | Oda seçicideki filtre çipleri tek seçimli basit filtrelerdir; canonical'daki açılır menüler yok |
| L-27 | Sürükle-bırak ile etkinlik taşıma/yeniden boyutlandırma yok (`14` SR-SHELL-05 — kapsam dışı) |
| L-27a | Hover önizleme kartı **kasıtlı olarak** yalnız gerçek imleçli cihazlarda çalışır; dokunmatikte hiç render edilmez (`14` BR-SHELL-43). Karttaki her bilgi etkinlik yüzeyinde de vardır (BR-SHELL-42). Karttaki tek aksiyon silmedir; düzenleme kartta yapılmaz (BR-SHELL-45) |
| L-28 | Bildirim merkezi arayüzü yok; bildirimler yalnız durumda tutulur |
| L-29 | Arama yalnız etkinlik başlığında ve yalnız görünür takvimlerde çalışır |
| L-30 | Klavye ile ızgara gezinme (ok tuşları) uygulanmadı |
| L-31 | Yerelleştirme yok — arayüz yalnız Türkçe |

## Test kapsamı

| # | Sınır |
|---|---|
| L-32 | Birim testleri iş kurallarını ve reducer geçişlerini kapsar; bileşen render testi yok |
| L-33 | Uçtan uca akış tek senaryodur (canonical demo akışı), test matrisi değil |
| L-34 | Görsel regresyon testi yok; karşılaştırma elle yapıldı |
| L-35 | Tarayıcı matrisi doğrulanmadı — Chrome 1440×900 ve 390×844'te test edildi |
