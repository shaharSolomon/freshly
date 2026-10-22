import { CATEGORIES, guessCategory, type CategoryId } from '@/domain/categories';
import { addDays, toDateKey } from '@/domain/dates';
import { estimateExpiry } from '@/domain/expiry';
import type { DraftItem } from '@/domain/types';

const API_URL = process.env.EXPO_PUBLIC_RECEIPT_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Shape returned by supabase/functions/parse-receipt. Keep the two in sync. */
interface ParsedLine {
  name: string;
  quantity: number;
  /** Older deployments of the function do not send it. */
  unit?: 'unit' | 'kg';
  price: number | null;
  category: string;
  shelf_life_days: number | null;
  perishable: boolean;
}

export class ReceiptError extends Error {}

export function isReceiptScanConfigured(): boolean {
  return Boolean(API_URL);
}

export async function parseReceipt(imageBase64: string, mediaType = 'image/jpeg'): Promise<DraftItem[]> {
  if (!API_URL) throw new ReceiptError('סריקת קבלות עוד לא הוגדרה באפליקציה הזו');

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}`, apikey: API_KEY } : {}),
      },
      body: JSON.stringify({ image: imageBase64, mediaType }),
    });
  } catch {
    throw new ReceiptError('אין חיבור לאינטרנט. נסו שוב בעוד רגע');
  }
  if (!response.ok) throw new ReceiptError('לא הצלחנו לקרוא את הקבלה. נסו לצלם שוב באור טוב');

  const { items } = (await response.json()) as { items: ParsedLine[] };
  return linesToDrafts(items);
}

export function linesToDrafts(lines: ParsedLine[], purchasedAt: Date = new Date()): DraftItem[] {
  return lines
    .filter((l) => l.name.trim().length > 0)
    .map((l) => {
      const category: CategoryId = l.category in CATEGORIES ? (l.category as CategoryId) : guessCategory(l.name);
      const expiresOn = l.shelf_life_days
        ? toDateKey(addDays(purchasedAt, l.shelf_life_days))
        : estimateExpiry(category, purchasedAt, l.name);
      const byWeight = l.unit === 'kg';
      return {
        name: l.name.trim(),
        category,
        quantity: byWeight ? Math.max(0.1, Math.round((l.quantity || 1) * 10) / 10) : Math.max(1, Math.round(l.quantity || 1)),
        unit: byWeight ? ('kg' as const) : ('unit' as const),
        price: l.price ?? undefined,
        expiresOn,
        expirySource: 'estimated' as const,
      };
    });
}
