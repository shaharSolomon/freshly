import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { normalizeName } from '@/domain/habits';
import { IS_DEMO, IS_LOCAL } from '@/services/demo';

/** Why something is on the list, shown under it so the list explains itself. */
export type ShoppingSource = 'manual' | 'habit' | 'finished' | 'thrown' | 'recipe';

export interface ShoppingItem {
  id: string;
  key: string;
  name: string;
  source: ShoppingSource;
  /** Recipe title when source is "recipe". */
  note?: string;
  addedAt: string;
  done: boolean;
}

interface ShoppingState {
  list: ShoppingItem[];
  /** Adds unless the same product is already waiting on the list. Returns false for duplicates. */
  add: (name: string, source: ShoppingSource, note?: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  /** Takes back an automatic entry, e.g. when "eaten" is undone. */
  removeAuto: (name: string) => void;
  clearDone: () => void;
}

export const useShopping = create<ShoppingState>()(
  persist(
    (set, get) => ({
      list: IS_DEMO ? demoList() : [],

      add: (name, source, note) => {
        const key = normalizeName(name);
        if (!key || get().list.some((i) => i.key === key && !i.done)) return false;
        const item: ShoppingItem = {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          key,
          name: name.trim(),
          source,
          note,
          addedAt: new Date().toISOString(),
          done: false,
        };
        set((s) => ({ list: [...s.list, item] }));
        return true;
      },

      toggle: (id) => set((s) => ({ list: s.list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) })),

      remove: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) })),

      removeAuto: (name) => {
        const key = normalizeName(name);
        set((s) => ({
          list: s.list.filter((i) => !(i.key === key && !i.done && (i.source === 'finished' || i.source === 'thrown'))),
        }));
      },

      clearDone: () => set((s) => ({ list: s.list.filter((i) => !i.done) })),
    }),
    {
      name: IS_DEMO ? 'freshly-demo-shopping' : IS_LOCAL ? 'freshly-local-shopping' : 'freshly-shopping',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function demoList(): ShoppingItem[] {
  const at = new Date().toISOString();
  return [
    { id: 'demo-s1', key: 'חלב 3%', name: 'חלב 3%', source: 'finished', addedAt: at, done: false },
    { id: 'demo-s2', key: 'חסה', name: 'חסה', source: 'thrown', addedAt: at, done: false },
  ];
}
