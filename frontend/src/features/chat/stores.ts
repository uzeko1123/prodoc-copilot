import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { ChatMessage } from './components/editor/use-chat';

type ChatState = {
  /** Demo panel history (replaced wholesale on mount by the panel). */
  chatMessages: ChatMessage[];
  /** Editor AI chat archive. Kept separate so the panel never clobbers it. */
  editorChatMessages: ChatMessage[];
  appendEditorChatMessages: (messages: ChatMessage[]) => void;
  setChatMessages: (chatMessages: ChatMessage[]) => void;
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatMessages: [],
        editorChatMessages: [],
        appendEditorChatMessages: (messages) =>
          set((state) => ({
            editorChatMessages: [...state.editorChatMessages, ...messages],
          })),
        setChatMessages: (chatMessages) => set({ chatMessages }),
      }),
      {
        name: 'chat-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          chatMessages: state.chatMessages,
          editorChatMessages: state.editorChatMessages,
        }),
      },
    ),
    { name: 'ChatStore' },
  ),
);
