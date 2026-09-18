import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, applyAISuggestions } from '@platejs/ai/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../use-agent';

/**
 * Tool: edit (chat + edit).
 * Rewrites the selected text; the result is presented as inline suggestions.
 */
export type EditToolInput = { content: string };

/** Entry of the edit tool for the UIMessage TOOLS generic. */
export type EditTool = {
  edit: { input: EditToolInput; output: { success: boolean } };
};

/** Tool part of the edit tool, across all lifecycle states. */
type EditToolUIPart = ToolUIPart<EditTool>;

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

/**
 * Edit path of the legacy `useChatChunk` onChunk handler (chat + edit):
 * re-applies suggestions from the full accumulated content, splitting the
 * undo batch only on the first chunk.
 */
export function applyEditChunk(
  editor: PlateEditor,
  content: string,
  isFirst: boolean,
) {
  withAIBatch(
    editor,
    () => {
      applyAISuggestions(editor, content);
    },
    {
      split: isFirst,
    },
  );
}

/**
 * Per-toolCallId last-applied content prefixes (used to detect `isFirst`).
 * Module-level on purpose: the tool-part effect re-runs on every snapshot,
 * so the base must live outside the render cycle. Entries are never cleared.
 */
const appliedPrefixes = new Map<string, string>();

/**
 * Edit branch of the agent tool-part dispatch: consume the (possibly still
 * partial) content as it grows, diffing against the per-toolCallId applied
 * prefix, then re-apply suggestions from the full accumulated content.
 */
export function applyEditTool(
  editor: PlateEditor,
  chat: Chat,
  part: EditToolUIPart,
) {
  // Backfill the `{success}` output as soon as the input is complete —
  // mid-stream is fine (this mirrors the SDK's onToolCall timing). This
  // promotes the part to `output-available`, so the next request includes it
  // as a tool result.
  if (part.state === 'input-available') {
    chat.addToolOutput({
      tool: 'edit',
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

  appliedPrefixes.set(part.toolCallId, content);

  setChatEditContext(editor);
  applyEditChunk(editor, content, isFirst);
}

/** Restore the Plate.js AIChatPlugin context (chat + edit) this tool maps to. */
function setChatEditContext(editor: PlateEditor) {
  if (editor.getOption(AIChatPlugin, 'mode') !== 'chat') {
    editor.setOption(AIChatPlugin, 'mode', 'chat');
  }
  if (editor.getOption(AIChatPlugin, 'toolName') !== 'edit') {
    editor.setOption(AIChatPlugin, 'toolName', 'edit');
  }
}
