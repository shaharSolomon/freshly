import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { daysUntil } from '@/domain/dates';
import { normalizeName, type Purchase } from '@/domain/habits';
import { demoPantry, IS_DEMO } from '@/services/demo';
import type { DraftItem, PantryItem } from '@/domain/types';

interface PantryState {
  items: PantryItem[];
  purchases: Purchase[];
  /** Habit keys the user said "not now" to, with the date, so we don't nag. */
  snoozed: Record<string, string>;
  addItems: (drafts: DraftItem[]) => PantryItem[];
  updateItem: (id: string, patch: Partial<Pick<PantryItem, 'name' | 'category' | 'quantity' | 'price' | 'expiresOn' | 'expirySource'>>) => void;
  /** Mark one unit as eaten or thrown. The item closes when the last unit goes. */
  resolve: (id: string, status: 'eaten' | 'thrown') => void;
  undoResolve: (id: string) => void;
  removeItem: (id: string) => void;
  snoozeHabit: (key: string) => void;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const usePantry = create<PantryState>()(
  persist(
    (set, get) => ({
      ...(IS_DEMO ? demoPantry() : { items: [], purchases: [] }),
      snoozed: {},

      addItems: (drafts) => {
        const now = new Date().toISOString();
        const created: PantryItem[] = drafts.map((d) => ({ ...d, id: newId(), addedAt: now, status: 'active' }));
        const purchases: Purchase[] = drafts.map((d) => ({ key: normalizeName(d.name), name: d.name, at: now }));
        set((s) => ({ items: [...s.items, ...created], purchases: [...s.purchases, ...purchases] }));
        return created;
      },

      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      resolve: (id, status) => {
        const item = get().items.find((i) => i.id === id);
        if (!item || item.status !== 'active') return;
        const now = new Date().toISOString();
        const daysLeft = daysUntil(item.expiresOn);
        const unitPrice = item.price !== undefined ? item.price / Math.max(1, item.quantity) : undefined;
        const closed: PantryItem = {
          ...item,
          id: item.quantity > 1 ? newId() : item.id,
          quantity: 1,
          price: unitPrice,
          status,
          resolvedAt: now,
          daysLeftAtResolve: daysLeft,
        };
        set((s) => ({
          items:
            item.quantity > 1
              ? [
                  ...s.items.map((i) =>
                    i.id === id ? { ...i, quantity: i.quantity - 1, price: unitPrice !== undefined ? unitPrice * (i.quantity - 1) : undefined } : i,
                  ),
                  closed,
                ]
              : s.items.map((i) => (i.id === id ? closed : i)),
        }));
      },

      undoResolve: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, status: 'active', resolvedAt: undefined, daysLeftAtResolve: undefined } : i,
          ),
        })),

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      snoozeHabit: (key) => set((s) => ({ snoozed: { ...s.snoozed, [key]: new Date().toISOString() } })),
    }),
    {
      name: IS_DEMO ? 'freshly-demo' : 'freshly-pantry',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const selectActive = (s: PantryState) => s.items.filter((i) => i.status === 'active');
