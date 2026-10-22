import { CATEGORIES } from './categories';
import type { PantryItem } from './types';

/**
 * An item counts as "rescued" when it was eaten with this many days or fewer
 * left. Those are the items that would most likely have been thrown away
 * without a reminder.
 */
export const RESCUE_WINDOW_DAYS = 2;

export function itemValue(item: PantryItem): number {
  return item.price ?? CATEGORIES[item.category].avgPrice * Math.max(1, item.quantity);
}

export interface SavingsSummary {
  rescuedValue: number;
  rescuedCount: number;
  wastedValue: number;
  wastedCount: number;
  eatenCount: number;
}

/** Totals for items resolved on or after `since`. */
export function summarize(items: PantryItem[], since: Date): SavingsSummary {
  const summary: SavingsSummary = { rescuedValue: 0, rescuedCount: 0, wastedValue: 0, wastedCount: 0, eatenCount: 0 };
  for (const item of items) {
    if (!item.resolvedAt || new Date(item.resolvedAt) < since) continue;
    if (item.status === 'eaten') {
      summary.eatenCount++;
      if ((item.daysLeftAtResolve ?? Infinity) <= RESCUE_WINDOW_DAYS) {
        summary.rescuedCount++;
        summary.rescuedValue += itemValue(item);
      }
    } else if (item.status === 'thrown') {
      summary.wastedCount++;
      summary.wastedValue += itemValue(item);
    }
  }
  summary.rescuedValue = Math.round(summary.rescuedValue);
  summary.wastedValue = Math.round(summary.wastedValue);
  return summary;
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
