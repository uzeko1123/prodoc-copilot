import type { ToolUIPart } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat, ChatMessage } from '../use-agent';
import { applyCommentTool, type CommentTool } from './tool-comment';
import { applyEditTool, type EditTool } from './tool-edit';
import { applyGenerateTool, type GenerateTool } from './tool-generate';

const TOOL_PART_TYPE_PREFIX = 'tool-';

export type Tools = CommentTool & EditTool & GenerateTool;

const tools = {
  comment: applyCommentTool,
  edit: applyEditTool,
  generate: applyGenerateTool,
};

/** Runtime names of the registered tools. */
export const TOOL_NAMES = Object.keys(tools) as (keyof Tools)[];

export function applyTools(
  editor: PlateEditor,
  chat: Chat,
  message: ChatMessage,
) {
  for (const part of message.parts) {
    if (!part.type.startsWith(TOOL_PART_TYPE_PREFIX)) continue;

    const toolName = part.type.slice(TOOL_PART_TYPE_PREFIX.length);
    // The registry lookup cannot stay type-correlated (each applier accepts
    // only its own tool's part), so cast once to the union applier.
    const applyTool = tools[toolName as keyof Tools] as (
      editor: PlateEditor,
      chat: Chat,
      part: ToolUIPart<Tools>,
    ) => void;

    applyTool(editor, chat, part as ToolUIPart<Tools>);
  }
}
