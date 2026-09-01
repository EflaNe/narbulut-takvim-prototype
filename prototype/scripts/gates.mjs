/**
 * Kalite kapıları: harici ağ isteği (GATE G) ve responsive taşma (GATE F) denetimi.
 *   node scripts/gates.mjs [url]
 */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:5180';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
const external = [];
const errors = [];
page.on('request', (r) => {
  const u = r.url();
  if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
});
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

/* GATE G — harici ağ bağımlılığı */
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle0' });
await sleep(600);
results.push(['G · Offline', external.length === 0,
  external.length ? `harici istek: ${[...new Set(external)].join(', ')}` : 'harici istek yok']);

/* Font gerçekten yüklendi mi */
const fontsOk = await page.evaluate(async () => {
  await document.fonts.ready;
  return document.fonts.check('500 13px Poppins');
});
results.push(['G · Font', fontsOk, fontsOk ? 'Poppins yerelden yüklendi' : 'Poppins yüklenemedi']);

/* GATE F — responsive: yatay taşma olmamalı */
for (const [w, h, label] of [[1440, 900, 'masaüstü 1440'], [1280, 800, 'masaüstü 1280'],
  [430, 932, 'mobil 430'], [390, 844, 'mobil 390'], [375, 812, 'mobil 375']]) {
  await page.setViewport({ width: w, height: h });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(350);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  results.push([`F · ${label}`, overflow <= 1, overflow <= 1 ? 'yatay taşma yok' : `${overflow}px taşma`]);
}

/* GATE C — konsol */
results.push(['C · Konsol', errors.length === 0,
  errors.length ? errors.slice(0, 3).join(' | ') : 'hata yok']);

await browser.close();

console.log('\n=== KALİTE KAPILARI ===');
let failed = 0;
for (const [name, ok, detail] of results) {
  if (!ok) failed += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(22)} ${detail}`);
}
console.log(failed ? `\n${failed} kapı geçilemedi` : '\nTÜM KAPILAR GEÇTİ');
process.exit(failed ? 1 : 0);
