import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';

export type Font = 'var(--font-sans)' | 'var(--font-serif)';

type EditorFont = {
  '--editor-font-body': Font;
  '--editor-font-heading': Font;
};

export type TextIndent = '0em' | '2em' | '4em';

type EditorState = {
  editorFontFamily: EditorFont;
  setEditorFontFamily: (editorFontFamily: EditorFont) => void;

  editorTextIndent: TextIndent;
  setEditorTextIndent: (editorTextIndent: TextIndent) => void;
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

        editorTextIndent: '0em',
        setEditorTextIndent: (editorTextIndent) => set({ editorTextIndent }),
      }),
      {
        name: 'editor-storage',
        storage: createDebouncedJSONStorage('localStorage', {
          debounceTime: 500,
        }),
        partialize: (state) => ({
          editorFontFamily: state.editorFontFamily,
          editorTextIndent: state.editorTextIndent,
        }),
      },
    ),
    { name: 'EditorStore' },
  ),
);
