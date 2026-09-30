import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, aiCommentToRange } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { jsonSchema, tool, type ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat } from '../components/editor/use-agent';
import { applyGenerateSuggestion } from './utils/suggestion';

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
      description:
        '目标块 ID，即 Context 文档树（children）中目标块节点的 id 属性值',
      type: 'string',
    },
    content: {
      description:
        '定位用的原文片段（纯文本，须与文档逐字一致）：在目标块的纯文本中匹配此内容以确定操作范围，先精确匹配、再模糊匹配，取首次出现的位置；多个片段之间以空行分隔时，各片段依次在目标块之后的兄弟块中匹配，共同构成一个连续范围（此时取第一段所在块的 id 作为 blockId）；为空字符串时不做匹配，插入点为目标块的开头',
      type: 'string',
    },
    generate: {
      description:
        '待插入的新内容（Markdown 语法）：插入在定位范围的末尾之后（content 为空字符串时插入在目标块开头），前后不会自动补空格或换行，所需的空格或换行符须按需自行写入',
      type: 'string',
    },
  },
  required: ['blockId', 'content', 'generate'],
  additionalProperties: false,
  type: 'object',
});

export const generateTool = tool({
  description:
    '生成工具（generate）：在文档中一段文本范围的末尾插入新内容。blockId 选定目标块，content 在该块内定位范围（为空字符串时插入在目标块开头），generate 为要插入的新内容（Markdown）',
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
  const range =
    aiCommentToRange(editor, { ...aiGenerate, comment: '' }) ??
    getBlockStartRange(editor, aiGenerate.blockId);

  if (!range) return console.warn('No range found for AI generate');

  withAIBatch(
    editor,
    () => {
      applyGenerateSuggestion(editor, range, aiGenerate.generate);
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
