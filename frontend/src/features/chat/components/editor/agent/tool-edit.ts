import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, applyAISuggestions } from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

type EditToolInput = { content: string };

export type EditTool = {
  edit: { input: EditToolInput; output: string };
};

export const editTool = tool({
  description: 'Edit',
  inputSchema: jsonSchema<EditToolInput>({
    properties: {
      content: {
        description: 'Content',
        type: 'string',
      },
    },
    required: ['content'],
    additionalProperties: false,
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
const output = new Set<string>();

export function applyEditTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<EditTool>,
) {
  if (part.state === 'input-available' && !output.has(part.toolCallId)) {
    output.add(part.toolCallId);
    chat.addToolOutput({
      tool: 'edit',
      toolCallId: part.toolCallId,
      output: part.input.content,
    });
  }

  const content = part.input?.content;
  if (typeof content !== 'string') return;
  let appliedContent = applied.get(part.toolCallId) ?? '';
  if (!content.startsWith(appliedContent)) appliedContent = '';
  if (content === appliedContent) return;
  applied.set(part.toolCallId, content);

  editor.setOption(AIChatPlugin, 'mode', 'chat');
  editor.setOption(AIChatPlugin, 'toolName', 'edit');
  applyEditPrimitive(editor, appliedContent === '', content);
}

export function resetEditTool() {
  applied.clear();
  output.clear();
}
