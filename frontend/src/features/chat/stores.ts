import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { ChatMessage } from './components/editor/use-chat';

type ChatState = {
  chatMessages: ChatMessage[];
  setChatMessages: (chatMessages: ChatMessage[]) => void;
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatMessages: [],
        setChatMessages: (chatMessages) => set({ chatMessages }),
      }),
      {
        name: 'chat-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ chatMessages: state.chatMessages }),
      },
    ),
    { name: 'ChatStore' },
  ),
);
