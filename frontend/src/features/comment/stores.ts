import { discussionsData } from '@/mock/comment-discussions';
import { type Value } from 'platejs';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';
import type { TDiscussion } from './components/editor/plugins/discussion-kit';

type CommentState = {
  discussionDrafts: Record<string, Value>;
  setDiscussionDrafts: (discussionDrafts: Record<string, Value>) => void;
  upsertDiscussionDraft: (key: string, value: Value) => void;
  removeDiscussionDraft: (key: string) => void;

  discussions: TDiscussion[];
  setDiscussions: (discussions: TDiscussion[]) => void;
};

export const useCommentStore = create<CommentState>()(
  devtools(
    persist(
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

        discussions: discussionsData,
        setDiscussions: (discussions) => set({ discussions }),
      }),
      {
        name: 'comment-storage',
        storage: createDebouncedJSONStorage('localStorage', {
          debounceTime: 1000,
        }),
        partialize: (state) => ({ discussions: state.discussions }),
      },
    ),
    { name: 'CommentStore' },
  ),
);
