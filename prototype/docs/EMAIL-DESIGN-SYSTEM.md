# EMAIL-DESIGN-SYSTEM  *(FAZ 8)*

Amaç: `19-notifications-spec.md`'de **tanımlı** bildirim olaylarının e-posta görsel dilini
kurmak. Gerçek gönderim sistemi kurulmadı; çıktı sunuma hazır statik şablonlardır.

⚠️ **Yeni bildirim olayı üretilmedi.** 16 şablon = spec'teki 16 domain event.

---

## 1. Üretim ve önizleme

```bash
node emails/build.mjs            # emails/dist/ altına 16 HTML + index.html üretir
open emails/dist/index.html      # tüm şablonlar tek sayfada
```

| Dosya | Rol |
|---|---|
| `emails/tokens.mjs` | `src/styles/tokens.css`'in e-posta güvenli alt kümesi |
| `emails/layout.mjs` | Gövde iskeleti + `button` · `factTable` · `notice` yardımcıları |
| `emails/templates.mjs` | 16 olayın içeriği |
| `emails/build.mjs` | HTML üretimi + önizleme dizini |

---

## 2. Teknik kısıtlar

E-posta istemcileri modern CSS'i güvenilir biçimde desteklemez. Uygulanan kurallar:

| Kısıt | Uygulama |
|---|---|
| CSS değişkeni yok | Token'lar üretim sırasında **satır içi** yazılır |
| Flex/grid güvenilmez | Tablo tabanlı düzen (`role="presentation"`) |
| `<style>` kırpılabilir | Tüm kritik stiller satır içi; `<style>` yalnız responsive ek |
| Webfont çoğu istemcide yüklenmez | `'Poppins', 'Segoe UI', Roboto, Helvetica, Arial` — kademeli düşüş |
| Outlook/Word motoru | `<!--[if mso]>` ile Arial'e düşürme; buton "bulletproof" tablo hücresi |
| Harici görsel engellenebilir | **Görsel kullanılmadı.** Marka, renk şeridi ve metin wordmark ile |
| Karanlık mod zorlaması | `color-scheme: light` + açık yüzeylerde yeterli kontrast |
| Gelen kutusu ön izlemesi | Gizli preheader + görünmez dolgu |

### Responsive
600px sabit genişlik; `max-width: 620px` altında `.wrap` %100'e, yatay dolgu 20px'e,
başlık 21px'e düşer. Tek kolon olduğu için yığılma gerekmez.

---

## 3. Görsel dil

Uygulama arayüzüyle aynı token'lar:

| Rol | Değer |
|---|---|
| Marka | `#0058B8` |
| Metin | `#16191D` / `#525C6B` / `#7C8697` / `#9AA0A6` |
| Yüzey / sayfa | `#FFFFFF` / `#EFF2F5` |
| Hairline | `#E6EAEE` (panel) · `#EDEFF2` (ayırıcı) |
| Semantik | `#9C3227` hata · `#7A5300` uyarı · `#2F6B4F` olumlu · `#F5F9FE` bilgi yüzeyi |

**Üst renk şeridi (4px)** e-postanın türünü bir bakışta verir:

| Şerit | Anlam |
|---|---|
| Takvim rengi | Etkinlik ve seri olayları — takvimin kendi rengi |
| `#7A5300` | Karar veya dikkat bekleyen rezervasyon olayı |
| `#2F6B4F` | Olumlu sonuç (onaylandı) |
| `#9C3227` | İptal / red |
| `#7C8697` | Nötr sonlanma (erişim sona erdi, talep geri çekildi) |

### Anatomi
```
4px renk şeridi
Narbulut ····························· Takvim
GÖZ ÜSTÜ ETİKET
Başlık (600 · 23px)
Kurşun cümle — ne oldu, kim yaptı
Bilgi tablosu (etiket / değer, ince ayırıcılar)
Durum şeridi (opsiyonel, sol renkli çubuk)
Aksiyon butonu / butonları
──────────
Alt not + otomatik gönderim açıklaması
```

---

