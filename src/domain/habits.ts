import type { PantryItem } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Minimum purchases before we trust that something is a habit. */
const MIN_PURCHASES = 3;
/** How late (relative to the usual gap) a purchase must be before we ask. */
const OVERDUE_FACTOR = 1.3;

export interface Purchase {
  /** Normalized product name, see normalizeName. */
  key: string;
  name: string;
  at: string;
}

export interface MissingSuggestion {
  key: string;
  name: string;
  usualEveryDays: number;
  daysSinceLast: number;
}

/** Folds brand noise and sizes so "קוטג' 5% 250 גרם" and "קוטג 5%" match. */
export function normalizeName(name: string): string {
  return name
    .replace(/[׳'"״]/g, '')
    .replace(/\d+(\.\d+)?\s*(גרם|גר|ג|קג|ק"ג|מל|ליטר|ל|יח)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .join(' ');
}

/**
 * Products the household buys regularly, are now overdue, and are not in the
 * pantry. These drive the "missing cottage? how many are left?" prompt.
 */
export function findMissing(purchases: Purchase[], activeItems: PantryItem[], now: Date = new Date()): MissingSuggestion[] {
  // "חומוס אחלה" in the fridge covers the "חומוס" habit, and the other way round.
  const stock = activeItems.map((i) => normalizeName(i.name));
  const inStock = (key: string) => stock.some((s) => s === key || s.startsWith(`${key} `) || key.startsWith(`${s} `));
  const byKey = new Map<string, Purchase[]>();
  for (const p of purchases) {
    const list = byKey.get(p.key) ?? [];
    list.push(p);
    byKey.set(p.key, list);
  }

  const suggestions: MissingSuggestion[] = [];
  for (const [key, list] of byKey) {
    if (inStock(key)) continue;
    // One receipt can hold the same product twice; count distinct days.
    const days = [...new Set(list.map((p) => Math.floor(new Date(p.at).getTime() / DAY_MS)))].sort((a, b) => a - b);
    if (days.length < MIN_PURCHASES) continue;
    const gaps = days.slice(1).map((d, i) => d - days[i]);
    const usual = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const since = Math.floor(now.getTime() / DAY_MS) - days[days.length - 1];
    if (since > usual * OVERDUE_FACTOR) {
      suggestions.push({ key, name: list[list.length - 1].name, usualEveryDays: Math.round(usual), daysSinceLast: since });
    }
  }
  return suggestions.sort((a, b) => b.daysSinceLast / b.usualEveryDays - a.daysSinceLast / a.usualEveryDays);
}
