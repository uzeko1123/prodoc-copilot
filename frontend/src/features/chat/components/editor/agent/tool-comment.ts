import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey } from '@platejs/comment';
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
  comment: { input: CommentToolInput; output: string };
};

export const commentTool = tool({
  description: 'Comment',
  inputSchema: jsonSchema<CommentToolInput>({
    properties: {
      blockId: {
        description: 'Block ID',
        type: 'string',
      },
      comment: {
        description: 'Comment (plain text)',
        type: 'string',
      },
      content: {
        description: 'Content (plain text)',
        type: 'string',
      },
    },
    required: ['blockId', 'comment', 'content'],
    additionalProperties: false,
    type: 'object',
  }),
});

type StreamedComment = {
  commentId: string;
  discussionId: string;
  text: string;
};

// Discussions created while the comment text was still streaming, keyed by
// tool call. They are finalized by applyCommentPrimitive once the input is
// complete, or dropped by cleanupCommentTool if the stream aborts.
const streamed = new Map<string, StreamedComment>();

function commentContentRich(text: string) {
  return [{ children: [{ text }], type: 'p' }];
}

function upsertStreamedComment(
  editor: PlateEditor,
  toolCallId: string,
  text: string,
) {
  const prev = streamed.get(toolCallId);

  // Skip tiny intermediate growth to avoid re-rendering the comment editor on
  // every chunk; the final text overwrites whatever lags behind.
  if (
    prev &&
    text.startsWith(prev.text) &&
    text.length - prev.text.length < 3
  ) {
    return;
  }

  const discussions = editor.getOption(discussionPlugin, 'discussions') || [];
  const userId = editor.getOption(discussionPlugin, 'currentUserId');

  if (!prev) {
    const discussionId = nanoid();
    const commentId = nanoid();

    streamed.set(toolCallId, { commentId, discussionId, text });
    editor.setOption(discussionPlugin, 'discussions', [
      ...discussions,
      {
        id: discussionId,
        comments: [
          {
            id: commentId,
            contentRich: commentContentRich(text),
            createdAt: new Date(),
            discussionId,
            isEdited: false,
            userId,
          },
        ],
        createdAt: new Date(),
        documentContent: '',
        isResolved: false,
        userId,
      },
    ]);
    return;
  }

  streamed.set(toolCallId, { ...prev, text });
  editor.setOption(
    discussionPlugin,
    'discussions',
    discussions.map((discussion) =>
      discussion.id === prev.discussionId
        ? {
            ...discussion,
            comments: discussion.comments.map((comment) =>
              comment.id === prev.commentId
                ? { ...comment, contentRich: commentContentRich(text) }
                : comment,
            ),
          }
        : discussion,
    ),
  );
}

function applyCommentPrimitive(
  editor: PlateEditor,
  aiComment: CommentToolInput,
  existing?: StreamedComment,
) {
  const range = aiCommentToRange(editor, aiComment);

  if (!range) return console.warn('No range found for AI comment');

  const discussions = editor.getOption(discussionPlugin, 'discussions') || [];
  const userId = editor.getOption(discussionPlugin, 'currentUserId');
  const discussionId = existing?.discussionId ?? nanoid();
  const documentContent = deserializeMd(editor, aiComment.content)
    .map((node: TNode) => NodeApi.string(node))
    .join('\n');

  if (existing) {
    // Finalize the discussion created while the comment text was streaming
    editor.setOption(
      discussionPlugin,
      'discussions',
      discussions.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              comments: discussion.comments.map((comment) =>
                comment.id === existing.commentId
                  ? {
                      ...comment,
                      contentRich: commentContentRich(aiComment.comment),
                    }
                  : comment,
              ),
              documentContent,
            }
          : discussion,
      ),
    );
  } else {
    editor.setOption(discussionPlugin, 'discussions', [
      ...discussions,
      {
        id: discussionId,
        comments: [
          {
            id: nanoid(),
            contentRich: commentContentRich(aiComment.comment),
            createdAt: new Date(),
            discussionId,
            isEdited: false,
            userId,
          },
        ],
        createdAt: new Date(),
        documentContent,
        isResolved: false,
        userId,
      },
    ]);
  }

  // Apply comment marks to the editor. Persistent from the start — no
  // transient key, no accept/reject step.
  withAIBatch(editor, () => {
    editor.tf.setNodes(
      {
        [getCommentKey(discussionId)]: true,
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
      output: part.input.comment,
    });
  }

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'comment');

  // Stream the comment text into the sidebar discussion as it grows
  if (part.state === 'input-streaming') {
    const comment = part.input?.comment;

    if (typeof comment === 'string' && comment.length > 0) {
      upsertStreamedComment(editor, part.toolCallId, comment);
    }
    return;
  }

  if (part.state !== 'input-available') return;
  if (applied.has(part.toolCallId)) return;
  applied.add(part.toolCallId);

  applyCommentPrimitive(editor, part.input, streamed.get(part.toolCallId));
  applyCommentFinishedPrimitive(editor);
}

/**
 * Remove streamed discussions whose marks never landed (aborted stream).
 */
export function cleanupCommentTool(editor: PlateEditor) {
  if (streamed.size === 0) return;

  const orphanedIds = new Set(
    [...streamed.entries()]
      .filter(([toolCallId]) => !applied.has(toolCallId))
      .map(([, { discussionId }]) => discussionId),
  );

  if (orphanedIds.size > 0) {
    const discussions = editor.getOption(discussionPlugin, 'discussions') || [];

    editor.setOption(
      discussionPlugin,
      'discussions',
      discussions.filter(
        (discussion) => !orphanedIds.has(discussion.id as string),
      ),
    );
  }

  streamed.clear();
}

export function resetCommentTool() {
  applied.clear();
  output.clear();
  streamed.clear();
}
