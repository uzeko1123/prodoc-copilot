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
      description:
        '目标块 ID，即 Context 文档树（children）中目标块节点的 id 属性值',
      type: 'string',
    },
    content: {
      description:
        '定位用的原文片段（纯文本，须与文档逐字一致）：在目标块的纯文本中匹配此内容以确定操作范围，先精确匹配、再模糊匹配，取首次出现的位置；多个片段之间以空行分隔时，各片段依次在目标块之后的兄弟块中匹配，共同构成一个连续范围（此时取第一段所在块的 id 作为 blockId）',
      type: 'string',
    },
    comment: {
      description: '评论内容（纯文本，不使用 Markdown 语法）',
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'comment'],
  additionalProperties: false,
  type: 'object',
});

export const commentTool = tool({
  description:
    '评论工具（comment）：为文档中的一段文本附加一条评论。blockId 选定目标块，content 在该块内定位范围，comment 为评论内容（纯文本）',
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
