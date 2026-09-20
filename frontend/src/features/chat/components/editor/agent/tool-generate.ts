import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, streamInsertChunk } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseSuggestionPlugin, getSuggestionKey } from '@platejs/suggestion';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import { KEYS, nanoid, type TSuggestionData } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

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

// One stable suggestion id per tool call, so every streamed chunk lands as
// part of a single reviewable insertion.
const suggestionData = new Map<string, TSuggestionData>();

export function applyGeneratePrimitive(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
  toolCallId: string,
) {
  if (isFirst) {
    suggestionData.set(toolCallId, {
      createdAt: Date.now(),
      id: nanoid(),
      type: 'insert',
      userId: editor.getOption(BaseSuggestionPlugin, 'currentUserId'),
    });

    // Reset the streamInsertChunk cursor so consecutive tool calls in one
    // message don't continue the previous insertion.
    editor.setOption(AIChatPlugin, '_blockPath', null);
    editor.setOption(AIChatPlugin, '_blockChunks', '');
    editor.setOption(AIChatPlugin, 'streaming', true);

    // In block-selection mode there is no editor.selection. Select the end of
    // the last selected block so the insertion lands below it instead of
    // falling back to the document top.
    if (!editor.selection) {
      const lastBlock = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()
        .at(-1);

      if (lastBlock) {
        editor.tf.select(editor.api.end(lastBlock[1]));
      }
    }
  }

  if (chunk.length === 0) return;

  const data = suggestionData.get(toolCallId);
  if (!data) return;

  withAIBatch(
    editor,
    () => {
      if (!editor.getOption(AIChatPlugin, 'streaming')) return;

      editor.tf.withScrolling(() => {
        streamInsertChunk(editor, chunk, {
          textProps: {
            [getSuggestionKey(data.id)]: data,
            [KEYS.suggestion]: true,
          },
        });
      });
    },
    { split: isFirst },
  );
}

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
  applyGeneratePrimitive(
    editor,
    content.slice(appliedContent.length),
    appliedContent === '',
    part.toolCallId,
  );
}

export function resetGenerateTool() {
  applied.clear();
  output.clear();
  suggestionData.clear();
}
