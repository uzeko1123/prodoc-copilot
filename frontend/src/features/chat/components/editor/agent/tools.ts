import type { PlateEditor } from 'platejs/react';
import type { Chat, ChatMessage } from '../use-agent';
import {
  applyCommentTool,
  commentTool,
  type CommentTool,
} from './tool-comment';
import { applyEditTool, editTool, type EditTool } from './tool-edit';
import {
  applyGenerateTool,
  generateTool,
  type GenerateTool,
} from './tool-generate';

export type Tools = CommentTool & EditTool & GenerateTool;

export const tools = {
  comment: commentTool,
  edit: editTool,
  generate: generateTool,
};

export function applyTools(
  editor: PlateEditor,
  chat: Chat,
  message: ChatMessage,
) {
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
