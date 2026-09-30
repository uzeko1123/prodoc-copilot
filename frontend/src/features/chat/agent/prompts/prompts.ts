// @generated-by-ai

import type { ChatMode } from '../../components/editor/use-agent';
import autoInstructions from './instructions/instructions-auto.md?raw';
import chatInstructions from './instructions/instructions-chat.md?raw';
import commentInstructions from './instructions/instructions-comment.md?raw';
import suggestionInstructions from './instructions/instructions-suggestion.md?raw';
import commandsSection from './shared/commands.md?raw';
import contextSection from './shared/context.md?raw';
import selectionSection from './shared/selection.md?raw';
import toolsSection from './shared/tools.md?raw';
import commentToolDescriptions from './tools/comment.md?raw';
import editToolDescriptions from './tools/edit.md?raw';
import generateToolDescriptions from './tools/generate.md?raw';

// —— 系统提示词拼装 ——

const SHARED_MARKER = '<!-- shared-sections -->';

const sharedSections = [
  contextSection,
  toolsSection,
  commandsSection,
  selectionSection,
]
  .map((section) => section.trim())
  .join('\n\n');

function withSharedSections(instructions: string) {
  if (!instructions.includes(SHARED_MARKER)) {
    throw new Error(
      `AI 指令模板缺少 "${SHARED_MARKER}" 标记，无法注入共享段落`,
    );
  }
  return instructions.replace(SHARED_MARKER, sharedSections);
}

// —— 工具与 Schema 描述 ——

/**
 * 解析 prompts/tools/<toolName>.md：“## tool” 节为工具描述（description），
 * “## <schema 字段名>” 节为该字段的 Schema 描述（schema），节内容去首尾空白。
 * 键集合必须为 {tool} ∪ schemaFields——缺失、多余或内容为空均在模块加载期
 * 抛错（fail-fast）。
 */
function parseToolDescriptions<T extends string>(
  toolName: string,
  source: string,
  schemaFields: readonly T[],
): { description: string; schema: Record<T, string> } {
  const headings = Array.from(source.matchAll(/^## ([A-Za-z][\w-]*)[ \t]*$/gm));

  const parsed = new Map<string, string>();
  for (const [index, heading] of headings.entries()) {
    const start = heading.index! + heading[0].length;
    const end = headings[index + 1]?.index ?? source.length;
    parsed.set(heading[1]!, source.slice(start, end).trim());
  }

  const description = parsed.get('tool');
  if (!description) {
    throw new Error(
      `工具描述文件 prompts/tools/${toolName}.md 缺少 "## tool" 的工具描述`,
    );
  }

  for (const key of parsed.keys()) {
    if (key !== 'tool' && !schemaFields.includes(key as T)) {
      throw new Error(
        `工具描述文件 prompts/tools/${toolName}.md 含未定义的键 "${key}"`,
      );
    }
  }

  const schema = {} as Record<T, string>;
  for (const field of schemaFields) {
    const value = parsed.get(field);
    if (!value) {
      throw new Error(
        `工具描述文件 prompts/tools/${toolName}.md 缺少 "${field}" 的 Schema 描述`,
      );
    }
    schema[field] = value;
  }
  return { description, schema };
}

// —— 统一出口 ——

/** 系统提示词（已注入共享段落）与工具描述的统一取用入口 */
export const prompts = {
  instructions: {
    auto: withSharedSections(autoInstructions),
    chat: withSharedSections(chatInstructions),
    comment: withSharedSections(commentInstructions),
    suggestion: withSharedSections(suggestionInstructions),
  },
  tools: {
    comment: parseToolDescriptions('comment', commentToolDescriptions, [
      'blockId',
      'content',
      'comment',
    ]),
    edit: parseToolDescriptions('edit', editToolDescriptions, [
      'blockId',
      'content',
      'edit',
    ]),
    generate: parseToolDescriptions('generate', generateToolDescriptions, [
      'blockId',
      'content',
      'generate',
    ]),
  },
} satisfies {
  instructions: Record<ChatMode, string>;
  tools: Record<
    'comment' | 'edit' | 'generate',
    { description: string; schema: Record<string, string> }
  >;
};
