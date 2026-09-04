import type { UserDetails } from '@/api/gen/models';
import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';

export const useAuthStore = create<{
  user: UserDetails | null;
  clear: () => void;
}>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        clear: () =>
          set({
            user: null,
          }),
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
