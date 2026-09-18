import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { ChatMessage } from './components/editor/use-chat';

type ChatState = {
  chatMessages: ChatMessage[];
  setChatMessages: (chatMessages: ChatMessage[]) => void;
  upsertChatMessage: (message: ChatMessage) => void;
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatMessages: [],
        setChatMessages: (chatMessages) => set({ chatMessages }),
        upsertChatMessage: (chatMessage) =>
          set((state) => ({
            chatMessages: state.chatMessages.some(
              (m) => m.id === chatMessage.id,
            )
              ? state.chatMessages.map((m) =>
                  m.id === chatMessage.id ? chatMessage : m,
                )
              : [...state.chatMessages, chatMessage],
          })),
      }),
      {
        name: 'chat-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          chatMessages: state.chatMessages,
        }),
      },
    ),
    { name: 'ChatStore' },
  ),
);
