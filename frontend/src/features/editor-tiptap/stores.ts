import type { Range } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
};

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
}));

type ContextState = {
  selection: Range | null;
  setSelection: (selection: Range | null) => void;
};

export const useContextStore = create<ContextState>()(
  devtools(
    (set) => ({
      selection: null,
      setSelection: (selection) => set({ selection }),
    }),
    { name: 'ContextStore' },
  ),
);
