/**
 * Canonical demo flow — otomatik yürütme + konsol hatası denetimi.
 * GATE C (uncaught error = 0) ve GATE D (akış baştan sona tamamlanabiliyor).
 *
 * Kullanım:  node scripts/demo-flow.mjs [http://localhost:5180]
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const RAW = process.argv[2] || 'http://localhost:5180';
const BASE = `${RAW}/?p=deniz&banner=off`;
const SHOTS = process.env.SHOT_DIR || '/private/tmp/claude-501/shots/flow';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(SHOTS, { recursive: true });

const errors = [];
const steps = [];
let stepNo = 0;

const ok = (msg) => { stepNo += 1; steps.push(`  ${String(stepNo).padStart(2, '0')}. ✓ ${msg}`); };
const fail = (msg) => { stepNo += 1; steps.push(`  ${String(stepNo).padStart(2, '0')}. ✗ ${msg}`); errors.push(`ADIM: ${msg}`); };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();

page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`);
  if (m.type() === 'warning' && /React|Warning/.test(m.text())) errors.push(`WARN: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('requestfailed', (r) => {
  if (!r.url().startsWith('data:')) errors.push(`REQFAIL: ${r.url()} — ${r.failure()?.errorText}`);
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => page.screenshot({ path: `${SHOTS}/${name}.png` });

/** Metnine göre tıklanabilir öğe bul. */
async function clickText(text, { selector = 'button,a,[role="button"]', exact = false, nth = 0 } = {}) {
  const handle = await page.evaluateHandle((sel, txt, ex, n) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => {
      const t = (e.textContent || '').replace(/\s+/g, ' ').trim();
      return ex ? t === txt : t.includes(txt);
    });
    return els[n] || null;
  }, selector, text, exact, nth);
  const el = handle.asElement();
  if (!el) throw new Error(`Tıklanabilir bulunamadı: "${text}"`);
  await el.click();
  await sleep(180);
}

async function clickAria(label, nth = 0) {
  const handle = await page.evaluateHandle((lab, n) => {
    const els = [...document.querySelectorAll('[aria-label]')]
      .filter((e) => e.getAttribute('aria-label') === lab);
    return els[n] || null;
  }, label, nth);
  const el = handle.asElement();
  if (!el) throw new Error(`aria-label bulunamadı: "${label}"`);
  await el.click();
  await sleep(180);
}

const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
/** text-transform:uppercase innerText'i etkilediği için karşılaştırma küçük harfe indirgenir. */
const norm = (t) => t.toLocaleLowerCase('tr-TR');
const has = async (t) => norm(await bodyText()).includes(norm(t));

