import { value } from '@/mock/editor-value';
import type { Value } from 'platejs';
import type { CSSProperties } from 'react';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';

export type Font = 'var(--font-sans)' | 'var(--font-serif)';

type EditorFont = CSSProperties & {
  '--editor-font-body': Font;
  '--editor-font-heading': Font;
};

type EditorState = {
  editorFontFamily: EditorFont;
  setEditorFontFamily: (editorFont: EditorFont) => void;

  value: Value;
  setValue: (value: Value) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        editorFontFamily: {
          '--editor-font-body': 'var(--font-sans)',
          '--editor-font-heading': 'var(--font-sans)',
        },
        setEditorFontFamily: (editorFontFamily) => set({ editorFontFamily }),

        value: value,
        setValue: (value) => set({ value }),
      }),
      {
        name: 'editor-storage',
        storage: createDebouncedJSONStorage('localStorage', {
          debounceTime: 500,
        }),
        partialize: (state) => ({
          editorFontFamily: state.editorFontFamily,
          value: state.value,
        }),
      },
    ),
    { name: 'EditorStore' },
  ),
);
