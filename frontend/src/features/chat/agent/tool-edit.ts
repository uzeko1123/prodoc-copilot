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
      description:
        '目标块 ID，即 Context 文档树（children）中目标块节点的 id 属性值',
      type: 'string',
    },
    content: {
      description:
        '定位用的原文片段（纯文本，须与文档逐字一致）：在目标块的纯文本中匹配此内容以确定操作范围，先精确匹配、再模糊匹配，取首次出现的位置；多个片段之间以空行分隔时，各片段依次在目标块之后的兄弟块中匹配，共同构成一个连续范围（此时取第一段所在块的 id 作为 blockId）',
      type: 'string',
    },
    edit: {
      description:
        '替换后的完整文本（Markdown 语法）：仅替换定位到的范围，前后不会自动补空格或换行，所需的空格或换行符须按需自行写入；空字符串表示删除定位到的范围',
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'edit'],
  additionalProperties: false,
  type: 'object',
});

export const editTool = tool({
  description:
    '编辑工具（edit）：替换或删除文档中的一段文本。blockId 选定目标块，content 在该块内定位范围，edit 为替换后的完整文本（Markdown），空字符串表示删除该范围',
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
