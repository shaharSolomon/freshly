import { create } from 'zustand';

import type { DraftItem } from '@/domain/types';

/** Items read from a receipt, waiting on the review screen. Not persisted. */
export const useDrafts = create<{ drafts: DraftItem[]; setDrafts: (d: DraftItem[]) => void }>()((set) => ({
  drafts: [],
  setDrafts: (drafts) => set({ drafts }),
}));
