import { BaseAIPlugin } from '@platejs/ai';
import {
  AIChatPlugin,
  getInsertPreviewStart,
  streamInsertChunk,
} from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { applyGenerateSuggestion } from './tool-suggestion';

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

export function applyGeneratePrimitive(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
) {
  if (isFirst) {
    const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

    editor.getTransforms(BaseAIPlugin).ai.beginPreview({
      originalBlocks:
        startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
          ? [cloneDeep(startBlock)]
          : [],
    });

    editor.tf.withoutSaving(() => {
      editor.tf.insertNodes(
        {
          children: [{ text: '' }],
          type: getPluginType(editor, KEYS.aiChat),
        },
        {
          at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
        },
      );
    });
    editor.setOption(AIChatPlugin, 'streaming', true);
  }

  if (chunk.length > 0) {
    editor.tf.withoutSaving(() => {
      if (!editor.getOption(AIChatPlugin, 'streaming')) return;

      editor.tf.withScrolling(() => {
        streamInsertChunk(editor, chunk, {
          textProps: {
            [getPluginType(editor, KEYS.ai)]: true,
          },
        });
      });
    });
  }
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
  // applyGeneratePrimitive(editor, content.slice(appliedContent.length), appliedContent === '');
  applyGenerateSuggestion(
    editor,
    content.slice(appliedContent.length),
    appliedContent === '',
  );
}

export function resetGenerateTool() {
  applied.clear();
  output.clear();
}
