import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { applyEditSuggestion } from './utils/suggestion';

export type EditToolIO = {
  blockId: string;
  content: string;
  edit: string;
};

export type EditTool = {
  edit: { input: EditToolIO; output: EditToolIO };
};

const editToolIOSchema = jsonSchema<EditToolIO>({
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
    edit: {
      description:
        'Full replacement text (Markdown); empty string deletes the range',
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'edit'],
  additionalProperties: false,
  type: 'object',
});

export const editTool = tool({
  description: 'Replace or delete a text range in the document',
  inputSchema: editToolIOSchema,
  outputSchema: editToolIOSchema,
});

const applied = new Set<string>();
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
      output: part.input,
    });
  }

  if (part.state !== 'input-available') return;
  if (applied.has(part.toolCallId)) return;
  applied.add(part.toolCallId);

  editor.setOption(AIChatPlugin, 'mode', 'insert');
  editor.setOption(AIChatPlugin, 'toolName', 'edit');
  applyEdit(editor, part.input);
}

export function resetEditTool() {
  applied.clear();
  output.clear();
}

function applyEdit(editor: PlateEditor, aiEdit: EditToolIO) {
  const range = aiCommentToRange(editor, { ...aiEdit, comment: '' });

  if (!range) return console.warn('No range found for AI edit');

  withAIBatch(
    editor,
    () => {
      applyEditSuggestion(editor, range, aiEdit.edit);
    },
    { split: true },
  );

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
}
