import { T } from './tokens.mjs';

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

/** Etiket/değer satırlarından oluşan bilgi tablosu. */
export const factTable = (rows) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="border-collapse:collapse;margin-top:18px">
  ${rows.map(([label, value], i) => `
  <tr>
    <td style="padding:${i === 0 ? '0' : '11px'} 12px 11px 0;vertical-align:top;width:132px;
      font:400 13px/1.5 ${T.font};color:${T.textTertiary};
      border-top:${i === 0 ? 'none' : `1px solid ${T.lineDivider}`}">${esc(label)}</td>
    <td style="padding:${i === 0 ? '0' : '11px'} 0 11px 0;vertical-align:top;
      font:400 13px/1.5 ${T.font};color:${T.textPrimary};
      border-top:${i === 0 ? 'none' : `1px solid ${T.lineDivider}`}">${value}</td>
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
  subject, preview, stripColor, eyebrow, heading, lead, body = '', actions = '', footNote = '',
}) {
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
    .pad{padding-left:20px !important;padding-right:20px !important}
    .h1{font-size:21px !important}
    .stack{display:block !important;width:100% !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${T.page};-webkit-font-smoothing:antialiased">
${preheader(preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:${T.page}">
  <tr><td align="center" style="padding:28px 12px 40px">

    <table role="presentation" class="wrap" width="${T.width}" cellpadding="0" cellspacing="0" border="0"
      style="width:${T.width}px;max-width:${T.width}px;background:${T.surface};
      border:1px solid ${T.linePanel};border-radius:${T.radiusCard};overflow:hidden">

      <!-- marka şeridi -->
      <tr><td style="height:4px;background:${stripColor || T.brand};font-size:0;line-height:0">&nbsp;</td></tr>

      <!-- başlık -->
      <tr><td class="pad" style="padding:22px 32px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font:600 15px/1 ${T.font};color:${T.brand};letter-spacing:-.01em">Narbulut</td>
            <td align="right" style="font:400 12px/1 ${T.font};color:${T.textMuted}">Takvim</td>
          </tr>
        </table>
      </td></tr>

      <!-- içerik -->
      <tr><td class="pad" style="padding:24px 32px 8px">
        <div style="font:500 11px/1 ${T.font};letter-spacing:.08em;text-transform:uppercase;
          color:${T.textMuted}">${esc(eyebrow)}</div>
        <h1 class="h1" style="margin:11px 0 0;font:600 23px/1.3 ${T.font};color:${T.textPrimary};
          letter-spacing:-.015em">${esc(heading)}</h1>
        <p style="margin:12px 0 0;font:400 14px/1.65 ${T.font};color:${T.textSecondary}">${lead}</p>
        ${body}
        ${actions ? `<div style="margin-top:26px">${actions}</div>` : ''}
      </td></tr>

      <!-- alt not -->
      <tr><td class="pad" style="padding:26px 32px 26px">
        <div style="border-top:1px solid ${T.lineDivider};padding-top:16px;
          font:400 12px/1.6 ${T.font};color:${T.textMuted}">
          ${footNote ? `${footNote}<br /><br />` : ''}
          Bu e-posta Narbulut Takvim tarafından otomatik gönderildi.
          Bildirim tercihlerinizi hesap ayarlarından değiştirebilirsiniz.
        </div>
      </td></tr>
    </table>

    <div style="width:100%;max-width:${T.width}px;margin-top:14px;
      font:400 11.5px/1.6 ${T.font};color:${T.textMuted};text-align:center">
      Narbulut · Takvim ve Toplantı Odaları
    </div>
  </td></tr>
</table>
</body>
</html>`;
}

export { esc };
