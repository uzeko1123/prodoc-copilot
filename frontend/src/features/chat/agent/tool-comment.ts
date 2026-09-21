import { AIChatPlugin } from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { applyComment } from './tool-utils/comment';

export type CommentToolIO = {
  blockId: string;
  comment: string;
  content: string;
};

export type CommentTool = {
  comment: { input: CommentToolIO; output: CommentToolIO };
};

const schema = jsonSchema<CommentToolIO>({
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
});

export const commentTool = tool({
  description: 'Comment',
  inputSchema: schema,
  outputSchema: schema,
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
