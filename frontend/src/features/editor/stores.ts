import type { Range } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';

type EditorState = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
};

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
}));

type Context = {
  target: 'ai' | 'comment';
  range: Range;
};

type ContextState = {
  context: Context | null;
  setContext: (context: Context | null) => void;
};

export const useContextStore = create<ContextState>()(
  devtools(
    persist(
      (set) => ({
        context: null,
        setContext: (context) => set({ context }),
      }),
      {
        name: 'context-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ context: state.context }),
      },
    ),
    { name: 'ContextStore' },
  ),
);
