import type { ToolSet } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type {
  Chat,
  ChatMessage,
  ChatMode,
} from '../components/editor/use-agent';
import {
  applyCommentTool,
  commentTool,
  resetCommentTool,
  type CommentTool,
} from './tool-comment';
import {
  applyEditTool,
  editTool,
  resetEditTool,
  type EditTool,
} from './tool-edit';
import {
  applyGenerateTool,
  generateTool,
  resetGenerateTool,
  type GenerateTool,
} from './tool-generate';

export type Tools = CommentTool & EditTool & GenerateTool;

export const tools = {
  comment: commentTool,
  edit: editTool,
  generate: generateTool,
} as ToolSet;

export function getChatModeTools(chatMode: ChatMode) {
  switch (chatMode) {
    case 'chat':
      return {} as ToolSet;
    case 'comment':
      return { comment: commentTool } as ToolSet;
    case 'suggestion':
      return { edit: editTool, generate: generateTool } as ToolSet;
    default:
      return tools;
  }
}

let currentMessageId: string | undefined;

export function applyTools(
  editor: PlateEditor,
  chat: Chat,
  message: ChatMessage,
) {
  if (currentMessageId !== message.id) {
    currentMessageId = message.id;
    resetCommentTool();
    resetEditTool();
    resetGenerateTool();
  }

  for (const part of message.parts) {
    switch (part.type) {
      case 'tool-comment':
        applyCommentTool(editor, chat, part);
        break;
      case 'tool-edit':
        applyEditTool(editor, chat, part);
        break;
      case 'tool-generate':
        applyGenerateTool(editor, chat, part);
        break;
    }
  }
}
