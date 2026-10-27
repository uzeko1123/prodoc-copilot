import {
  getMainDiscussionsListQueryKey,
  mainDiscussionsCreate,
} from '@/api/gen/endpoints/main/main';
import { DocumentPlugin } from '@/features/editor/components/editor/plugins/document-kit';
import { toastErrorMessage } from '@/lib/error-message';
import { queryClient } from '@/lib/query-client';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import { KEYS, NodeApi, TextApi, type TNode } from 'platejs';
import { getEditorPlugin, type PlateEditor } from 'platejs/react';
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
  const documentId = editor.getOption(DocumentPlugin, 'documentId');
  if (!documentId) return console.warn('No documentId found for AI comment');

  const range = aiCommentToRange(editor, aiComment);
  if (!range) return console.warn('No range found for AI comment');

  const discussionId = crypto.randomUUID();
  const contentRich = [{ children: [{ text: aiComment.comment }], type: 'p' }];
  const documentContent = deserializeMd(editor, aiComment.content)
    .map((node: TNode) => NodeApi.string(node))
    .join('\n');

  // Apply comment marks to the editor
  editor.tf.withMerging(() => {
    editor.tf.setNodes(
      {
        [getCommentKey(discussionId)]: true,
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

  void mainDiscussionsCreate({
    key: discussionId,
    document: documentId,
    document_content: documentContent,
    comment_inline: {
      key: crypto.randomUUID(),
      content_rich: contentRich,
    },
  })
    .then(() =>
      queryClient.invalidateQueries({
        queryKey: getMainDiscussionsListQueryKey(),
      }),
    )
    .catch((error) => {
      getEditorPlugin(editor, CommentPlugin).tf.comment.unsetMark({
        id: discussionId,
      });
      toastErrorMessage(error);
    });

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}
