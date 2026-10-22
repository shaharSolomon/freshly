const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar date as yyyy-mm-dd. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole calendar days from `today` until `dateKey`. 0 = today, 1 = tomorrow, -1 = yesterday. */
export function daysUntil(dateKey: string, today: Date = new Date()): number {
  const start = fromDateKey(toDateKey(today)).getTime();
  return Math.round((fromDateKey(dateKey).getTime() - start) / DAY_MS);
}

export function describeDaysLeft(days: number): string {
  if (days < -1) return `פג לפני ${-days} ימים`;
  if (days === -1) return 'פג אתמול';
  if (days === 0) return 'פג היום';
  if (days === 1) return 'פג מחר';
  if (days < 7) return `עוד ${days} ימים`;
  if (days < 14) return 'עוד שבוע';
  if (days < 60) return `עוד ${Math.round(days / 7)} שבועות`;
  return `עוד ${Math.round(days / 30)} חודשים`;
}

export type Urgency = 'expired' | 'urgent' | 'soon' | 'fine';

export function urgencyOf(days: number): Urgency {
  if (days < 0) return 'expired';
  if (days <= 1) return 'urgent';
  if (days <= 4) return 'soon';
  return 'fine';
}

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/** "יום ה׳ 24.10": short enough for a list row, clear enough to match the package. */
export function formatDate(dateKey: string): string {
  const d = fromDateKey(dateKey);
  return `יום ${WEEKDAYS[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}`;
}
