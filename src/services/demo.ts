import { addDays, toDateKey } from '@/domain/dates';
import type { Purchase } from '@/domain/habits';
import type { DraftItem, PantryItem } from '@/domain/types';

/**
 * Demo builds start with a lived-in pantry, accept a fixed SMS code and fake
 * the receipt scan. Without a Supabase project configured there is no way to
 * sign in, so a fresh clone runs in demo mode too.
 */
/**
 * Local builds (EXPO_PUBLIC_MODE=local) are for real day-to-day use with no
 * backend at all: sign-up is just a name, the pantry lives on the device and
 * starts empty, and receipt scanning is off.
 */
export const IS_LOCAL = process.env.EXPO_PUBLIC_MODE === 'local';

export const IS_DEMO = !IS_LOCAL && (process.env.EXPO_PUBLIC_DEMO === '1' || !process.env.EXPO_PUBLIC_SUPABASE_URL);

const day = (n: number) => toDateKey(addDays(new Date(), n));
const ago = (n: number) => addDays(new Date(), -n).toISOString();

export function demoPantry(): { items: PantryItem[]; purchases: Purchase[] } {
  const active: [string, PantryItem['category'], number, number, number][] = [
    ['חזה עוף', 'meat', 0, 1, 32],
    ['קוטג׳ 5%', 'dairy', 1, 2, 11],
    ['לחם מחמצת', 'bread', 2, 1, 18],
    ['עגבניות שרי', 'vegetables', 3, 1, 9],
    ['יוגורט יווני', 'dairy', 6, 3, 15],
    ['ביצים L', 'eggs', 18, 1, 14],
    ['פסטה', 'dry', 120, 2, 12],
  ];
  const items: PantryItem[] = active.map(([name, category, d, quantity, price], i) => ({
    id: `demo-${i}`,
    name,
    category,
    quantity,
    price,
    addedAt: ago(4),
    expiresOn: day(d),
    expirySource: i % 2 ? 'manual' : 'estimated',
    status: 'active',
  }));
  const resolved: [string, PantryItem['category'], number, PantryItem['status'], number][] = [
    ['חלב 3%', 'dairy', 7, 'eaten', 1],
    ['שניצל', 'meat', 38, 'eaten', 0],
    ['גבינה צהובה', 'dairy', 22, 'eaten', 2],
    ['חסה', 'vegetables', 6, 'thrown', -1],
  ];
  resolved.forEach(([name, category, price, status, left], i) =>
    items.push({
      id: `demo-r${i}`,
      name,
      category,
      quantity: 1,
      price,
      addedAt: ago(9),
      expiresOn: day(-1),
      expirySource: 'estimated',
      status,
      resolvedAt: ago(i),
      daysLeftAtResolve: left,
    }),
  );
  // Hummus bought every week for a month, then not for two weeks: triggers "missing hummus?".
  const purchases: Purchase[] = [14, 21, 28, 35].map((n) => ({ key: 'חומוס', name: 'חומוס', at: ago(n) }));
  return { items, purchases };
}

/** What the scanner "reads" from a typical Shufersal receipt in the demo. */
export function demoReceipt(): Promise<DraftItem[]> {
  const lines: DraftItem[] = [
    { name: 'חלב 3% תנובה', category: 'dairy', quantity: 2, price: 13.8, expiresOn: day(7), expirySource: 'estimated' },
    { name: 'פרגיות', category: 'meat', quantity: 0.8, unit: 'kg', price: 42.9, expiresOn: day(2), expirySource: 'estimated' },
    { name: 'מלפפונים', category: 'vegetables', quantity: 1.2, unit: 'kg', price: 6.5, expiresOn: day(6), expirySource: 'estimated' },
    { name: 'בננות', category: 'fruit', quantity: 1, price: 8.9, expiresOn: day(5), expirySource: 'estimated' },
    { name: 'חומוס אחלה', category: 'ready', quantity: 1, price: 9.9, expiresOn: day(5), expirySource: 'estimated' },
    { name: 'פיתות', category: 'bread', quantity: 1, price: 7.9, expiresOn: day(3), expirySource: 'estimated' },
    { name: 'שמנת מתוקה', category: 'dairy', quantity: 1, price: 6.2, expiresOn: day(10), expirySource: 'estimated' },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(lines), 1400));
}
