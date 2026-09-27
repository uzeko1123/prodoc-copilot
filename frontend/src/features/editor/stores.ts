import { value } from '@/mock/editor-value';
import type { Value } from 'platejs';
import type { CSSProperties } from 'react';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';

export type FontFamily =
  "'Noto Sans SC Variable', sans-serif" | "'Noto Serif SC Variable', serif";

type EditorFontFamily = CSSProperties & {
  '--editor-font-family-body': FontFamily;
  '--editor-font-family-heading': FontFamily;
};

type EditorState = {
  editorFontFamily: EditorFontFamily;
  setEditorFontFamily: (editorFont: EditorFontFamily) => void;

  value: Value;
  setValue: (value: Value) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        editorFontFamily: {
          '--editor-font-family-body': "'Noto Sans SC Variable', sans-serif",
          '--editor-font-family-heading': "'Noto Sans SC Variable', sans-serif",
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
