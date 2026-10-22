import { guessCategory } from './categories';
import { addDays, daysUntil, describeDaysLeft, toDateKey } from './dates';
import { estimateExpiry, explainExpiry, formatQuantity } from './expiry';
import { findMissing, normalizeName, type Purchase } from './habits';
import { formatLocal, toE164 } from './phone';
import { suggestRecipes } from './recipes';
import { summarize } from './savings';
import type { PantryItem } from './types';

const today = new Date(2026, 9, 22, 10);

function item(overrides: Partial<PantryItem>): PantryItem {
  return {
    id: Math.random().toString(),
    name: 'קוטג׳',
    category: 'dairy',
    quantity: 1,
    addedAt: today.toISOString(),
    expiresOn: toDateKey(today),
    expirySource: 'estimated',
    status: 'active',
    ...overrides,
  };
}

describe('guessCategory', () => {
  it.each([
    ['קוטג׳ 5% תנובה', 'dairy'],
    ['חזה עוף טרי', 'meat'],
    ['עגבניות שרי', 'vegetables'],
    ['לחם אחיד פרוס', 'bread'],
    ['שוקו בשקית', 'drinks'],
    ['טונה בשמן', 'dry'],
    ['פיצה קפואה', 'frozen'],
    ['סבון כלים', 'other'],
  ])('%s -> %s', (name, expected) => {
    expect(guessCategory(name)).toBe(expected);
  });
});

describe('dates', () => {
  it('counts calendar days, ignoring the hour', () => {
    expect(daysUntil(toDateKey(today), today)).toBe(0);
    expect(daysUntil(toDateKey(addDays(today, 1)), new Date(2026, 9, 22, 23, 59))).toBe(1);
    expect(daysUntil(toDateKey(addDays(today, -2)), today)).toBe(-2);
  });

  it('describes days left in Hebrew', () => {
    expect(describeDaysLeft(0)).toBe('פג היום');
    expect(describeDaysLeft(1)).toBe('פג מחר');
    expect(describeDaysLeft(3)).toBe('עוד 3 ימים');
    expect(describeDaysLeft(-3)).toBe('פג לפני 3 ימים');
  });

  it('estimates expiry from the category shelf life', () => {
    expect(estimateExpiry('meat', today)).toBe(toDateKey(addDays(today, 3)));
  });
});

describe('summarize', () => {
  it('counts items eaten close to expiry as rescued and thrown items as waste', () => {
    const resolvedAt = today.toISOString();
    const items = [
      item({ status: 'eaten', price: 10, resolvedAt, daysLeftAtResolve: 1 }),
      item({ status: 'eaten', price: 20, resolvedAt, daysLeftAtResolve: 6 }),
      item({ status: 'thrown', price: 7, resolvedAt, daysLeftAtResolve: -1 }),
      item({ status: 'thrown', price: 99, resolvedAt: new Date(2026, 8, 1).toISOString() }),
      item({}),
    ];
    expect(summarize(items, new Date(2026, 9, 1))).toEqual({
      rescuedValue: 10,
      rescuedCount: 1,
      wastedValue: 7,
      wastedCount: 1,
      eatenCount: 2,
    });
  });
});

describe('habits', () => {
  it('normalizes sizes and punctuation', () => {
    expect(normalizeName("קוטג' 5% 250 גרם")).toBe(normalizeName('קוטג׳ 5%'));
  });

  const weekly = (name: string, weeksAgo: number[]): Purchase[] =>
    weeksAgo.map((w) => ({ key: normalizeName(name), name, at: addDays(today, -7 * w).toISOString() }));

  it('asks about a weekly product that was not bought for two weeks', () => {
    const purchases = weekly('קוטג׳', [2, 3, 4, 5]);
    const missing = findMissing(purchases, [], today);
    expect(missing).toHaveLength(1);
    expect(missing[0]).toMatchObject({ name: 'קוטג׳', usualEveryDays: 7, daysSinceLast: 14 });
  });

  it('stays quiet when the product is in stock or was bought recently', () => {
    expect(findMissing(weekly('קוטג׳', [2, 3, 4]), [item({ name: 'קוטג׳' })], today)).toEqual([]);
    expect(findMissing(weekly('קוטג׳', [0, 1, 2]), [], today)).toEqual([]);
    expect(findMissing(weekly('חומוס', [2, 3, 4]), [item({ name: 'חומוס אחלה' })], today)).toEqual([]);
  });

  it('needs a few purchases before it calls something a habit', () => {
    expect(findMissing(weekly('קוטג׳', [3, 4]), [], today)).toEqual([]);
  });
});

describe('phone numbers', () => {
  it.each([
    ['050-123-4567', '+972501234567'],
    ['0501234567', '+972501234567'],
    ['+972 50 123 4567', '+972501234567'],
    ['972541112222', '+972541112222'],
  ])('%s -> %s', (input, expected) => {
    expect(toE164(input)).toBe(expected);
  });

  it('rejects landlines and short numbers', () => {
    expect(toE164('03-1234567')).toBeNull();
    expect(toE164('050123')).toBeNull();
  });

  it('formats back for display', () => {
    expect(formatLocal('+972501234567')).toBe('050-123-4567');
  });
});

describe('expiry by product', () => {
  const today = new Date(2026, 9, 22);
  it('refines the category default by name', () => {
    expect(estimateExpiry('meat', today, 'חזה עוף')).toBe(toDateKey(addDays(today, 2)));
    expect(estimateExpiry('meat', today, 'בשר טחון')).toBe(toDateKey(addDays(today, 1)));
    expect(estimateExpiry('vegetables', today, 'בצל')).toBe(toDateKey(addDays(today, 30)));
    expect(estimateExpiry('vegetables', today, 'חסה')).toBe(toDateKey(addDays(today, 4)));
  });
  it('keeps frozen food frozen', () => {
    expect(estimateExpiry('frozen', today, 'חזה עוף קפוא')).toBe(toDateKey(addDays(today, 90)));
  });
  it('explains where the estimate comes from', () => {
    expect(explainExpiry('meat', 'פרגיות')).toContain('עוף טרי');
  });
  it('formats units and kilograms', () => {
    expect(formatQuantity(1, 'unit')).toBe('');
    expect(formatQuantity(3, 'unit')).toBe('×3');
    expect(formatQuantity(1.5, 'kg')).toBe('1.5 ק״ג');
  });
});

describe('recipes', () => {
  const today = new Date(2026, 9, 22);
  const item = (name: string, days: number): PantryItem => ({
    id: name,
    name,
    category: guessCategory(name),
    quantity: 1,
    addedAt: today.toISOString(),
    expiresOn: toDateKey(addDays(today, days)),
    expirySource: 'estimated',
    status: 'active',
  });

  it('puts recipes that rescue expiring items first', () => {
    const matches = suggestRecipes([item('ביצים', 20), item('עגבניות', 1), item('פסטה', 200)], today);
    expect(matches[0].rescues.map((i) => i.name)).toEqual(['עגבניות']);
    expect(matches.find((m) => m.recipe.id === 'shakshuka')?.uses.map((i) => i.name).sort()).toEqual(['ביצים', 'עגבניות']);
  });
  it('never counts staples as missing and skips recipes with nothing at home', () => {
    const matches = suggestRecipes([item('בננות', 2)], today);
    const cake = matches.find((m) => m.recipe.id === 'banana-cake');
    expect(cake?.missing.map((i) => i.name)).toEqual(['ביצים']);
    expect(matches.some((m) => m.recipe.id === 'schnitzel')).toBe(false);
  });
});
