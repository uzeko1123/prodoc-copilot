import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { insertAtEndSuggestion } from './utils/suggestion';

export type GenerateToolIO = {
  blockId: string;
  content: string;
  generate: string;
};

export type GenerateTool = {
  generate: { input: GenerateToolIO; output: GenerateToolIO };
};

const generateIOSchema = jsonSchema<GenerateToolIO>({
  properties: {
    blockId: {
      description: 'Target block ID',
      type: 'string',
    },
    content: {
      description:
        'Original text in the target block, used to locate the range (fuzzy match)',
      type: 'string',
    },
    generate: {
      description: 'New content (Markdown), inserted at the end of the range',
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'generate'],
  additionalProperties: false,
  type: 'object',
});

export const generateTool = tool({
  description: 'Insert new content at the end of a text range',
  inputSchema: generateIOSchema,
  outputSchema: generateIOSchema,
});

const applied = new Set<string>();
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

  if (part.state !== 'input-available') return;
  if (applied.has(part.toolCallId)) return;
  applied.add(part.toolCallId);

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'generate');
  applyGenerate(editor, part.input);
}

export function resetGenerateTool() {
  applied.clear();
  output.clear();
}

function applyGenerate(editor: PlateEditor, aiGenerate: GenerateToolIO) {
  const range = aiCommentToRange(editor, { ...aiGenerate, comment: '' });

  if (!range) return console.warn('No range found for AI generate');

  withAIBatch(
    editor,
    () => {
      insertAtEndSuggestion(editor, range, aiGenerate.generate);
    },
    { split: true },
  );

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}
