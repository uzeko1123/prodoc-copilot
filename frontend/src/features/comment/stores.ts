import type { Range } from '@tiptap/core';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type Comment = {
  /** Shared with the `comment` mark's `id` attribute in the editor doc. */
  id: string;
  /** Position snapshot at creation time; jumps re-derive the live range from the doc. */
  range: Range;
  /** Quoted text snapshot via `doc.textBetween(from, to, '\n')`. */
  text: string;
  createdAt: number;
};

type HoverPosition = { x: number; y: number } | null;

type CommentState = {
  comments: Comment[];
  activeCommentId: string | null;
  /** Comment ids covering the cursor position; null when not hovering a comment. */
  hoveredCommentIds: string[] | null;
  /** Viewport (client) coords the hover tooltip anchors to; null when no hover. */
  hoverPosition: HoverPosition;
  addComment: (comment: Comment) => void;
  /** Apply live (transaction-mapped) ranges for the given comments. */
  updateCommentRanges: (updates: Array<{ id: string; range: Range }>) => void;
  setActiveCommentId: (id: string | null) => void;
  /**
   * Contract: tooltip visible ⇔ ids non-empty AND pos non-null.
   * Either one null (or ids empty) clears both.
   */
  setHover: (
    ids: string[] | null,
    pos: { x: number; y: number } | null,
  ) => void;
};

export const useCommentStore = create<CommentState>()(
  devtools(
    (set) => ({
      comments: [],
      activeCommentId: null,
      hoveredCommentIds: null,
      hoverPosition: null,
      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),
      updateCommentRanges: (updates) =>
        set((state) => {
          const next = new Map(updates.map((u) => [u.id, u.range]));
          let changed = false;
          const comments = state.comments.map((c) => {
            const range = next.get(c.id);
            if (
              !range ||
              (range.from === c.range.from && range.to === c.range.to)
            ) {
              return c;
            }
            changed = true;
            return { ...c, range };
          });
          // Same state reference when nothing moved → no subscriber re-render.
          return changed ? { comments } : state;
        }),
      setActiveCommentId: (activeCommentId) => set({ activeCommentId }),
      setHover: (ids, pos) =>
        set({
          hoveredCommentIds: ids && ids.length > 0 ? ids : null,
          hoverPosition: ids && ids.length > 0 && pos ? pos : null,
        }),
    }),
    { name: 'CommentStore' },
  ),
);
