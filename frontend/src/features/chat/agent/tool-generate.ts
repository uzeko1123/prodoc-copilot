import { AIChatPlugin } from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { applyGenerate } from './tool-utils/suggestion';

type GenerateToolIO = { content: string };

export type GenerateTool = {
  generate: { input: GenerateToolIO; output: GenerateToolIO };
};

const schema = jsonSchema<GenerateToolIO>({
  properties: {
    content: {
      description: 'Content (markdown)',
      type: 'string',
    },
  },
  required: ['content'],
  additionalProperties: false,
  type: 'object',
});

export const generateTool = tool({
  description: 'Generate',
  inputSchema: schema,
  outputSchema: schema,
});

const applied = new Map<string, string>();
const output = new Set<string>();

export function applyGenerateTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<GenerateTool>,
) {
  if (part.state === 'input-available' && !output.has(part.toolCallId)) {
    output.add(part.toolCallId);
    chat.addToolOutput({
      tool: 'generate',
      toolCallId: part.toolCallId,
      output: part.input,
    });
  }

  const content = part.input?.content;
  if (typeof content !== 'string') return;
  let appliedContent = applied.get(part.toolCallId) ?? '';
  if (!content.startsWith(appliedContent)) appliedContent = '';
  if (content === appliedContent) return;
  applied.set(part.toolCallId, content);

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'generate');
  applyGenerate(
    editor,
    content.slice(appliedContent.length),
    appliedContent === '',
  );
}

export function resetGenerateTool() {
  applied.clear();
  output.clear();
}
