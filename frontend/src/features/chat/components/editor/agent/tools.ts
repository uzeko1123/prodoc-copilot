import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin } from '@platejs/ai/react';
import { getTransientSuggestionKey } from '@platejs/suggestion';
import type { ToolSet } from 'ai';
import type { PlateEditor } from 'platejs/react';
import type { Chat, ChatMessage, ChatMode } from '../use-agent';
import {
  applyCommentTool,
  cleanupCommentTool,
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

/**
 * Runs once an assistant message finishes: commits streamed AI suggestions as
 * persistent reviewable suggestions, drops orphaned streamed comments, and
 * closes the AI menu without undoing anything.
 */
export function finalizeAITools(editor: PlateEditor) {
  withAIBatch(editor, () => {
    editor.tf.unsetNodes([getTransientSuggestionKey()], {
      at: [],
      mode: 'all',
      match: (node) => !!node[getTransientSuggestionKey()],
    });
  });

  cleanupCommentTool(editor);

  if (editor.getOption(AIChatPlugin, 'toolName')) {
    editor.getApi(AIChatPlugin).aiChat.hide({ undo: false });
  }
}

export function resetTools() {
  resetCommentTool();
  resetEditTool();
  resetGenerateTool();
}
