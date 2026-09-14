import {
  discussionPlugin,
  type TDiscussion,
} from '@/components/shadcn/editor/plugins/discussion-kit';
import type { TComment } from '@/components/shadcn/ui/comment';
import type { MyEditor } from '@/features/editor/components/editor/editor-kit';
import { CommentPlugin } from '@platejs/comment/react';
import { nanoid, type Value } from 'platejs';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TUser = {
  id: string;
  avatarUrl: string;
  name: string;
  hue?: number;
};

export type TUsers = Record<string, TUser>;

type CommentState = {
  discussions: TDiscussion[];
  users: TUsers;
  currentUserId: string;
};

type CommentActions = {
  /** Real-time mirror of editor plugin options, pushed by `Comment()` on change. */
  syncEditorState: (state: Partial<CommentState>) => void;
  resetEditorState: () => void;

  /** Append a reply comment to an existing thread. */
  addComment: (input: {
    discussionId: string;
    contentRich: Value;
    editor: MyEditor;
  }) => void;
  /** Create a new unanchored thread (no inline mark, no documentContent). */
  addDiscussion: (input: { contentRich: Value; editor: MyEditor }) => void;
  /** Replace a comment body (marks it edited). */
  updateComment: (input: {
    id: string;
    discussionId: string;
    contentRich: Value;
    isEdited?: boolean;
    editor: MyEditor;
  }) => void;
  /** Delete a comment; deleting the last comment also deletes the thread and unsets its inline mark. */
  deleteComment: (input: {
    id: string;
    discussionId: string;
    editor: MyEditor;
  }) => void;
  /** Toggle a thread resolved/open; resolving also unsets the inline mark. */
  toggleResolve: (input: { discussionId: string; editor: MyEditor }) => void;
};

const initialState: CommentState = {
  discussions: [],
  users: {},
  currentUserId: '',
};

/**
 * Comment panel state + write interface. All mutations go through the live
 * editor's plugin options store (`editor.setOption`), so the caller passes the
 * editor instance (from `useEditorRef()` in `Comment()`) into each action. The
 * reactive option reads in `Comment()` then push the result back into this
 * store, so the panel updates without these actions touching `set()` themselves.
 */
export const useCommentStore = create<CommentState & CommentActions>()(
  devtools(
    (set) => ({
      ...initialState,
      syncEditorState: (state) => set(state),
      resetEditorState: () => set(initialState),

      addComment: ({ discussionId, contentRich, editor }) => {
        const currentUserId = editor.getOption(
          discussionPlugin,
          'currentUserId',
        );

        editor.setOption(
          discussionPlugin,
          'discussions',
          editor
            .getOption(discussionPlugin, 'discussions')
            .map((discussion) => {
              if (discussion.id !== discussionId) return discussion;

              return {
                ...discussion,
                comments: [
                  ...discussion.comments,
                  newComment(discussionId, contentRich, currentUserId),
                ],
              };
            }),
        );
      },

      addDiscussion: ({ contentRich, editor }) => {
        const currentUserId = editor.getOption(
          discussionPlugin,
          'currentUserId',
        );
        const id = nanoid();

        const newDiscussion: TDiscussion = {
          id,
          createdAt: new Date(),
          comments: [newComment(id, contentRich, currentUserId)],
          isResolved: false,
          userId: currentUserId,
          // No documentContent -> unanchored thread, no inline-mark work.
        };

        editor.setOption(discussionPlugin, 'discussions', [
          ...editor.getOption(discussionPlugin, 'discussions'),
          newDiscussion,
        ]);
      },

      updateComment: ({
        discussionId,
        id,
        contentRich,
        isEdited = true,
        editor,
      }) => {
        editor.setOption(
          discussionPlugin,
          'discussions',
          editor
            .getOption(discussionPlugin, 'discussions')
            .map((discussion) => {
              if (discussion.id !== discussionId) return discussion;

              return {
                ...discussion,
                comments: discussion.comments.map((comment) => {
                  if (comment.id !== id) return comment;

                  return {
                    ...comment,
                    contentRich,
                    isEdited,
                    // Runtime-only field, mirrors the legacy in-editor updateComment.
                    updatedAt: new Date(),
                  };
                }),
              };
            }),
        );
      },

      deleteComment: ({ discussionId, id, editor }) => {
        const discussions = editor.getOption(discussionPlugin, 'discussions');
        const thread = discussions.find((d) => d.id === discussionId);
        if (!thread) return;

        const isLastComment =
          thread.comments.length === 1 && thread.comments[0].id === id;
        const next = isLastComment
          ? discussions.filter((d) => d.id !== discussionId)
          : discussions.map((d) =>
              d.id === discussionId
                ? { ...d, comments: d.comments.filter((c) => c.id !== id) }
                : d,
            );

        editor.setOption(discussionPlugin, 'discussions', next);

        if (isLastComment) {
          // Context-free equivalent of the legacy
          // `useEditorPlugin(CommentPlugin).tf.comment.unsetMark({ id })`.
          editor.getTransforms(CommentPlugin).comment.unsetMark({
            id: discussionId,
          });
        }
      },

      toggleResolve: ({ discussionId, editor }) => {
        const discussions = editor.getOption(discussionPlugin, 'discussions');
        const thread = discussions.find((d) => d.id === discussionId);
        if (!thread) return;

        editor.setOption(
          discussionPlugin,
          'discussions',
          discussions.map((d) =>
            d.id === discussionId ? { ...d, isResolved: !d.isResolved } : d,
          ),
        );

        // Resolving removes the highlight from the document (legacy behavior).
        if (!thread.isResolved) {
          editor.getTransforms(CommentPlugin).comment.unsetMark({
            id: discussionId,
          });
        }
      },
    }),
    { name: 'CommentStore' },
  ),
);

const newComment = (
  discussionId: string,
  contentRich: Value,
  userId: string,
): TComment => ({
  id: nanoid(),
  contentRich,
  createdAt: new Date(),
  discussionId,
  isEdited: false,
  userId,
});
