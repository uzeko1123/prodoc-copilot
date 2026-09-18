import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, applyAISuggestions } from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

type EditToolInput = { content: string };

export type EditTool = {
  edit: { input: EditToolInput; output: { success: boolean } };
};

export const editTool = tool({
  description:
    '重写用户选中的文本。通过参数 content 返回完整的替换文本，将以 inline suggestion（差异对比）形式呈现给用户。',
  inputSchema: jsonSchema<EditToolInput>({
    additionalProperties: false,
    properties: {
      content: {
        description: '完整的替换文本',
        type: 'string',
      },
    },
    required: ['content'],
    type: 'object',
  }),
});

export function applyEditPrimitive(
  editor: PlateEditor,
  isFirst: boolean,
  content: string,
) {
  withAIBatch(
    editor,
    () => {
      applyAISuggestions(editor, content);
    },
    { split: isFirst },
  );
}

const applied = new Map<string, string>();

export function applyEditTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<EditTool>,
) {
  if (part.state === 'input-available') {
    chat.addToolOutput({
      tool: 'edit',
      toolCallId: part.toolCallId,
      output: { success: true },
    });
  }

  const content = part.input?.content;
  if (typeof content !== 'string') return;

  let appliedContent = applied.get(part.toolCallId) ?? '';
  if (!content.startsWith(appliedContent)) appliedContent = '';
  if (content === appliedContent) return;
  applied.set(part.toolCallId, content);

  const isFirst = appliedContent === '';

  editor.setOption(AIChatPlugin, 'mode', 'chat');
  editor.setOption(AIChatPlugin, 'toolName', 'edit');
  applyEditPrimitive(editor, isFirst, content);
}
