import { value } from '@/mock/editor-value';
import type { Value } from 'platejs';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';

type EditorState = {
  value: Value;
  setValue: (value: Value) => void;
};

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        value: value,
        setValue: (value) => set({ value }),
      }),
      {
        name: 'editor-storage',
        storage: createDebouncedJSONStorage('localStorage', {
          debounceTime: 500,
        }),
        partialize: (state) => ({ value: state.value }),
      },
    ),
    { name: 'EditorStore' },
  ),
);
