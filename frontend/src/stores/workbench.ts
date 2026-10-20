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
  setActiveMainTab: (tab: string) => void;

  activeLeftPanelTab: string;
  setActiveLeftPanelTab: (tab: string) => void;

  activeRightPanelTab: string;
  setActiveRightPanelTab: (tab: string) => void;

  settingsDialogOpen: boolean;
  setSettingsDialogOpen: (settingsDialogOpen: boolean) => void;
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

      activeRightPanelTab: '1',
      setActiveRightPanelTab: (activeRightPanelTab) =>
        set({ activeRightPanelTab }),

      settingsDialogOpen: false,
      setSettingsDialogOpen: (settingsDialogOpen) =>
        set({ settingsDialogOpen }),
    }),
    { name: 'WorkbenchStore' },
  ),
);
