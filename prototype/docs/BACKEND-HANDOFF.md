# BACKEND-HANDOFF

Bu prototip backend'siz çalışır ama **backend'e geçişi zorlaştırmayacak** biçimde yazıldı:
gerçekçi ID'ler, gerçekçi entity ilişkileri, iş kurallarının tek bir modülde toplanması.

---

## 1. Şu anda mock olan noktalar

| # | Nokta | Dosya | Gerçekte ne olmalı |
|---|---|---|---|
| M-01 | Tüm veri kümesi | `src/lib/state/demoData.ts` | API'den yüklenir |
| M-02 | Oturum kullanıcısı | `demoData.CURRENT_USER_ID` | Kimlik doğrulama / oturum |
| M-03 | Bugünün tarihi ve saati | `DEMO_TODAY`, `DEMO_NOW_MINUTES` | Sunucu saati + kullanıcı saat dilimi |
| M-04 | ID üretimi | `reducer` içindeki `state.seq` | Sunucu (UUID / ULID) |
| M-05 | Yazma işlemleri | `reducer` doğrudan belleği günceller | API çağrısı + optimistic update + hata geri alma |
| M-06 | Yetki uygulaması | Yalnız istemcide (`rules.ts`) | **Sunucuda zorunlu** (§4) |
| M-07 | Bildirimler | `state.notifications` dizisi | Bildirim servisi + e-posta kuyruğu |
| M-08 | E-posta | `emails/dist/*.html` statik önizleme | Şablon motoru + SMTP/API |
| M-09 | Arama | İstemcide `String.includes` | Sunucu tarafı arama / indeks |
| M-10 | "Uygun zamanlar" | İstemcide 7 gün taraması | Sunucu tarafı free/busy sorgusu |
| M-11 | Eşzamanlılık | Yok | Optimistic locking / sürüm alanı (§5) |
| M-12 | Tekrarlayan seriler | `recurrence` alanı taşınır ama occurrence açılmaz | Seri açma (expansion) + occurrence override modeli |
| M-13 | Gruplar ve üyelikler | `demoData.groups` | Dizin / kullanıcı yönetimi entegrasyonu |
| M-14 | Kalıcılık | Yok — yenileme sıfırlar | Veritabanı |

---

## 2. Entity ve durum eşlemesi

Tipler `src/lib/domain/types.ts` içindedir; API sözleşmesine doğrudan karşılık gelecek
biçimde tasarlandı.

| Entity | Anahtar alanlar | Notlar |
|---|---|---|
| `User` | `id, name, email, title, orgId` | `orgId` yetki sınırıdır (BR-PRM-15) |
| `Group` | `id, name, memberIds[]` | Yetki toplamsal birleşimde kullanılır |
| `Building` | `id, name` | Oda lokasyonu opsiyoneldir |
| `Calendar` | `id, name, color, ownerId, kind, isDefault` | ⚠️ Sahiplik ve varsayılan takvim **spec'te bağlayıcı business rule değildir** (`12` §15 R1–R4); mevcut Narbulut veri modeline göre uyarlanmalı |
| `CalendarShare` | `id, calendarId, granteeId, createdAt, visibleForGrantee` | `(calendarId, granteeId)` **tekil olmalı** (BR-CAL-35) |
| `Room` | `id, name, buildingId, floor, capacity, features[], active, requiresApproval, approverUserIds[], approverGroupIds[], canView, canReserve` | `canView`/`canReserve` → `AccessRule` |
| `AccessRule` | `allUsers, userIds[], groupIds[]` | **Explicit deny yoktur** (BR-PRM-05) |
| `CalendarEvent` | `id, calendarId, title, date, start, end, organizerId, participantIds[], roomId, notes, recurrence` | `start`/`end` gün içi **dakika** (09:30 → 570) |
| `Reservation` | `id, eventId, roomId, date, start, end, status, requesterId` | `status: reserved \| pending \| rejected \| cancelled` |
| `ApprovalRequest` | `id, reservationId, eventId, roomId, requesterId, status, createdAt, decidedById, decidedAt, reason` | `status: pending \| approved \| rejected \| cancelled` |
| `AppNotification` | `id, kind, recipientId, createdAt, title, body, read` | `kind` = `19-notifications-spec.md` kodları |

