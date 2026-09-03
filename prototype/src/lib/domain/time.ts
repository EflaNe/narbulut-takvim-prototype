import type { IsoDate, Minutes } from './types';

/** Izgara sabitleri — canonical 01 ekranından ölçülmüştür. */
export const HOUR_H = 56;          // bir saatin piksel yüksekliği
export const GRID_START_H = 8;     // ilk saat etiketi 08:00
export const GRID_END_H = 20;      // ızgara 20:00'de biter (12 satır)
export const WORK_START_H = 9;     // çalışma saatleri başı
export const WORK_END_H = 18;      // çalışma saatleri sonu

export const DAY_NAMES_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const DAY_NAMES_MINI = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'];
export const DAY_NAMES_LONG = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar',
];
export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function toIso(d: Date): IsoDate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromIso(s: IsoDate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: IsoDate, n: number): IsoDate {
  const d = fromIso(s);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

export function addMonths(s: IsoDate, n: number): IsoDate {
  const d = fromIso(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  // Ayın son gününü aşan tarihler ay sonuna sabitlenir (31 Ocak → 28 Şubat).
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toIso(d);
}

/** 0 = Pazartesi … 6 = Pazar */
export function weekdayIndex(s: IsoDate): number {
  return (fromIso(s).getDay() + 6) % 7;
}

export function startOfWeek(s: IsoDate): IsoDate {
  return addDays(s, -weekdayIndex(s));
}

export function weekDates(anchor: IsoDate): IsoDate[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isWeekend(s: IsoDate): boolean {
  return weekdayIndex(s) >= 5;
}

export function dayOfMonth(s: IsoDate): number {
  return fromIso(s).getDate();
}

export function monthLabel(s: IsoDate): string {
  const d = fromIso(s);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "24 – 30 Ağustos 2026" / "29 Ağustos – 4 Eylül 2026" */
export function weekRangeLabel(anchor: IsoDate): string {
  const days = weekDates(anchor);
  const a = fromIso(days[0]);
  const b = fromIso(days[6]);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (sameMonth) {
    return `${a.getDate()} – ${b.getDate()} ${MONTH_NAMES[b.getMonth()]} ${b.getFullYear()}`;
  }
  const sameYear = a.getFullYear() === b.getFullYear();
  const left = sameYear
    ? `${a.getDate()} ${MONTH_NAMES[a.getMonth()]}`
    : `${a.getDate()} ${MONTH_NAMES[a.getMonth()]} ${a.getFullYear()}`;
  return `${left} – ${b.getDate()} ${MONTH_NAMES[b.getMonth()]} ${b.getFullYear()}`;
}

export function longDateLabel(s: IsoDate): string {
  const d = fromIso(s);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Dar rail satırları için: "27 Ağu" — ay adı üç harfe iner, yıl düşer. */
export function shortDateLabel(s: IsoDate): string {
  const d = fromIso(s);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

/** 570 → "09:30" */
export function hhmm(m: Minutes): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** "09:30" → 570 (geçersizse null) */
export function parseHhmm(s: string): Minutes | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

export function timeRangeLabel(start: Minutes, end: Minutes): string {
  return `${hhmm(start)} – ${hhmm(end)}`;
}

/** Dakikayı ızgara üstündeki piksel ofsetine çevirir. */
export function minutesToY(m: Minutes): number {
  return ((m - GRID_START_H * 60) / 60) * HOUR_H;
}

/** Izgara üstündeki piksel ofsetini en yakın 30 dakikaya yuvarlar. */
export function yToMinutes(y: number): Minutes {
  const raw = GRID_START_H * 60 + (y / HOUR_H) * 60;
  return Math.max(GRID_START_H * 60, Math.min(GRID_END_H * 60 - 30, Math.round(raw / 30) * 30));
}

export function overlaps(aStart: Minutes, aEnd: Minutes, bStart: Minutes, bEnd: Minutes): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function hourSlots(): number[] {
  return Array.from({ length: GRID_END_H - GRID_START_H }, (_, i) => GRID_START_H + i);
}

/** Mini ay ızgarası — 6 hafta × 7 gün, Pazartesi başlangıçlı. */
export function monthMatrix(anchor: IsoDate): IsoDate[][] {
  const d = fromIso(anchor);
  const first = toIso(new Date(d.getFullYear(), d.getMonth(), 1));
  const gridStart = startOfWeek(first);
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => addDays(gridStart, w * 7 + i)),
  );
}

export function sameMonth(a: IsoDate, b: IsoDate): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/**
 * BR-SHELL-04 — görünen aralık etiketi her zaman yılı içerir ve
 * aktif görünüm moduna göre değişir.
 */
export function viewRangeLabel(anchor: IsoDate, mode: string): string {
  if (mode === 'week') return weekRangeLabel(anchor);
  if (mode === 'month') return monthLabel(anchor);
  return `${DAY_NAMES_LONG[weekdayIndex(anchor)]}, ${longDateLabel(anchor)}`;
}

/**
 * BR-SHELL-03 — ileri/geri aktif görünüm moduna göre hareket eder.
 * ⚠️ Haftalık adımda **seçili günün hafta içindeki konumu korunur**: Cuma'dan ileri
 * gidince yine Cuma seçili kalır. Böylece tarih kartı ile mini takvim aynı günü gösterir.
 */
export function shiftByView(anchor: IsoDate, mode: string, delta: number): IsoDate {
  if (mode === 'week') return addDays(anchor, delta * 7);
  if (mode === 'month') return addMonths(anchor, delta);
  return addDays(anchor, delta); // Günlük ve Odalara Göre → 1 gün
}

/** Navigasyon kontrollerinin etiketi de moda göre değişir. */
export function stepLabel(mode: string): string {
  if (mode === 'week') return 'hafta';
  if (mode === 'month') return 'ay';
  return 'gün';
}
