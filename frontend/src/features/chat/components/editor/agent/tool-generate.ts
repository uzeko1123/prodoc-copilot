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
import type { Chat } from '../use-agent';

/**
 * Tool: generate (insert + generate).
 * Streams newly generated content below the cursor/selection.
 */
export type GenerateToolInput = { content: string };

/** Entry of the generate tool for the UIMessage TOOLS generic. */
export type GenerateTool = {
  generate: { input: GenerateToolInput; output: { success: boolean } };
};

/** Tool part of the generate tool, across all lifecycle states. */
type GenerateToolUIPart = ToolUIPart<GenerateTool>;

export const generateTool = tool({
  description:
    '在光标或选区下方插入新生成的内容。通过参数 content 流式返回完整内容（markdown）。',
  inputSchema: jsonSchema<GenerateToolInput>({
    additionalProperties: false,
    properties: {
      content: {
        description: '完整生成内容（markdown）',
        type: 'string',
      },
    },
    required: ['content'],
    type: 'object',
  }),
});

/**
 * Insertion path of the legacy `useChatChunk` onChunk handler (insert mode).
 * `isFirst` sets up the AI preview anchor below the current block unconditionally
 * (even for an empty chunk); the streaming section only runs on non-empty chunks.
 */
export function applyGenerateChunk(
  editor: PlateEditor,
  { chunk, isFirst }: { chunk: string; isFirst: boolean },
) {
  if (isFirst) {
    const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

    editor.getTransforms(BaseAIPlugin).ai.beginPreview({
      originalBlocks:
        startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
          ? [cloneDeep(startBlock)]
          : [],
    });

    if (!editor.selection) return;

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

/**
 * Per-toolCallId applied-content prefixes (the diff base). Module-level on
 * purpose: the tool-part effect re-runs on every snapshot, so the base must
 * live outside the render cycle. Entries are never cleared — after
 * `addToolOutput` flips the part to `output-available` the effect re-runs
 * once more and must not re-insert the full content.
 */
const appliedPrefixes = new Map<string, string>();

/**
 * Generate branch of the agent tool-part dispatch: consume the (possibly
 * still partial) content as it grows, diffing against the per-toolCallId
 * applied prefix and inserting each new chunk below the cursor.
 */
export function applyGenerateTool(
  editor: PlateEditor,
  chat: Chat,
  part: GenerateToolUIPart,
) {
  // Backfill the `{success}` output as soon as the input is complete —
  // mid-stream is fine (this mirrors the SDK's onToolCall timing). This
  // promotes the part to `output-available`, so the next request includes it
  // as a tool result.
  if (part.state === 'input-available') {
    chat.addToolOutput({
      tool: 'generate',
      toolCallId: part.toolCallId,
      output: { success: true },
    });
  }

  const content = part.input?.content;

  if (typeof content !== 'string') return;

  let applied = appliedPrefixes.get(part.toolCallId) ?? '';

  // Partial JSON hiccups (e.g. incomplete unicode escapes) can momentarily
  // rewrite the prefix — restart the diff from zero in that case.
  if (!content.startsWith(applied)) applied = '';
  if (content === applied) return;

  const isFirst = applied.length === 0;
  const chunk = content.slice(applied.length);

  appliedPrefixes.set(part.toolCallId, content);

  setInsertGenerateContext(editor);
  applyGenerateChunk(editor, { chunk, isFirst });
}

/** Restore the Plate.js AIChatPlugin context (insert + generate) this tool maps to. */
function setInsertGenerateContext(editor: PlateEditor) {
  if (editor.getOption(AIChatPlugin, 'mode') !== 'insert') {
    editor.setOption(AIChatPlugin, 'mode', 'insert');
  }
  if (editor.getOption(AIChatPlugin, 'toolName') !== 'generate') {
    editor.setOption(AIChatPlugin, 'toolName', 'generate');
  }
}