### Zaman gösterimi
Prototipte tarih `YYYY-MM-DD`, saat gün içi dakikadır. Bu, saat dilimi karmaşasını demo
kapsamı dışında tutmak içindir. **Backend'de UTC instant + IANA saat dilimi** kullanılmalı;
dönüşüm `src/lib/domain/time.ts` içinde tek noktada yapılır.

### Durum makineleri

```
Reservation:  (yok) → pending ──approve──→ reserved
                        │                     │
                        ├──reject───→ rejected│
                        ├──withdraw──→ cancelled
                        └──event silindi / oda kaldırıldı──→ cancelled
              (yok) → reserved            (onay gerekmeyen oda)

ApprovalRequest: pending → approved | rejected | cancelled   (terminal, geri alınamaz)
```

`BR-APR-42`: başlangıç saati geçmiş `pending` talep terminal duruma alınır.
**Bu kural prototipte uygulanmadı** (zamanlanmış iş gerektirir) — backend'de bir zamanlayıcı
görevi olmalıdır.

---

## 3. Gereken API'ler

Aşağıdaki yüzey prototipin fiilen ihtiyaç duyduğu minimumdur.

### Okuma
```
GET  /me                                        oturum + gruplar
GET  /calendars                                 sahip olunanlar + benimle paylaşılanlar
GET  /events?from&to&calendarIds                aralık sorgusu (hafta/gün/ay)
GET  /freebusy?userIds&from&to                  yalnız müsait/meşgul (BR-PRM-11)
GET  /rooms                                     çağıranın görebildiği odalar (BR-PRM-09)
GET  /rooms/{id}/availability?date&from&to      available | reserved | pending
GET  /requests?scope=queue|mine                 onay kuyruğu (BR-APR-25)
GET  /notifications
```

### Yazma
```
POST   /events                    { calendarId,title,date,start,end,participantIds,roomId,notes,recurrence }
                                  → { event, reservation?, request? }   (tek atomik işlem)
PATCH  /events/{id}
DELETE /events/{id}               → bağlı rezervasyon/talep cancelled (BR-APR-31)

POST   /requests/{id}/approve     → 403 self-approval (BR-APR-17a)
POST   /requests/{id}/reject      { reason? }
POST   /requests/{id}/withdraw    yalnız talep eden (BR-APR-16)

POST   /calendars/{id}/shares     { granteeId }   → 409 zaten paylaşılmış (BR-CAL-35)
DELETE /calendars/{id}/shares/{userId}            sahip kaldırır (BR-CAL-33)
DELETE /calendars/{id}/shares/me                  alıcı kaldırır (BR-CAL-34)
PATCH  /calendars/{id}/shares/me  { visible }     alıcı görünürlüğü (BR-CAL-32)

PUT    /rooms/{id}                oda ayarları + erişim kuralları
```

