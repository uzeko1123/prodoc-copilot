import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import { KEYS, nanoid, NodeApi, TextApi, type TNode } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

type CommentToolInput = {
  blockId: string;
  comment: string;
  content: string;
};

export type CommentTool = {
  comment: { input: CommentToolInput; output: { success: boolean } };
};

export const commentTool = tool({
  description: 'comment',
  inputSchema: jsonSchema<CommentToolInput>({
    properties: {
      blockId: {
        description: 'blockId',
        type: 'string',
      },
      comment: {
        description: 'comment',
        type: 'string',
      },
      content: {
        description: 'content',
        type: 'string',
      },
    },
    required: ['blockId', 'comment', 'content'],
    additionalProperties: false,
    type: 'object',
  }),
});

function applyCommentPrimitive(
  editor: PlateEditor,
  aiComment: CommentToolInput,
) {
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
}

function applyCommentFinishedPrimitive(editor: PlateEditor) {
  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();

  return;
}

const applied = new Set<string>();

export function applyCommentTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<CommentTool>,
) {
  if (part.state !== 'input-available') return;
  chat.addToolOutput({
    tool: 'comment',
    toolCallId: part.toolCallId,
    output: { success: true },
  });

  if (applied.has(part.toolCallId)) return;
  applied.add(part.toolCallId);

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'comment');
  applyCommentPrimitive(editor, part.input);
  applyCommentFinishedPrimitive(editor);
}
