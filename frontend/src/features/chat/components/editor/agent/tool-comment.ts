import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import { KEYS, nanoid, NodeApi, TextApi, type TNode } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

/**
 * Tool: comment (insert + comment and chat + comment, merged).
 * Creates a discussion and marks the commented range in the document.
 */
export type AIComment = {
  blockId: string;
  comment: string;
  content: string;
};

/** Entry of the comment tool for the UIMessage TOOLS generic. */
export type CommentTool = {
  comment: { input: AIComment; output: { success: boolean } };
};

/** Tool part of the comment tool, across all lifecycle states. */
type CommentToolUIPart = ToolUIPart<CommentTool>;

export const commentTool = tool({
  description:
    '对文档中的某个块添加评论。blockId 取自请求 context.children 顶层块的 id；content 为该块内的原文片段，用于锚定精确的评论范围。',
  inputSchema: jsonSchema<AIComment>({
    additionalProperties: false,
    properties: {
      blockId: {
        description: '被评论的顶层块 id（来自 context.children）',
        type: 'string',
      },
      comment: {
        description: '评论内容',
        type: 'string',
      },
      content: {
        description: '块内被评论的原文片段',
        type: 'string',
      },
    },
    required: ['blockId', 'comment', 'content'],
    type: 'object',
  }),
});

/**
 * Comment path of the legacy `onData` handler (`data-comment` events), moved
 * as-is: resolve the range, create the discussion + comment, apply marks.
 */
export function applyAIComment(editor: PlateEditor, aiComment: AIComment) {
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

/**
 * Tool call ids already applied. Comments mutate the document
 * non-idempotently, so the id guard makes the snapshot-driven effect re-runs
 * (including the post-`addToolOutput` re-run) apply exactly once. Entries are
 * never cleared.
 */
const appliedComments = new Set<string>();

/**
 * Comment branch of the agent tool-part dispatch: comments mutate the
 * document non-idempotently, so wait for the complete input
 * (`input-available`) and apply exactly once, ending the block selection
 * right after each comment (was: `finishAIComments` at stream end).
 */
export function applyCommentTool(
  editor: PlateEditor,
  chat: Chat,
  part: CommentToolUIPart,
) {
  if (part.state !== 'input-available') return;
  if (appliedComments.has(part.toolCallId)) return;

  appliedComments.add(part.toolCallId);

  // Backfill the `{success}` output right after applying — this promotes the
  // part to `output-available`, so the next request includes it as a tool result.
  chat.addToolOutput({
    tool: 'comment',
    toolCallId: part.toolCallId,
    output: { success: true },
  });

  setInsertCommentContext(editor);
  applyAIComment(editor, part.input);

  // End block selection immediately so the new comment marks are not masked
  // by the selection overlay. No re-select is needed for later comments in
  // the same response: they address blocks by id (aiCommentToRange never
  // reads the selection), so nothing downstream depends on the selection.
  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}

/** Restore the Plate.js AIChatPlugin context (insert + comment) this tool maps to. */
function setInsertCommentContext(editor: PlateEditor) {
  if (editor.getOption(AIChatPlugin, 'mode') !== 'insert') {
    editor.setOption(AIChatPlugin, 'mode', 'insert');
  }
  if (editor.getOption(AIChatPlugin, 'toolName') !== 'comment') {
    editor.setOption(AIChatPlugin, 'toolName', 'comment');
  }
}
