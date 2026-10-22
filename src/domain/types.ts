import type { CategoryId } from './categories';

export type ItemStatus = 'active' | 'eaten' | 'thrown';

/** Where the expiry date came from, so the UI can say "estimated" when it is a guess. */
export type ExpirySource = 'estimated' | 'manual';

/** Countable things ("3 yogurts") or weighed produce and meat ("1.5 kg tomatoes"). */
export type Unit = 'unit' | 'kg';

export interface PantryItem {
  id: string;
  name: string;
  category: CategoryId;
  quantity: number;
  /** Missing on items saved before units existed; those are counted in units. */
  unit?: Unit;
  /** Price in NIS for the whole quantity, if known. */
  price?: number;
  /** ISO date-time the item entered the house. */
  addedAt: string;
  /** ISO date (yyyy-mm-dd) the item should be used by. */
  expiresOn: string;
  expirySource: ExpirySource;
  status: ItemStatus;
  /** ISO date-time the item was eaten or thrown. */
  resolvedAt?: string;
  /** Days left until expiry when it was resolved. Negative means after expiry. */
  daysLeftAtResolve?: number;
}

/** An item as it comes from a receipt or the add form, before it is saved. */
export interface DraftItem {
  name: string;
  category: CategoryId;
  quantity: number;
  unit?: Unit;
  price?: number;
  expiresOn: string;
  expirySource: ExpirySource;
}
