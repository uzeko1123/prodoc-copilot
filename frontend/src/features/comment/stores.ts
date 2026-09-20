import { discussionsData } from '@/mock/comment-discussions';
import { create } from 'zustand';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { devtools, persist } from 'zustand/middleware';
import type { TDiscussion } from './components/editor/plugins/discussion-kit';

type CommentState = {
  discussions: TDiscussion[];
  setDiscussions: (discussions: TDiscussion[]) => void;
};

export const useCommentStore = create<CommentState>()(
  devtools(
    persist(
      (set) => ({
        discussions: discussionsData,
        setDiscussions: (discussions) => set({ discussions }),
      }),
      {
        name: 'comment-storage',
        storage: createDebouncedJSONStorage('localStorage'),
        partialize: (state) => ({ discussions: state.discussions }),
      },
    ),
    { name: 'CommentStore' },
  ),
);