try {
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await sleep(400);

  /* 1 — Takvim açılır */
  if (await has('24 – 30 Ağustos 2026')) ok('Takvim açıldı, hafta aralığı doğru');
  else fail('Hafta aralığı görünmüyor');
  await shot('01-acilis');

  /* 2–3 — Hafta değiştir, Bugün'e dön */
  await clickAria('Sonraki hafta');
  if (await has('31 Ağustos – 6 Eylül 2026')) ok('Sonraki haftaya geçildi');
  else fail('Sonraki hafta çalışmadı');
  await clickAria('Önceki hafta');
  await clickAria('Önceki hafta');
  await clickText('Bugün', { exact: true });
  if (await has('24 – 30 Ağustos 2026')) ok('Bugün’e dönüldü');
  else fail('Bugün çalışmadı');

  /* 3b — Oda ekseni (BR-SHELL-31c) */
  {
    const before = await page.evaluate(() => document.querySelectorAll('.event').length);
    await clickAria('Topkapı odası görünürlüğü');
    const after = await page.evaluate(() => document.querySelectorAll('.event').length);
    if (after < before) ok(`Oda ekseni ızgarayı daralttı (${before} → ${after})`);
    else fail('Oda ekseni ızgarayı etkilemedi');
    const roomless = await page.evaluate(() => [...document.querySelectorAll('.event')]
      .some((e) => (e.getAttribute('aria-label') || '').includes('oda yok')));
    if (roomless) ok('Odasız etkinlikler oda ekseninden etkilenmiyor');
    else fail('Odasız etkinlikler de düştü');
    await clickAria('Topkapı odası görünürlüğü');
  }

  /* 4 — Mevcut etkinliğe tıkla */
  await clickAria('Kick-off, 09:30 – 10:30, Boğaziçi, onay bekliyor');
  if (await has('Etkinliği düzenle') && await has('Onay bekliyor')) ok('Etkinlik detayı açıldı (düzenlenebilir)');
  else fail('Etkinlik drawer açılmadı');
  await shot('02-etkinlik-duzenle');
  await clickAria('Kapat');

  /* 5 — Paylaşılan etkinlik salt okunur */
  await clickAria('Ürün Demo, 11:00 – 12:00, Topkapı, Ürün · paylaşılan takvim, salt okunur');
  const roText = await bodyText();
  if (roText.includes('paylaştığı takvim') && !roText.includes('Etkinliği düzenle')) {
    ok('Paylaşılan etkinlik salt okunur açıldı (Düzenle/Sil yok)');
  } else fail('Salt okunur durum doğrulanamadı');
  await shot('03-paylasilan-salt-okunur');
  await clickAria('Kapat');

  /* 6–7 — Boş slot → Quick Create */
  await clickAria('2026-08-28 11:00 — yeni etkinlik');
  if (await has('varsayılan takvim')) ok('Quick Create açıldı');
  else fail('Quick Create açılmadı');
  await page.type('.qc__title', 'Sunum Provası');
  await shot('04-quick-create');

  /* 8 — Detaylı forma geç */
  await clickText('Daha fazla seçenek');
  if (await has('Yeni etkinlik') && await has('Ne zaman')) ok('Detaylı etkinlik formuna geçildi');
  else fail('Detaylı forma geçilemedi');

  /* 9–10 — Katılımcı ekle, meşgul durumunu gör */
  await page.type('input[aria-label="Katılımcı ara"]', 'Ayşe');
  await sleep(220);
  await clickText('Ayşe Demir', { selector: '.psearch__results button' });
  if (await has('Meşgul')) ok('Katılımcı eklendi, non-blocking “Meşgul” durumu göründü');
  else fail('Katılımcı meşgul durumu görünmedi');
  await shot('05-katilimci-mesgul');

  /* 11 — Oda seçici */
  await clickText('Oda seç', { selector: '.evd__link' });
  if (await has('Uygun başlangıç saatleri')) ok('Oda seçici açıldı');
  else fail('Oda seçici açılmadı');
  const rpText = await bodyText();
  if (rpText.includes('Talep edilen saat dolu') && rpText.includes('Seçilemez')) {
    ok('Dolu oda “Seçilemez” olarak gösterildi (blocking)');
  } else fail('Dolu oda durumu doğrulanamadı');
  if (rpText.includes('Rezervasyon yetkiniz yok') && rpText.includes('Yetki iste')) {
    ok('Yetkisiz oda görünür ama seçilemez');
  } else fail('Yetkisiz oda durumu doğrulanamadı');
  await shot('06-oda-secici');

  /* 12–13 — Onay gerektiren odayı seç */
  const bogaziciIdx = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.rcard')];
    return cards.findIndex((c) => c.textContent.includes('Boğaziçi'));
  });
  await page.evaluate((i) => {
    const card = [...document.querySelectorAll('.rcard')][i];
    const btn = [...card.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Seç');
    btn.click();
  }, bogaziciIdx);
  await sleep(220);
  if (await has('Onay gerekli') || await has('onaylayıcı')) ok('Onay gerektiren oda seçildi');
  else fail('Onay gerektiren oda seçilemedi');
  await shot('07-oda-secildi');

  /* 14 — Etkinliği oluştur */
  await clickText('Kaydet', { exact: true });
  await sleep(300);
  if (await has('Talebiniz gönderildi, onay bekliyor')) {
    ok('Etkinlik oluştu; rezervasyon “Onay bekliyor” dilinde bildirildi');
  } else fail('Kaydetme sonrası bekleyen talep dili görünmedi');

  /* 15 — Izgarada onay bekliyor */
  const gridPending = await page.evaluate(() => [...document.querySelectorAll('.event')]
    .some((e) => (e.getAttribute('aria-label') || '').includes('Sunum Provası')
      && (e.getAttribute('aria-label') || '').includes('onay bekliyor')));
  if (gridPending) ok('Yeni etkinlik ızgarada “onay bekliyor” olarak görünüyor');
  else fail('Yeni etkinlik ızgarada bekleyen olarak görünmedi');
  await shot('08-izgarada-bekleyen');

  /* 16–17 — Talepler ekranı */
  await clickText('Odalar', { exact: true });
  await sleep(200);
  await clickText('bekleyen talep');
  if (await has('Talepler')) ok('Talepler ekranına geçildi');
  else fail('Talepler ekranı açılmadı');
  await shot('09-talepler');

  /* Kendi talebinde onay/red aksiyonu yok */
  await clickText('Sunum Provası', { selector: '.reqitem' });
  const ownText = await bodyText();
  if (ownText.includes('Kendi rezervasyon talebinizi onaylayamazsınız')
      && ownText.includes('Talebi geri çek')) {
    ok('Self-approval durumu: aksiyon yok, bilgilendirme + geri çekme var');
  } else fail('Self-approval bilgilendirme durumu doğrulanamadı');
  await shot('10-self-approval');

  /* 18 — Onaylanabilir talebi onayla */
  await clickText('Ürün Roadmap', { selector: '.reqitem' });
  if (await has('Odanın o günkü durumu')) ok('Talep detayı ve oda zaman çizelgesi görünüyor');
  else fail('Talep detayı görünmedi');
  await shot('11-talep-detay');
  await clickText('Onayla', { exact: true });
  await sleep(260);
  if (await has('rezervasyonu onaylandı')) ok('Talep onaylandı');
  else fail('Onaylama çalışmadı');

  /* 19–20 — Takvime dön, rezerve durumunu gör */
  await clickAria('Takvime dön');
  await sleep(200);
  const reserved = await page.evaluate(() => [...document.querySelectorAll('.event')]
    .some((e) => {
      const l = e.getAttribute('aria-label') || '';
      return l.includes('Ürün Roadmap') && !l.includes('onay bekliyor');
    }));
  if (reserved) ok('Onaylanan rezervasyon takvimde artık bekleyen değil');
  else fail('Onay sonrası takvim durumu güncellenmedi');
  await shot('12-onay-sonrasi');

  /* 21–23 — Takvim paylaşımı */
  await clickAria('Kişisel seçenekleri');
  await clickText('Paylaş', { exact: true });
  if (await has('Takvimi paylaş') && await has('mevcut ve gelecekteki')) ok('Paylaşım drawer’ı açıldı');
  else fail('Paylaşım drawer’ı açılmadı');
  await page.type('input[aria-label="Kişi ara"]', 'Selin');
  await sleep(220);
  await clickText('Selin Arı', { selector: '.psearch__results button' });
  if (await has('Selin Arı')) ok('Yeni kişi paylaşım listesine eklendi');
  else fail('Paylaşım eklenemedi');
  await shot('13-paylasim');
  await clickText('Bitti', { exact: true });

  /* 24 — Paylaşılan takvim görünürlüğü */
  const beforeCount = await page.evaluate(() => document.querySelectorAll('.event').length);
  await clickAria('Ürün görünürlüğü');
  await sleep(200);
  const afterCount = await page.evaluate(() => document.querySelectorAll('.event').length);
  if (afterCount < beforeCount) ok('Paylaşılan takvim görünürlüğü kapatıldı, etkinlikleri düştü');
  else fail('Görünürlük anahtarı ızgarayı etkilemedi');
  await clickAria('Ürün görünürlüğü');
  await shot('14-gorunurluk');

  /* Hover önizleme kartı */
  {
    const h = await page.evaluateHandle(() => [...document.querySelectorAll('.event')]
      .find((e) => (e.getAttribute('aria-label') || '').includes('Ürün Demo, 10:00')) || null);
    const el = h.asElement();
    if (!el) throw new Error('hover için etkinlik bulunamadı');
    await el.hover();
    await sleep(700);
    const card = await page.evaluate(() => {
      const c = document.querySelector('.ehc');
      return c ? c.innerText.replace(/\s+/g, ' ') : null;
    });
    if (card && norm(card).includes('kimler var') && norm(card).includes('topkapı')) {
      ok('Hover önizleme kartı açıldı (kimler var · oda · durum)');
    } else fail('Hover önizleme kartı doğrulanamadı');
    if (card && card.includes('Sil')) ok('Kartta silme aksiyonu var');
    else fail('Kartta silme aksiyonu yok');
    await shot('15-hover-onizleme');
    await page.mouse.move(5, 5);
    await sleep(300);
  }

  /* Paylaşılan salt okunur etkinlikte silme gösterilmez (BR-SHELL-45a) */
  {
    const h = await page.evaluateHandle(() => [...document.querySelectorAll('.event')]
      .find((e) => (e.getAttribute('aria-label') || '').includes('salt okunur')) || null);
    const el = h.asElement();
    if (!el) throw new Error('paylaşılan etkinlik bulunamadı');
    await el.hover();
    await sleep(700);
    const card = await page.evaluate(() => {
      const c = document.querySelector('.ehc');
      return c ? c.innerText.replace(/\s+/g, ' ') : null;
    });
    if (card && !card.includes('Sil')) ok('Paylaşılan salt okunur etkinlikte silme gösterilmiyor');
    else fail('Paylaşılan etkinlikte silme aksiyonu göründü');
    await page.mouse.move(5, 5);
    await sleep(250);
  }

} catch (e) {
  fail(`Akış hata ile durdu: ${e.message}`);
}

try {
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);
  const noCard = await page.evaluate(() => !document.querySelector('.ehc'));
  if (!noCard) fail('Mobilde hover kartı render edildi');
  if (await has('Takvimler')) ok('Mobil agenda görünümü açıldı (390px)');
  else fail('Mobil görünüm açılmadı');
  await shot('16-mobil');
  await clickText('Takvimler', { exact: true });
  if (await has('BENİMLE PAYLAŞILANLAR') || await has('Benimle paylaşılanlar')) {
    ok('Mobil Takvimler sheet’i açıldı');
  } else fail('Mobil sheet açılmadı');
  await shot('17-mobil-takvimler');
} catch (e) {
  fail(`Mobil kontrol hatası: ${e.message}`);
}

await browser.close();

console.log('\n=== CANONICAL DEMO FLOW ===');
console.log(steps.join('\n'));
console.log(`\nKonsol/sayfa hatası: ${errors.filter((e) => !e.startsWith('ADIM:')).length}`);
if (errors.length) {
  console.log('\n--- SORUNLAR ---');
  console.log(errors.join('\n'));
  process.exit(1);
}
console.log('\nTÜM ADIMLAR GEÇTİ · konsol hatası yok');
