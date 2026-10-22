import { CATEGORIES, type CategoryId } from './categories';
import { addDays, toDateKey } from './dates';
import type { Unit } from './types';

/**
 * Fresh food varies a lot inside one category: lettuce wilts in days, onions
 * keep for a month. These refine the category default by name, most specific first.
 * Days are for the fridge (or the counter, for things that live there).
 */
const PRODUCT_SHELF_LIFE: { keys: string[]; days: number; note: string }[] = [
  { keys: ['טחון', 'כבד'], days: 1, note: 'בשר טחון ופנימיות מתקלקלים הכי מהר: יום-יומיים במקרר' },
  { keys: ['עוף', 'חזה', 'פרגי', 'כרעיים', 'שוקיים', 'שניצל', 'הודו'], days: 2, note: 'עוף טרי מחזיק כ-2 ימים במקרר, או כ-3 חודשים במקפיא' },
  { keys: ['סטייק', 'אנטריקוט', 'בשר', 'קבב', 'המבורגר'], days: 3, note: 'בשר בקר טרי מחזיק כ-3 ימים במקרר, או כ-4 חודשים במקפיא' },
  { keys: ['נקניק', 'פסטרמה', 'סלמי'], days: 7, note: 'נקניקים: כשבוע מרגע הפתיחה' },
  { keys: ['חסה', 'פטרוזיליה', 'כוסברה', 'שמיר', 'נענע', 'תרד', 'פטריות'], days: 4, note: 'עלים ועשבי תיבול נובלים מהר: 3-5 ימים במקרר' },
  { keys: ['עגבני', 'מלפפון', 'קישוא', 'חציל', 'פלפל'], days: 6, note: 'ירקות סלט: כשבוע במקרר' },
  { keys: ['ברוקולי', 'כרובית', 'כרוב', 'סלרי', 'צנון'], days: 7, note: 'ירקות מצליבים: כשבוע במקרר' },
  { keys: ['גזר', 'סלק'], days: 21, note: 'ירקות שורש: כ-3 שבועות במקרר' },
  { keys: ['תפוח אדמה', 'תפו"א', 'בטטה', 'בצל', 'שום'], days: 30, note: 'בצל, שום ותפוחי אדמה: כחודש במקום יבש וחשוך' },
  { keys: ['בננ', 'תות', 'אבוקדו', 'אפרסק', 'נקטרינ', 'שזיף', 'ענב'], days: 4, note: 'פירות רכים מבשילים מהר: 3-5 ימים' },
  { keys: ['תפוח', 'תפוז', 'קלמנטינ', 'לימון', 'אשכולית', 'אגס', 'רימון'], days: 14, note: 'פירות קשים והדרים: כשבועיים' },
  { keys: ['קוטג', 'יוגורט', 'שמנת', 'לבן', 'מעדן'], days: 7, note: 'מוצרי חלב: לפי התאריך על האריזה, בדרך כלל כשבוע' },
  { keys: ['גבינה צהובה', 'בולגרית', 'צפתית', 'חמאה'], days: 14, note: 'גבינות קשות וחמאה: כשבועיים' },
];

function productRule(name: string) {
  const normalized = name.replace(/[׳']/g, "'");
  return PRODUCT_SHELF_LIFE.find((r) => r.keys.some((k) => normalized.includes(k)));
}

/** Best guess of the use-by date for something bought on `purchasedAt`. */
export function estimateExpiry(category: CategoryId, purchasedAt: Date = new Date(), name = ''): string {
  // A name rule only applies when it agrees with the category, so frozen chicken stays frozen.
  const rule = category === 'frozen' || category === 'dry' ? undefined : productRule(name);
  return toDateKey(addDays(purchasedAt, rule?.days ?? CATEGORIES[category].shelfLifeDays));
}

/** One line telling the user where the estimate comes from. */
export function explainExpiry(category: CategoryId, name = ''): string {
  const rule = category === 'frozen' || category === 'dry' ? undefined : productRule(name);
  if (rule) return rule.note;
  const c = CATEGORIES[category];
  return `${c.label}: בדרך כלל כ-${c.shelfLifeDays} ימים. אם יש תאריך על האריזה, עדיף להזין אותו`;
}

/** Produce, meat and fish are usually bought by weight. */
export function defaultUnit(category: CategoryId): Unit {
  return category === 'vegetables' || category === 'fruit' || category === 'meat' || category === 'fish' ? 'kg' : 'unit';
}

export function formatQuantity(quantity: number, unit: Unit = 'unit'): string {
  if (unit === 'kg') return `${quantity.toLocaleString('he-IL', { maximumFractionDigits: 2 })} ק״ג`;
  return quantity > 1 ? `×${quantity}` : '';
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
