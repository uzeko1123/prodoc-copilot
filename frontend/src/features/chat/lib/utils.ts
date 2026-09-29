import type { LanguageModelUsage, ToolUIPart } from 'ai';
import { NodeApi, RangeApi, type TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Tools } from '../agent/tools';
import type { ChatMode } from '../components/editor/use-agent';

const chatModeNames: Record<ChatMode, string> = {
  chat: '对话模式',
  comment: '评论模式',
  suggestion: '修订模式',
  auto: '自动模式',
};

export function getChatModeName(chatMode: ChatMode) {
  return (
    chatModeNames[chatMode] ??
    chatMode.charAt(0).toUpperCase() + chatMode.slice(1)
  );
}

export function getSelectionText(
  editor: PlateEditor,
  selection?: TRange | null,
) {
  if (!selection || RangeApi.isCollapsed(selection)) return '';
  return editor.api
    .fragment(selection)
    .map((node) => NodeApi.string(node).trim())
    .filter((text) => text !== '')
    .join('\n');
}

export function getParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const toolNames: Record<string, string> = {
  comment: '评论工具',
  edit: '编辑工具',
  generate: '生成工具',
};

export function getToolPartName(toolPart: ToolUIPart<Tools>) {
  const toolName = toolPart.type.slice('tool-'.length);
  return (
    toolNames[toolName] ?? toolName.charAt(0).toUpperCase() + toolName.slice(1)
  );
}

const tokenFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
});

export function formatTokens(count: number) {
  return tokenFormatter.format(count);
}

function sumTokens(tokens1: number | undefined, tokens2: number | undefined) {
  if (!tokens1 && !tokens2) return;
  return (tokens1 ?? 0) + (tokens2 ?? 0);
}

export function sumUsage(
  usage1: LanguageModelUsage | undefined,
  usage2: LanguageModelUsage | undefined,
): LanguageModelUsage | undefined {
  if (!usage1 && !usage2) return;
  return {
    inputTokens: sumTokens(usage1?.inputTokens, usage2?.inputTokens),
    inputTokenDetails: {
      noCacheTokens: sumTokens(
        usage1?.inputTokenDetails?.noCacheTokens,
        usage2?.inputTokenDetails?.noCacheTokens,
      ),
      cacheReadTokens: sumTokens(
        usage1?.inputTokenDetails?.cacheReadTokens,
        usage2?.inputTokenDetails?.cacheReadTokens,
      ),
      cacheWriteTokens: sumTokens(
        usage1?.inputTokenDetails?.cacheWriteTokens,
        usage2?.inputTokenDetails?.cacheWriteTokens,
      ),
    },
    outputTokens: sumTokens(usage1?.outputTokens, usage2?.outputTokens),
    outputTokenDetails: {
      textTokens: sumTokens(
        usage1?.outputTokenDetails?.textTokens,
        usage2?.outputTokenDetails?.textTokens,
      ),
      reasoningTokens: sumTokens(
        usage1?.outputTokenDetails?.reasoningTokens,
        usage2?.outputTokenDetails?.reasoningTokens,
      ),
    },
    totalTokens: sumTokens(usage1?.totalTokens, usage2?.totalTokens),
  };
}
