# Narbulut Takvim — Frontend Prototype

Narbulut Takvim modülünün **çalışan** frontend prototipi. Canonical tasarım dosyasının
(`Narbulut Calendar - Final Screens.dc.html`) ve `docs/takvim/` altındaki ürün spec'lerinin
tıklanabilir, gerçek durum tutan implementasyonudur.

Backend yoktur. Tüm veri bellekte tutulur; sayfa yenilendiğinde başlangıç demo durumuna döner.

---

## Ne var, ne yok

**Var**
- Hafta / gün / ay / "odalara göre" takvim görünümleri, gerçek gezinme
- Etkinlik oluşturma, düzenleme, silme — durum gerçekten değişir
- Oda seçici: müsait / dolu / onay bekliyor / yetkisiz durumları gerçek kurallarla
- Rezervasyon onay akışı: talep → onay/red → takvimde sonuç
- Takvim paylaşımı: kişi ekleme/kaldırma, alıcı tarafında görünürlük ve kaldırma
- Oda yönetimi ve izin (erişim) yönetimi ekranları
- 390px mobil agenda görünümü ve sheet'ler
- 16 e-posta şablonu (statik önizleme)

**Yok**
- Gerçek backend, veritabanı, kimlik doğrulama
- Gerçek e-posta gönderimi (SMTP/API)
- Sunucu tarafı yetki uygulaması, eşzamanlılık, ICS, harici takvim senkronizasyonu

Ayrıntı: [`docs/KNOWN-LIMITATIONS.md`](docs/KNOWN-LIMITATIONS.md)

---

## Kurulum

Node 20+ gerekir (geliştirmede Node 24.18 kullanıldı).

```bash
cd prototype
npm install
```

> `npm install` **tek internet gerektiren adımdır.** Sonrasında prototip tamamen çevrimdışı
> çalışır: Poppins fontu paketin içinde (`src/styles/fonts/`), harici CDN veya ağ isteği yoktur.

## Çalıştırma

```bash
npm run dev
```

→ http://localhost:5180

## Derleme ve statik sunum

```bash
npm run build     # dist/ üretir
npm run preview   # dist/'i http://localhost:5180 üzerinden sunar
```

Sunumda **`npm run dev`** yeterlidir ve en hızlısıdır.

> `dist/index.html` dosyasını doğrudan çift tıklayarak açmayın: modern tarayıcılar
> `file://` üzerinden ES modüllerini engeller. `npm run preview` kullanın.

## Diğer komutlar

```bash
npm test          # 42 birim/entegrasyon testi (vitest)
npm run typecheck # TypeScript kontrolü
npm run lint      # oxlint
node emails/build.mjs             # e-posta şablonlarını yeniden üretir
node scripts/demo-flow.mjs        # canonical demo akışını uçtan uca yürütür (dev server açıkken)
node scripts/screenshots.mjs      # sunum ekran görüntülerini üretir (dev server açıkken)
```

`demo-flow` ve `screenshots` betikleri `puppeteer-core` ile sistemdeki Google Chrome'u
kullanır; ayrıca tarayıcı indirmez.

---

## Sunum öncesi hazırlık (çevrimdışı)

1. İnternet varken bir kez: `npm install`
2. Doğrula: `npm run build && npm test`
3. Sunum makinesinde: `npm run dev` → http://localhost:5180
4. Tarayıcıyı **1440×900 veya daha geniş** aç; mobil için pencereyi 390px'e daralt
5. Akış: [`docs/DEMO-GUIDE.md`](docs/DEMO-GUIDE.md)

Sayfayı yenilemek demoyu başlangıç durumuna döndürür — arada kaybolursanız `F5` yeterlidir.

**Shift+D** sunum arayüzünde görünmeyen demo panelini açar (persona değiştirme, demoyu başa
alma). Sunum sırasında gerekmez; yalnızca "kendi talebini onaylatma" varyantı için vardır.

---

## Dokümantasyon

| Dosya | İçerik |
|---|---|
| [`docs/DEMO-GUIDE.md`](docs/DEMO-GUIDE.md) | 4–6 dakikalık sunum akışı, adım adım |
| [`docs/FRONTEND-ARCHITECTURE.md`](docs/FRONTEND-ARCHITECTURE.md) | Bileşen yapısı, durum modeli, mock/backend sınırı |
| [`docs/BACKEND-HANDOFF.md`](docs/BACKEND-HANDOFF.md) | Gereken API'ler, entity eşlemesi, yetki uygulaması |
| [`docs/DESIGN-IMPLEMENTATION-MAP.md`](docs/DESIGN-IMPLEMENTATION-MAP.md) | Canonical 01–08 → React karşılıkları |
| [`docs/EMAIL-DESIGN-SYSTEM.md`](docs/EMAIL-DESIGN-SYSTEM.md) | E-posta tasarım sistemi ve şablon matrisi |
| [`docs/KNOWN-LIMITATIONS.md`](docs/KNOWN-LIMITATIONS.md) | Bilinen sınırlar |
| [`AUTONOMOUS-STATUS.md`](AUTONOMOUS-STATUS.md) | Yürütme denetim izi ve fallback kararları |

Ürün spec'leri prototipin dışındadır: `../docs/takvim/`.
