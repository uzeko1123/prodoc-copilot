import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';
// import type { ChatMessage } from './components/editor/use-chat';
import type { ChatMessage, ChatMode } from './components/editor/use-agent';

type ChatState = {
  chatMode: ChatMode;
  setChatMode: (chatMode: ChatMode) => void;

  chatInput: string;
  setChatInput: (chatInput: string) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (chatMessages: ChatMessage[]) => void;
  upsertChatMessage: (chatMessage: ChatMessage) => void;
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chatMode: 'chat',
        setChatMode: (chatMode) => set({ chatMode }),

        chatInput: '',
        setChatInput: (chatInput) => set({ chatInput }),

        chatMessages: [],
        setChatMessages: (chatMessages) => set({ chatMessages }),
        upsertChatMessage: (chatMessage) =>
          set((state) => {
            const chatMessageIndex = state.chatMessages.findIndex(
              (message) => message.id === chatMessage.id,
            );
            if (chatMessageIndex === -1) {
              return { chatMessages: [...state.chatMessages, chatMessage] };
            }
            if (state.chatMessages[chatMessageIndex] === chatMessage) {
              return state;
            }
            return {
              chatMessages: state.chatMessages.with(
                chatMessageIndex,
                chatMessage,
              ),
            };
          }),
      }),
      {
        name: 'chat-storage',
        storage: createDebouncedJSONStorage('localStorage', {
          debounceTime: 1000,
        }),
        partialize: (state) => ({
          chatMode: state.chatMode,
          chatMessages: state.chatMessages,
        }),
      },
    ),
    { name: 'ChatStore' },
  ),
);
