import { value } from '@/mock/editor-value';
import { type Value } from 'platejs';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

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
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ value: state.value }),
      },
    ),
    { name: 'EditorStore' },
  ),
);
