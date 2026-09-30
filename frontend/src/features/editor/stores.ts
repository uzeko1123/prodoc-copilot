import type { Value } from 'platejs';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';
import { value } from './data/value';

export type Font = 'var(--font-sans)' | 'var(--font-serif)';

type EditorFont = {
  '--editor-font-body': Font;
  '--editor-font-heading': Font;
};

export type TextIndent = '0em' | '2em' | '4em';

type EditorState = {
  editorFontFamily: EditorFont;
  setEditorFontFamily: (editorFont: EditorFont) => void;

  editorTextIndent: TextIndent;
  setEditorTextIndent: (editorTextIndent: TextIndent) => void;

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

        editorTextIndent: '2em',
        setEditorTextIndent: (editorTextIndent) => set({ editorTextIndent }),

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
          editorTextIndent: state.editorTextIndent,
          value: state.value,
        }),
      },
    ),
    { name: 'EditorStore' },
  ),
);
