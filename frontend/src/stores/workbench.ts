import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type WorkbenchState = {
  leftPanelOpen: boolean;
  setLeftPanelOpen: (leftPanelOpen: boolean) => void;
  toggleLeftPanel: () => void;

  rightPanelOpen: boolean;
  setRightPanelOpen: (rightPanelOpen: boolean) => void;
  toggleRightPanel: () => void;

  activeMainTab: string;
  setActiveMainTab: (activeMainTab: string) => void;

  activeLeftPanelTab: string;
  setActiveLeftPanelTab: (activeLeftPanelTab: string) => void;

  activeRightPanelTab: string;
  setActiveRightPanelTab: (activeRightPanelTab: string) => void;
};

export const useWorkbenchStore = create<WorkbenchState>()(
  devtools(
    (set) => ({
      leftPanelOpen: true,
      setLeftPanelOpen: (leftPanelOpen) =>
        set({ leftPanelOpen: leftPanelOpen }),
      toggleLeftPanel: () =>
        set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),

      rightPanelOpen: true,
      setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
      toggleRightPanel: () =>
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

      activeMainTab: 'chat',
      setActiveMainTab: (activeMainTab) => set({ activeMainTab }),

      activeLeftPanelTab: 'toc',
      setActiveLeftPanelTab: (activeLeftPanelTab) =>
        set({ activeLeftPanelTab }),

      activeRightPanelTab: 'guide',
      setActiveRightPanelTab: (activeRightPanelTab) =>
        set({ activeRightPanelTab }),
    }),
    { name: 'WorkbenchStore' },
  ),
);
