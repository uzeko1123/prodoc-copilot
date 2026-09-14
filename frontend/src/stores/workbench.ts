import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type WorkbenchState = {
  isLeftPanelOpen: boolean;
  setLeftPanelOpen: (isLeftPanelOpen: boolean) => void;
  toggleLeftPanel: () => void;

  isRightPanelOpen: boolean;
  setRightPanelOpen: (isRightPanelOpen: boolean) => void;
  toggleRightPanel: () => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
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

      activeTab: 'chat',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: 'WorkbenchStore' },
  ),
);
