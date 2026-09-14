import type { UserDetails } from '@/api/gen/models';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

type AuthState = {
  user: UserDetails | null;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        clear: () => set({ user: null }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
