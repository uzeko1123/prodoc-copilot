'use client';

import { BaseAIPlugin } from '@platejs/ai';
import {
  AIChatPlugin,
  getInsertPreviewStart,
  streamInsertChunk,
} from '@platejs/ai/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';

/** `content` is the full generated markdown, streamed incrementally. */
export type GenerateToolInput = { content: string };

/** Tool contract sent to the backend agent (JSON-schema form). */
export const generateToolDefinition = {
  description:
    'Generate new content and insert it into the editor after the cursor. Use for creation tasks (continue writing, explain, summarize, generate samples). Stream the complete markdown as it is generated.',
  inputSchema: {
    additionalProperties: false,
    properties: {
      content: {
        description:
          'Full markdown to insert, streamed incrementally as it is generated.',
        type: 'string',
      },
    },
    required: ['content'],
    type: 'object',
  },
  name: 'generate',
} as const;

/**
 * Apply a streamed `generate` chunk to the editor: the first chunk opens the
 * insert preview (anchor node below the selection), later chunks stream
 * markdown into it.
 */
export const applyGenerateChunk = (
  editor: PlateEditor,
  { chunk, isFirst }: { chunk: string; isFirst: boolean },
) => {
  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'generate');

  if (isFirst) {
    const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

    editor.getTransforms(BaseAIPlugin).ai.beginPreview({
      originalBlocks:
        startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
          ? [cloneDeep(startBlock)]
          : [],
    });

    const selection =
      editor.selection ?? editor.getOption(AIChatPlugin, 'chatSelection');

    if (selection) {
      editor.tf.withoutSaving(() => {
        editor.tf.insertNodes(
          {
            children: [{ text: '' }],
            type: getPluginType(editor, KEYS.aiChat),
          },
          {
            at: PathApi.next(selection.focus.path.slice(0, 1)),
          },
        );
      });
    }
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
};