### Beklenen hata sözleşmesi
İstemci hataları **alan bazlı** göstermek zorunda (mevcut sistemin "sessiz hata" davranışı
FAZ 1'de temel problem olarak işaretlendi). Öneri:

```json
{ "error": { "code": "ROOM_CONFLICT", "field": "roomId",
             "message": "Topkapı seçtiğiniz saatte dolu." } }
```

Karşılanması gereken kodlar:
`ROOM_CONFLICT` · `ROOM_PENDING_CONFLICT` · `NO_ELIGIBLE_APPROVER` · `SELF_APPROVAL_FORBIDDEN` ·
`ROOM_RESERVE_FORBIDDEN` · `ROOM_NOT_VISIBLE` · `EMPTY_ACCESS_RULE` · `APPROVER_REQUIRED` ·
`SHARE_DUPLICATE` · `SHARE_SELF` · `SHARE_EXTERNAL_USER` · `REQUEST_ALREADY_DECIDED`

---

## 4. Yetki uygulaması nereye taşınmalı

⚠️ **Prototipteki yetki kontrolleri yalnız arayüz içindir. Hiçbiri güvenlik sınırı değildir.**

Sunucuda **zorunlu** olarak yeniden uygulanması gerekenler:

| Kural | Neden sunucuda |
|---|---|
| `canViewRoom` / `canReserveRoom` (BR-PRM-05/06/09) | İstemci listeyi filtreliyor; API doğrudan çağrılabilir |
| `roomAvailability` çakışma kontrolü (BR-RB-21, BR-APR-11) | Yarış durumu yalnız sunucuda çözülebilir |
| `canCreatePendingRequest` — eligible approver (BR-APR-17b) | Çözümsüz `pending` üretimini yalnız sunucu engelleyebilir |
| `canDecideRequest` — self-approval yasağı (BR-APR-17a) | Yetki kararı |
| `canEditEvent` — paylaşım salt okunur (BR-CAL-27) | Alıcı `PATCH /events/{id}` çağırabilir |
| Free/busy detay kısıtı (BR-PRM-11) | `/freebusy` **asla** başlık, oda, katılımcı dönmemeli |
| `visibleRequests` (BR-APR-25/27) | Kuyruk başka odaların taleplerini sızdırmamalı |
| `shareTargetState` (BR-CAL-25/35/36) | Organizasyon dışı hedef engellenmeli |
| Boş erişim kuralı (BR-PRM-14) ve onaylayıcı zorunluluğu (BR-APR-02) | Invariant; API üzerinden bozulabilir |

İstemcideki kontroller **kaldırılmamalıdır** — anında geri bildirim için gereklidir.
Doğru model: *istemci tahmin eder, sunucu karar verir.*

---

## 5. Eşzamanlılık

Prototipte yoktur. Gerçekte en az şunlar gerekir:

- **Oda rezervasyonu:** `(roomId, date, aralık)` üzerinde çakışma kontrolü, tercihen
  veritabanı düzeyinde exclusion constraint. İki kullanıcı aynı slotu aynı anda isteyebilir.
- **Talep kararı:** `ApprovalRequest` üzerinde sürüm/durum kontrolü — iki onaylayıcı aynı anda
  karar verirse ikincisi `REQUEST_ALREADY_DECIDED` almalı (`BR-APR-22` karar geri alınamaz).
- **Etkinlik düzenleme:** `updatedAt` / `version` ile optimistic locking.
- **Paylaşım:** `(calendarId, granteeId)` üzerinde tekil kısıt.

---

## 6. Gerçek backend'e geçişte ilk 5 iş

1. **Kimlik ve organizasyon bağlamı.** `/me` + gruplar. `demoData.CURRENT_USER_ID` ve
   `ORG_ID` sabitlerini bu yanıtla değiştirin; `orgId` tüm yetki sorgularına girsin.
2. **Okuma uçlarını bağlayın.** `/calendars`, `/events?from&to`, `/rooms`,
   `/rooms/{id}/availability`. `StoreProvider`'a yükleme durumu ekleyin; `reducer` ve
   `selectors` **değişmeden** çalışır.
3. **`POST /events` atomik işlemini kurun.** Etkinlik + rezervasyon + onay talebi tek
   transaction. Sunucu tarafında oda çakışması ve eligible approver invariant'ını uygulayın;
   hata sözleşmesini (§3) döndürün.
4. **Onay uçlarını ve self-approval yasağını sunucuya taşıyın.** `approve` / `reject` /
   `withdraw` + karar sonrası bildirim üretimi (`N-RES-02/03/04`).
5. **Bildirim ve e-posta boru hattını bağlayın.** `emails/templates.mjs` içindeki 16 şablonu
   sunucu şablon motoruna taşıyın; `19-notifications-spec.md`'deki alıcı ve
   "e-posta zorunlu" kolonlarını kanal seçiminde uygulayın (harici misafir → e-posta tek kanal).

Sonraki dalga: tekrarlayan seri açma (M-12), zamanlanmış `BR-APR-42` görevi,
sunucu tarafı arama (M-09), saat dilimi desteği (M-03).
