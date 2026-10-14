import { type Value } from 'platejs';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type CommentState = {
  discussionDrafts: Record<string, Value>;
  setDiscussionDrafts: (discussionDrafts: Record<string, Value>) => void;
  upsertDiscussionDraft: (key: string, value: Value) => void;
  removeDiscussionDraft: (key: string) => void;
};

export const useCommentStore = create<CommentState>()(
  devtools(
    (set) => ({
      discussionDrafts: {},
      setDiscussionDrafts: (discussionDrafts) => set({ discussionDrafts }),
      upsertDiscussionDraft: (key, value) =>
        set((state) => ({
          discussionDrafts: { ...state.discussionDrafts, [key]: value },
        })),
      removeDiscussionDraft: (key) =>
        set((state) => {
          if (!(key in state.discussionDrafts)) return state;
          const discussionDrafts = { ...state.discussionDrafts };
          delete discussionDrafts[key];
          return { discussionDrafts };
        }),
    }),

    { name: 'CommentStore' },
  ),
);
