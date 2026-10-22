import { CATEGORIES, type CategoryId } from './categories';
import { addDays, toDateKey } from './dates';

/** Best guess of the use-by date for something bought on `purchasedAt`. */
export function estimateExpiry(category: CategoryId, purchasedAt: Date = new Date()): string {
  return toDateKey(addDays(purchasedAt, CATEGORIES[category].shelfLifeDays));
}

/** Quick picks shown on the add screen so nobody has to open a date picker. */
export const EXPIRY_PRESETS: { label: string; days: number }[] = [
  { label: 'היום', days: 0 },
  { label: 'מחר', days: 1 },
  { label: '3 ימים', days: 3 },
  { label: 'שבוע', days: 7 },
  { label: 'שבועיים', days: 14 },
  { label: 'חודש', days: 30 },
];
