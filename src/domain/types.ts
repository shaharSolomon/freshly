import type { CategoryId } from './categories';

export type ItemStatus = 'active' | 'eaten' | 'thrown';

/** Where the expiry date came from, so the UI can say "estimated" when it is a guess. */
export type ExpirySource = 'estimated' | 'manual';

export interface PantryItem {
  id: string;
  name: string;
  category: CategoryId;
  quantity: number;
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
  price?: number;
  expiresOn: string;
  expirySource: ExpirySource;
}
