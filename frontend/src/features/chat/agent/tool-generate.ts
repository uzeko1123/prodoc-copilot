import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { prompts } from './prompts/prompts';
import { applyGenerateSuggestion } from './utils/suggestion';

export type GenerateToolIO = {
  blockId: string;
  content: string;
  generate: string;
  guideClauseIds?: string[];
  error?: string;
};

export type GenerateTool = {
  generate: { input: GenerateToolIO; output: GenerateToolIO };
};

const generateIOSchema = jsonSchema<GenerateToolIO>({
  properties: {
    blockId: {
      description: prompts.tools.generate.schema.blockId,
      type: 'string',
    },
    content: {
      description: prompts.tools.generate.schema.content,
      type: 'string',
    },
    generate: {
      description: prompts.tools.generate.schema.generate,
      type: 'string',
    },
    guideClauseIds: {
      description: prompts.tools.generate.schema.guideClauseIds,
      type: 'array',
      items: { type: 'string' },
    },
    error: {
      description: prompts.tools.generate.schema.error,
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'generate'],
  additionalProperties: false,
  type: 'object',
});

export const generateTool = tool({
  description: prompts.tools.generate.description,
  inputSchema: generateIOSchema,
  outputSchema: generateIOSchema,
});

const applied = new Set<string>();
const output = new Set<string>();

export function applyGenerateTool(
  editor: PlateEditor,
  chat: Chat,
  part: ToolUIPart<GenerateTool>,
  taskId: string,
) {
  if (part.state !== 'input-available') return;
  if (applied.has(part.toolCallId)) return;

  const range =
    aiCommentToRange(editor, { ...part.input, comment: '' }) ??
    getBlockStartRange(editor, part.input.blockId);

  output.add(part.toolCallId);
  chat.addToolOutput({
    tool: 'generate',
    toolCallId: part.toolCallId,
    output: range
      ? part.input
      : {
          ...part.input,
          error: prompts.tools.generate.error,
        },
  });
  applied.add(part.toolCallId);

  if (!range) return console.warn('No range found for AI generate');

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'generate');
  applyGenerate(editor, part.input, taskId, range);
}

export function resetGenerateTool() {
  applied.clear();
  output.clear();
}

function applyGenerate(
  editor: PlateEditor,
  aiGenerate: GenerateToolIO,
  taskId: string,
  range: TRange,
) {
  withAIBatch(
    editor,
    () => {
      applyGenerateSuggestion(editor, range, aiGenerate, taskId);
    },
    { split: true },
  );

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}

function getBlockStartRange(editor: PlateEditor, blockId: string) {
  const entry = editor.api.node({ at: [], id: blockId });
  const start = entry ? editor.api.start(entry[1]) : undefined;
  if (!start) return;

  return { anchor: start, focus: start };
}
