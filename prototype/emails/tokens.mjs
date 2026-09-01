/**
 * E-posta token'ları — prototype/src/styles/tokens.css'in e-posta güvenli alt kümesi.
 * E-posta istemcileri CSS değişkeni desteklemediği için değerler inline yazılır.
 */
export const T = {
  font: "'Poppins','Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  fontMono: "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace",

  brand: '#0058B8',
  brandDark: '#00458F',
  brandGradTop: '#0F63C4',

  textPrimary: '#16191D',
  textSecondary: '#525C6B',
  textTertiary: '#7C8697',
  textMuted: '#9AA0A6',

  surface: '#FFFFFF',
  page: '#EFF2F5',
  subtle: '#F7F9FB',
  infoSurface: '#F5F9FE',

  linePanel: '#E6EAEE',
  lineDivider: '#EDEFF2',

  error: '#9C3227',
  errorSurface: '#FAEEEC',
  warning: '#7A5300',
  warningSurface: '#FBF6EA',
  success: '#2F6B4F',
  successSurface: '#E9F2ED',

  radiusCard: '12px',
  radiusControl: '9px',
  width: 600,
};

/** Bir rengi beyazla karıştırır — e-posta istemcileri color-mix desteklemez. */
export function tint(hex, ratio) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * ratio);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((c) => mix(c).toString(16).padStart(2, '0')).join('')}`;
}

/** Takvim renkleri — etkinlik e-postalarında renk şeridi için. */
export const CAL_COLORS = {
  kisisel: '#6259C9',
  proje: '#177066',
  ekip: '#A83E69',
  toplanti: '#E8A33D',
  urun: '#2F6B4F',
  pazarlama: '#B4531F',
};
