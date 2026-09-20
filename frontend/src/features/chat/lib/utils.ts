import type { ToolUIPart } from 'ai';
import { NodeApi, type TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Tools } from '../components/editor/agent/tools';
import type { ChatMode } from '../components/editor/use-agent';

export function getChatModeName(chatMode: ChatMode) {
  return chatMode.charAt(0).toUpperCase() + chatMode.slice(1);
}

export function getSelectionText(
  editor: PlateEditor,
  selection?: TRange | null,
) {
  try {
    return editor.api
      .fragment(selection)
      .map((node) => NodeApi.string(node).trim())
      .filter((text) => text !== '')
      .join('\n');
  } catch {
    return '';
  }
}
export function getParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function getToolPartName(toolPart: ToolUIPart<Tools>) {
  const toolName = toolPart.type.slice('tool-'.length);
  return toolName.charAt(0).toUpperCase() + toolName.slice(1);
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
});

export function formatTokens(count: number) {
  return compactFormatter.format(count);
}
