import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type GuideState = {
  activeGuideClauseId: string | null;
  setActiveGuideClauseId: (activeGuideClauseId: string | null) => void;
};

export const useGuideStore = create<GuideState>()(
  devtools(
    (set) => ({
      activeGuideClauseId: null,
      setActiveGuideClauseId: (activeGuideClauseId) =>
        set({ activeGuideClauseId }),
    }),
    { name: 'GuideStore' },
  ),
);
