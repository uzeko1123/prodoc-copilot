'use client';

import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, applyAISuggestions } from '@platejs/ai/react';
import type { PlateEditor } from 'platejs/react';

/** `content` is the full replacement markdown for the selected blocks. */
export type EditToolInput = { content: string };

/** Tool contract sent to the backend agent (JSON-schema form). */
export const editToolDefinition = {
  description:
    'Rewrite the selected editor content. Returns the full replacement markdown for the selection; the client diffs it into inline suggestions. Use for rewrite tasks (improve writing, fix spelling, make longer/shorter, emojify, simplify language).',
  inputSchema: {
    additionalProperties: false,
    properties: {
      content: {
        description:
          'Full replacement markdown for the selected blocks, streamed incrementally as it is generated.',
        type: 'string',
      },
    },
    required: ['content'],
    type: 'object',
  },
  name: 'edit',
} as const;

/**
 * Apply a streamed `edit` chunk: diff the full replacement markdown against
 * the selected blocks into transient inline suggestions.
 */
export const applyEditChunk = (
  editor: PlateEditor,
  { isFirst, text: content }: { isFirst: boolean; text: string },
) => {
  editor.setOption(AIChatPlugin, 'mode', 'chat');
  editor.setOption(AIChatPlugin, 'toolName', 'edit');

  withAIBatch(
    editor,
    () => {
      applyAISuggestions(editor, content);
    },
    {
      split: isFirst,
    },
  );
};
