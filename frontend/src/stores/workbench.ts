import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type WorkbenchState = {
  isLeftPanelOpen: boolean;
  setLeftPanelOpen: (isLeftPanelOpen: boolean) => void;
  toggleLeftPanel: () => void;

  isRightPanelOpen: boolean;
  setRightPanelOpen: (isRightPanelOpen: boolean) => void;
  toggleRightPanel: () => void;

  activeMainTab: string;
  setActiveMainTab: (tab: string) => void;

  activeLeftPanelTab: string;
  setActiveLeftPanelTab: (tab: string) => void;

  activeRightPanelTab: string;
  setActiveRightPanelTab: (tab: string) => void;
};

export const useWorkbenchStore = create<WorkbenchState>()(
  devtools(
    (set) => ({
      isLeftPanelOpen: true,
      setLeftPanelOpen: (isLeftPanelOpen) => set({ isLeftPanelOpen }),
      toggleLeftPanel: () =>
        set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),

      isRightPanelOpen: true,
      setRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),
      toggleRightPanel: () =>
        set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

      activeMainTab: 'chat',
      setActiveMainTab: (activeMainTab) => set({ activeMainTab }),

      activeLeftPanelTab: 'toc',
      setActiveLeftPanelTab: (activeLeftPanelTab) =>
        set({ activeLeftPanelTab }),

      activeRightPanelTab: '1',
      setActiveRightPanelTab: (activeRightPanelTab) =>
        set({ activeRightPanelTab }),
    }),
    { name: 'WorkbenchStore' },
  ),
);
