import { T, tint } from './tokens.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Ön izleme metni — gelen kutusu satırında konu satırının yanında görünür. */
const preheader = (text) => `
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(text)}</div>
<div style="display:none;max-height:0;overflow:hidden">${'&#847;&zwnj;&nbsp;'.repeat(60)}</div>`;

/** Bulletproof buton — Outlook dahil tüm istemcilerde tıklanabilir kutu. */
export const button = (label, href = '#', variant = 'primary') => {
  const bg = variant === 'primary' ? T.brand : T.surface;
  const fg = variant === 'primary' ? '#ffffff' : T.textPrimary;
  const border = variant === 'primary' ? T.brand : '#DADCE0';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate">
  <tr><td style="background:${bg};border:1px solid ${border};border-radius:${T.radiusControl}">
    <a href="${href}" style="display:inline-block;padding:11px 20px;font:500 14px/1 ${T.font};color:${fg};text-decoration:none">${esc(label)}</a>
  </td></tr></table>`;
};

/**
 * Tarih bloğu — takvim ürününün imza öğesi. Yırtma takvim yaprağı mantığı:
 * üstte gün adı, ortada büyük gün numarası, altta ay.
 */
export const dateBlock = ({ dow, day, month, accent }) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0"
  style="border-collapse:separate;width:76px">
  <tr><td style="background:${accent};border-radius:10px 10px 0 0;padding:7px 0;
    text-align:center;font:500 10.5px/1 ${T.font};letter-spacing:.1em;color:#ffffff">${esc(dow)}</td></tr>
  <tr><td style="background:${tint(accent, 0.92)};border-radius:0 0 10px 10px;padding:9px 0 11px;
    text-align:center">
    <div style="font:600 30px/1 ${T.font};letter-spacing:-.02em;color:${T.textPrimary}">${esc(day)}</div>
    <div style="margin-top:5px;font:400 11px/1 ${T.font};letter-spacing:.06em;
      color:${T.textTertiary}">${esc(month)}</div>
  </td></tr>
</table>`;

/**
 * Etkinlik kartı — uygulamadaki ızgara chip'inin e-posta karşılığı:
 * renkli üst şeritte saat ve oda, altta beyaz gövde.
 */
export const eventCard = ({ accent, time, right, title, lines = [] }) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="border-collapse:separate;margin-top:22px;border:1px solid ${T.linePanel};
  border-radius:10px;overflow:hidden">
  <tr><td style="background:${accent};padding:0 14px;height:30px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font:500 12px/30px ${T.font};color:#ffffff;white-space:nowrap">${esc(time)}</td>
      <td align="right" style="font:400 12px/30px ${T.font};color:rgba(255,255,255,.88);
        white-space:nowrap">${esc(right || '')}</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:14px 15px 15px;background:#ffffff">
    ${title ? `<div style="font:500 16px/1.35 ${T.font};color:${T.textPrimary}">${esc(title)}</div>` : ''}
    ${lines.map((l, i) => `<div style="margin-top:${i === 0 && title ? 7 : 5}px;
      font:400 13px/1.5 ${T.font};color:${T.textSecondary}">${l}</div>`).join('')}
  </td></tr>
</table>`;

/** Etiket/değer satırlarından oluşan bilgi tablosu. */
export const factTable = (rows) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="border-collapse:collapse;margin-top:20px">
  ${rows.map(([label, value]) => `
  <tr>
    <td style="padding:0 14px 12px 0;vertical-align:top;width:126px;
      font:500 10.5px/1.7 ${T.font};letter-spacing:.07em;text-transform:uppercase;
      color:${T.textMuted}">${esc(label)}</td>
    <td style="padding:0 0 12px;vertical-align:top;
      font:400 13.5px/1.5 ${T.font};color:${T.textPrimary}">${value}</td>
  </tr>`).join('')}
</table>`;

/** Durum şeridi — bilgilendirici / uyarı / hata / olumlu. */
export const notice = (text, tone = 'info') => {
  const map = {
    info: [T.infoSurface, T.textSecondary, T.brand],
    warning: [T.warningSurface, T.warning, T.warning],
    error: [T.errorSurface, T.error, T.error],
    success: [T.successSurface, T.success, T.success],
  };
  const [bg, fg, bar] = map[tone];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="border-collapse:separate;margin-top:20px">
  <tr><td style="background:${bg};border-left:3px solid ${bar};border-radius:6px;
    padding:12px 14px;font:400 13px/1.6 ${T.font};color:${fg}">${text}</td></tr>
</table>`;
};

/**
 * Tek e-posta gövdesi.
 * 600px sabit genişlik, tablo tabanlı, tüm stiller satır içi.
 */
export function renderEmail({
  subject, preview, accent = T.brand, eyebrow, heading, lead,
  date = null, body = '', actions = '', footNote = '',
}) {
  const hasDate = !!date;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="tr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(subject)}</title>
<!--[if mso]><style>body,table,td,a{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .wrap{width:100% !important;min-width:0 !important}
    .pad{padding-left:22px !important;padding-right:22px !important}
    .h1{font-size:22px !important}
    .stack{display:block !important;width:100% !important}
    .datecol{display:block !important;width:100% !important;padding:0 0 16px 0 !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${T.page};-webkit-font-smoothing:antialiased">
${preheader(preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:${T.page}">
  <tr><td align="center" style="padding:32px 12px 44px">

    <table role="presentation" class="wrap" width="${T.width}" cellpadding="0" cellspacing="0" border="0"
      style="width:${T.width}px;max-width:${T.width}px;background:${T.surface};
      border:1px solid ${T.linePanel};border-radius:14px;overflow:hidden">

      <!-- marka şeridi: türü bir bakışta veren aksan -->
      <tr><td style="height:3px;background:${accent};font-size:0;line-height:0">&nbsp;</td></tr>

      <!-- başlık şeridi -->
      <tr><td class="pad" style="padding:20px 34px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font:600 15px/1 ${T.font};color:${T.brand};letter-spacing:-.01em">Narbulut</td>
            <td align="right" style="font:400 11.5px/1 ${T.font};letter-spacing:.06em;
              text-transform:uppercase;color:${T.textMuted}">Takvim</td>
          </tr>
        </table>
        <div style="margin-top:18px;height:1px;background:${T.lineDivider};font-size:0">&nbsp;</div>
      </td></tr>

      <!-- hero: tarih bloğu + başlık -->
      <tr><td class="pad" style="padding:26px 34px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${hasDate ? `<td class="datecol stack" width="76" valign="top"
              style="width:76px;padding-right:20px">${dateBlock({ ...date, accent })}</td>` : ''}
            <td class="stack" valign="top">
              <div style="font:500 10.5px/1 ${T.font};letter-spacing:.09em;text-transform:uppercase;
                color:${T.textMuted}">${esc(eyebrow)}</div>
              <h1 class="h1" style="margin:10px 0 0;font:600 24px/1.28 ${T.font};
                color:${T.textPrimary};letter-spacing:-.018em">${esc(heading)}</h1>
              <p style="margin:11px 0 0;font:400 14px/1.65 ${T.font};color:${T.textSecondary}">${lead}</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- gövde -->
      <tr><td class="pad" style="padding:4px 34px 0">
        ${body}
        ${actions ? `<div style="margin-top:26px">${actions}</div>` : ''}
      </td></tr>

      <!-- alt not -->
      <tr><td class="pad" style="padding:28px 34px 28px">
        <div style="border-top:1px solid ${T.lineDivider};padding-top:16px;
          font:400 12px/1.65 ${T.font};color:${T.textMuted}">
          ${footNote ? `${footNote}<br /><br />` : ''}
          Bu e-posta Narbulut Takvim tarafından otomatik gönderildi.
          Bildirim tercihlerinizi hesap ayarlarından değiştirebilirsiniz.
        </div>
      </td></tr>
    </table>

    <div style="width:100%;max-width:${T.width}px;margin-top:16px;
      font:400 11.5px/1.6 ${T.font};color:${T.textMuted};text-align:center">
      Narbulut · Takvim ve Toplantı Odaları
    </div>
  </td></tr>
</table>
</body>
</html>`;
}

export { esc };
