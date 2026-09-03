/** Sunum paketi için ekran görüntüleri üretir. */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const RAW = process.argv[2] || 'http://localhost:5180';
// Ürün ekranlarını demo kabuğu olmadan yakala: doğrudan giriş + şerit kapalı.
const BASE = `${RAW}/?p=deniz&banner=off`;
const OUT = process.argv[3] || '/private/tmp/claude-501/shots/screens';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(text, { selector = 'button,a,[role="button"]', exact = false, nth = 0 } = {}) {
  const h = await page.evaluateHandle((sel, txt, ex, n) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => {
      const t = (e.textContent || '').replace(/\s+/g, ' ').trim();
      return ex ? t === txt : t.includes(txt);
    });
    return els[n] || null;
  }, selector, text, exact, nth);
  const el = h.asElement();
  if (!el) throw new Error(`bulunamadı: ${text}`);
  await el.click();
  await sleep(220);
}
async function clickAria(label, nth = 0) {
  const h = await page.evaluateHandle((lab, n) => {
    const els = [...document.querySelectorAll('[aria-label]')].filter((e) => e.getAttribute('aria-label') === lab);
    return els[n] || null;
  }, label, nth);
  const el = h.asElement();
  if (!el) throw new Error(`aria bulunamadı: ${label}`);
  await el.click();
  await sleep(220);
}
const shot = async (n) => { await sleep(200); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('  ✓', n); };
const fresh = async () => { await page.goto(BASE, { waitUntil: 'networkidle0' }); await sleep(500); };

console.log('Ekran görüntüleri:');

/* 01 Ana takvim */
await fresh();
await shot('01-ana-takvim');

/* 02 Etkinlik düzenle */
await clickAria('Ürün Demo, 10:00 – 11:30, Topkapı, onay bekliyor');
await shot('02-etkinlik');

/* 03 Oda seçici */
await clickText('Değiştir', { selector: '.evd__link' });
await shot('03-oda-secici');

/* 04 Odalar */
await fresh();
await clickText('Odalar', { exact: true });
await shot('04-odalar');

/* 05 İzinler */
await clickText('İzinler', { exact: true });
await shot('05-izinler');

/* 06 Talepler — D-074: dördüncü ana bölüm, liste rail'de */
await clickText('Talepler', { selector: '.navrail button' });
await shot('06-talepler');
await clickText('Ürün Demo', { selector: '.reqrow' });
await shot('06b-talepler-self-approval');

/* 08 Paylaşım */
await fresh();
await clickAria('Kişisel seçenekleri');
await clickText('Paylaş', { exact: true });
await shot('08-takvim-paylasimi');

/* Salt okunur paylaşılan etkinlik */
await fresh();
await clickAria('Ürün Demo, 11:00 – 12:00, Topkapı, Ürün · paylaşılan takvim, salt okunur');
await shot('09-paylasilan-etkinlik-salt-okunur');

/* Quick create */
await fresh();
await clickAria('2026-08-28 11:00 — yeni etkinlik');
await page.type('.qc__title', 'Sunum Provası');
await shot('10-hizli-olusturma');

/* Görünüm modları */
await fresh();
await clickText('Gün', { exact: true });
await shot('11-gun-gorunumu');
await clickText('Ay', { exact: true });
await shot('12-ay-gorunumu');
await clickText('Odalara göre', { exact: true });
await shot('13-odalara-gore');

/* Mobil */
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await fresh();
await shot('07-mobil');
await clickText('Takvimler', { exact: true });
await shot('07b-mobil-takvimler');

await browser.close();
console.log('Tamamlandı →', OUT);
