'use client';

import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { KEYS, nanoid, NodeApi, TextApi, type TNode } from 'platejs';
import type { PlateEditor } from 'platejs/react';

/** Locates the range to comment on, mirroring the `data-comment` payload. */
export type CommentToolInput = {
  blockId: string;
  comment: string;
  content: string;
};

/** Tool contract sent to the backend agent (JSON-schema form). */
export const commentToolDefinition = {
  description:
    'Attach a comment to existing editor content. Call once per comment; the client resolves blockId/content back to the exact text range and creates a discussion thread.',
  inputSchema: {
    additionalProperties: false,
    properties: {
      blockId: {
        description:
          'Id of the top-level block the comment anchors to, taken from ctx.children.',
        type: 'string',
      },
      comment: {
        description: 'Comment text shown in the discussion thread.',
        type: 'string',
      },
      content: {
        description:
          'Markdown slice of the document the comment applies to, used to locate the exact range.',
        type: 'string',
      },
    },
    required: ['blockId', 'comment', 'content'],
    type: 'object',
  },
  name: 'comment',
} as const;

/** Apply a finished `comment` tool call: anchor a new discussion to the range. */
export const applyComment = (editor: PlateEditor, input: CommentToolInput) => {
  editor.setOption(AIChatPlugin, 'toolName', 'comment');
  applyAIComment(editor, input);
};

/** Create a discussion and apply comment marks for an AI comment. */
const applyAIComment = (editor: PlateEditor, aiComment: CommentToolInput) => {
  const range = aiCommentToRange(editor, aiComment);

  if (!range) return console.warn('No range found for AI comment');

  const discussions = editor.getOption(discussionPlugin, 'discussions') || [];

  // Generate a new discussion ID
  const discussionId = nanoid();

  // Create a new comment
  const newComment = {
    id: nanoid(),
    contentRich: [{ children: [{ text: aiComment.comment }], type: 'p' }],
    createdAt: new Date(),
    discussionId,
    isEdited: false,
    userId: editor.getOption(discussionPlugin, 'currentUserId'),
  };

  // Create a new discussion
  const newDiscussion = {
    id: discussionId,
    comments: [newComment],
    createdAt: new Date(),
    documentContent: deserializeMd(editor, aiComment.content)
      .map((node: TNode) => NodeApi.string(node))
      .join('\n'),
    isResolved: false,
    userId: editor.getOption(discussionPlugin, 'currentUserId'),
  };

  // Update discussions
  const updatedDiscussions = [...discussions, newDiscussion];
  editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);

  // Apply comment marks to the editor
  editor.tf.withMerging(() => {
    editor.tf.setNodes(
      {
        [getCommentKey(newDiscussion.id)]: true,
        [getTransientCommentKey()]: true,
        [KEYS.comment]: true,
      },
      {
        at: range,
        match: TextApi.isText,
        split: true,
      },
    );
  });
};

/** Clear the transient comment selection state once all comments are in. */
export const finishAIComments = (editor: PlateEditor) => {
  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
};
