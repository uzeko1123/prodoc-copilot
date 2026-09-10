import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { create } from 'zustand';

type TableOfContentsStore = {
  items: TableOfContentData;
  setItems: (items: TableOfContentData) => void;
};

export const useTableOfContentsStore = create<TableOfContentsStore>()(
  (set) => ({
    items: [],
    setItems: (items) => set({ items }),
  }),
);
