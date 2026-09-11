import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ActiveTab = 'chat' | 'comment';

type WorkbenchState = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
};

export const useWorkbenchStore = create<WorkbenchState>()(
  devtools(
    (set) => ({
      activeTab: 'chat',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: 'WorkbenchStore' },
  ),
);
