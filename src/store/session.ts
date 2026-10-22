import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser } from '@/services/auth';
import { IS_DEMO } from '@/services/demo';

export type SecondFactor = 'biometric' | 'pin';

interface SessionState {
  user: AuthUser | null;
  /** Set once the user has chosen how to unlock the app on this device. */
  secondFactor: SecondFactor | null;
  /** Not persisted: every cold start asks for the second factor again. */
  unlocked: boolean;
  hydrated: boolean;
  signIn: (user: AuthUser) => void;
  setName: (name: string) => void;
  enrol: (factor: SecondFactor) => void;
  unlock: () => void;
  lock: () => void;
  signOut: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      secondFactor: null,
      unlocked: false,
      hydrated: false,
      signIn: (user) => set({ user }),
      setName: (name) => set((s) => (s.user ? { user: { ...s.user, name } } : s)),
      enrol: (secondFactor) => set({ secondFactor, unlocked: true }),
      unlock: () => set({ unlocked: true }),
      lock: () => set({ unlocked: false }),
      signOut: () => set({ user: null, secondFactor: null, unlocked: false }),
    }),
    {
      name: IS_DEMO ? 'freshly-demo-session' : 'freshly-session',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, secondFactor: s.secondFactor }),
      onRehydrateStorage: () => () => useSession.setState({ hydrated: true }),
    },
  ),
);
