/**
 * E-posta şablonlarını statik HTML olarak üretir + bir önizleme dizini yazar.
 * Gerçek gönderim yoktur (SMTP/API yok) — çıktı sunum ve geliştirici referansıdır.
 *
 *   node emails/build.mjs [çıktı-dizini]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TEMPLATES } from './templates.mjs';
import { T } from './tokens.mjs';

const OUT = process.argv[2] || new URL('./dist/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const files = [];
for (const t of TEMPLATES) {
  const file = `${t.code}.html`;
  writeFileSync(join(OUT, file), t.render(), 'utf8');
  files.push({ ...t, file });
}

/* Önizleme dizini */
const groups = [...new Set(files.map((f) => f.group))];
const index = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Narbulut Takvim — E-posta Şablonları</title>
<style>
  :root{color-scheme:light}
  body{margin:0;background:${T.page};font:400 14px/1.6 ${T.font};color:${T.textPrimary}}
  .page{max-width:1180px;margin:0 auto;padding:36px 24px 64px}
  h1{margin:0;font:600 24px/1.25 ${T.font};letter-spacing:-.015em}
  .sub{margin-top:10px;color:${T.textSecondary};max-width:760px}
  .note{margin-top:18px;background:${T.warningSurface};border-left:3px solid ${T.warning};
    border-radius:6px;padding:12px 14px;color:${T.warning};font-size:13px}
  h2{margin:34px 0 12px;font:500 15px/1 ${T.font};letter-spacing:.02em}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
  .card{background:#fff;border:1px solid ${T.linePanel};border-radius:${T.radiusCard};overflow:hidden;
    display:flex;flex-direction:column}
  .card header{padding:14px 16px 12px;border-bottom:1px solid ${T.lineDivider}}
  .code{font:500 11px/1 ${T.fontMono};color:${T.brand};letter-spacing:.04em}
  .name{margin-top:7px;font:500 14px/1.3 ${T.font}}
  .meta{margin-top:8px;font-size:12px;line-height:1.6;color:${T.textTertiary}}
  .meta b{font-weight:500;color:${T.textSecondary}}
  .subject{padding:12px 16px;background:${T.subtle};font-size:12.5px;color:${T.textSecondary};
    border-bottom:1px solid ${T.lineDivider}}
  .subject span{display:block;font-size:11px;color:${T.textMuted};margin-bottom:4px}
  .frame{flex:1;min-height:360px;background:${T.page}}
  iframe{width:100%;height:420px;border:0;display:block}
  .card footer{padding:11px 16px;border-top:1px solid ${T.lineDivider}}
  a.open{font:500 12.5px/1 ${T.font};color:${T.brand};text-decoration:none}
  a.open:hover{text-decoration:underline}
</style></head>
<body><div class="page">
<h1>Narbulut Takvim — E-posta Şablonları</h1>
<p class="sub">
  Bu sayfa <code>19-notifications-spec.md</code> içinde <strong>tanımlı</strong> bildirim olaylarının
  e-posta karşılıklarını gösterir. Yeni bildirim olayı üretilmemiştir; ${files.length} şablonun her biri
  spec'teki bir domain event'e birebir karşılık gelir.
</p>
<div class="note">
  Gerçek gönderim yoktur. SMTP veya e-posta API'si kurulmamıştır; çıktılar statik HTML önizlemelerdir.
</div>
${groups.map((g) => `
<h2>${g}</h2>
<div class="grid">
${files.filter((f) => f.group === g).map((f) => `
  <article class="card">
    <header>
      <div class="code">${f.code}</div>
      <div class="name">${f.name}</div>
      <div class="meta">
        <b>Alıcı:</b> ${f.recipient}<br />
        <b>E-posta zorunlu:</b> ${f.emailRequired}
      </div>
    </header>
    <div class="subject"><span>Konu satırı</span>${f.subject}</div>
    <div class="frame"><iframe src="./${f.file}" title="${f.code} önizleme" loading="lazy"></iframe></div>
    <footer><a class="open" href="./${f.file}" target="_blank" rel="noopener">Tam boyutta aç →</a></footer>
  </article>`).join('')}
</div>`).join('')}
</div></body></html>`;

writeFileSync(join(OUT, 'index.html'), index, 'utf8');

console.log(`${files.length} e-posta şablonu üretildi → ${OUT}`);
for (const f of files) console.log(`  ${f.code}  ${f.name}`);
