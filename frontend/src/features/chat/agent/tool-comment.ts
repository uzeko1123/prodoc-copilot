import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { useCommentStore } from '@/features/comment/stores';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import { KEYS, nanoid, NodeApi, TextApi, type TNode } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { prompts } from './prompts/prompts';

export type CommentToolIO = {
  blockId: string;
  content: string;
  comment: string;
};

export type CommentTool = {
  comment: { input: CommentToolIO; output: CommentToolIO };
};

const commentToolIOSchema = jsonSchema<CommentToolIO>({
  properties: {
    blockId: {
      description: prompts.tools.comment.schema.blockId,
      type: 'string',
    },
    content: {
      description: prompts.tools.comment.schema.content,
      type: 'string',
    },
    comment: {
      description: prompts.tools.comment.schema.comment,
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'comment'],
  additionalProperties: false,
  type: 'object',
});

export const commentTool = tool({
  description: prompts.tools.comment.description,
  inputSchema: commentToolIOSchema,
  outputSchema: commentToolIOSchema,
});

const applied = new Set<string>();
const output = new Set<string>();

export function applyCommentTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<CommentTool>,
) {
  if (part.state === 'input-available' && !output.has(part.toolCallId)) {
    output.add(part.toolCallId);
    chat.addToolOutput({
      tool: 'comment',
      toolCallId: part.toolCallId,
      output: part.input,
    });
  }

  if (part.state !== 'input-available') return;
  if (applied.has(part.toolCallId)) return;
  applied.add(part.toolCallId);

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'comment');
  applyComment(editor, part.input);
}

export function resetCommentTool() {
  applied.clear();
  output.clear();
}

function applyComment(editor: PlateEditor, aiComment: CommentToolIO) {
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
  useCommentStore.getState().setDiscussions(updatedDiscussions);

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

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}
