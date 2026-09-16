import { discussionsData } from '@/data/comment-discussions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { TDiscussion } from './components/editor/plugins/discussion-kit';

type CommentState = {
  discussions: TDiscussion[];
  setDiscussions: (discussions: TDiscussion[]) => void;
};

export const useCommentStore = create<CommentState>()(
  persist(
    (set) => ({
      discussions: discussionsData,
      setDiscussions: (discussions) => set({ discussions }),
    }),
    {
      name: 'comment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ discussions: state.discussions }),
    },
  ),
);
