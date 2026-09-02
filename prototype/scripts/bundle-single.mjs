/**
 * Prototipi **tek dosyalık, kendi kendine yeten** bir HTML'e paketler.
 * Kurulum, sunucu ve internet gerektirmez: JS, CSS ve fontlar dosyanın içine gömülür.
 *
 *   npm run build && node scripts/bundle-single.mjs
 *   → dist/narbulut-takvim-demo.html
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const ASSETS = join(DIST, 'assets');
const OUT = join(DIST, 'narbulut-takvim-demo.html');

const files = readdirSync(ASSETS);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('dist/assets içinde js/css bulunamadı — önce npm run build');

/* Fontlar CSS içine data: URI olarak gömülür. */
let css = readFileSync(join(ASSETS, cssFile), 'utf8');
let embedded = 0;
css = css.replace(/url\(([^)]+\.woff2)\)/g, (_m, raw) => {
  const name = raw.replace(/^["']|["']$/g, '').replace(/^\.?\//, '').replace(/^assets\//, '');
  const b64 = readFileSync(join(ASSETS, name)).toString('base64');
  embedded += 1;
  return `url(data:font/woff2;base64,${b64})`;
});

/* Modül script'i satır içine alınır; </script> dizisi kaçırılır. */
const js = readFileSync(join(ASSETS, jsFile), 'utf8').replace(/<\/script/gi, '<\\/script');

const favicon = readFileSync(join(DIST, 'favicon.svg'), 'utf8');
const faviconUri = `data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}`;

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<link rel="icon" type="image/svg+xml" href="${faviconUri}" />
<title>Narbulut Takvim — Tasarım Prototipi</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${js}</script>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
const kb = (n) => `${Math.round(n / 1024)} kB`;
console.log(`tek dosya üretildi → ${OUT}`);
console.log(`  toplam ${kb(statSync(OUT).size)} · ${embedded} font gömüldü · harici istek yok`);