## 4. Dil kuralları

Spec'ten devralınan ton kararları:

- **Bekleyen rezervasyonda başarı dili yok** (`BR-APR-07`). N-RES-01 "onayınız bekleniyor" der,
  "başarıyla oluşturuldu" demez.
- **Sessiz kaybolma yok** (`ST-CORE-01`). Erişim veya davet kaybı her zaman açıkça bildirilir
  (N-CAL-02, N-EVT-05).
- **Engelleyici / engellemeyen ayrımı korunur.** Kapasite aşımı gibi durumlar uyarı tonundadır.
- **Free/busy detay yasağı** (`BR-PRM-11`). Onaylayıcıya giden e-postalar karar için gereken
  bağlamı taşır; talep edenin diğer etkinlik detaylarını açmaz.
- **Kararın geri alınamazlığı** (`BR-APR-22`) N-RES-01 alt notunda açıkça söylenir.
- Konu satırları **eylem + özne + zaman** kalıbında: `Onaylandı: Topkapı · 27 Ağustos, 14:00 – 15:00`.

---

## 5. Şablon matrisi

| Kod | Olay | Alıcı | E-posta zorunlu | Şerit |
|---|---|---|---|---|
| `N-EVT-01` | Etkinliğe davet edildin | Katılımcılar (iç + harici) | Harici varsa | takvim rengi |
| `N-EVT-02` | Etkinlik güncellendi | Yalnız etkilenen katılımcılar | Harici varsa | takvim rengi |
| `N-EVT-03` | Etkinlik iptal edildi | Tüm katılımcılar | Harici varsa | kırmızı |
| `N-EVT-04` | Katılımcı eklendi | Yalnız eklenen | Eklenen harici ise | takvim rengi |
| `N-EVT-05` | Katılımcı çıkarıldı | Yalnız çıkarılan | Çıkarılan harici ise | nötr |
| `N-EVT-06` | RSVP yanıtı verildi | Organizatör | Hayır | takvim rengi |
| `N-SER-01` | Seri güncellendi | Etkilenen katılımcılar | Harici varsa | takvim rengi |
| `N-SER-02` | Seri iptal edildi | Tüm katılımcılar | Harici varsa | kırmızı |
| `N-SER-03` | Tek tarih seriden ayrıldı | Etkilenen katılımcılar | Harici varsa | takvim rengi |
| `N-CAL-01` | Takvim seninle paylaşıldı | Paylaşım alıcısı | Hayır | takvim rengi |
| `N-CAL-02` | Takvim paylaşımı kaldırıldı | Eski alıcı | Hayır | nötr |
| `N-RES-01` | Rezervasyon talebi gönderildi | Onaylayıcı(lar) | Hayır | uyarı |
| `N-RES-02` | Rezervasyon onaylandı | Talep eden | Hayır | olumlu |
| `N-RES-03` | Rezervasyon reddedildi | Talep eden | Hayır | kırmızı |
| `N-RES-04` | Rezervasyon iptal edildi | Karşı taraf | Hayır | nötr |
| `N-RES-05` | Bekleyen talebin zamanı değişti | Onaylayıcı | Hayır | uyarı |

**E-posta zorunlu** kolonu `19-notifications-spec.md` BR-NOT-03'ten gelir: harici misafirin
uygulama içi bildirim alma yolu yoktur, e-posta tek kanaldır.

---

## 6. Backend'e taşırken

1. `emails/templates.mjs` içindeki içerik nesnelerini şablon motoruna (Handlebars, Liquid, MJML…)
   taşıyın; `layout.mjs` iskeletini partial yapın.
2. Örnek veriyi (`D` nesnesi) gerçek değişkenlerle değiştirin.
3. Kanal seçimini `19-notifications-spec.md`'deki alıcı ve zorunluluk kolonlarından türetin.
4. Düz metin (`text/plain`) alternatifi ekleyin — şu an yalnız HTML üretiliyor.
5. Gönderim öncesi Litmus/Email on Acid benzeri bir istemci matrisinde doğrulayın.
