import type { ChatMode } from '../use-agent';
import chatInstructions from './prompts/instructions-chat.md?raw';
import commentInstructions from './prompts/instructions-comment.md?raw';
import suggestionInstructions from './prompts/instructions-suggestion.md?raw';
import autoInstructions from './prompts/instructions-auto.md?raw';

export function getInstructions(chatMode: ChatMode) {
  switch (chatMode) {
    case 'chat':
      return chatInstructions;
    case 'comment':
      return commentInstructions;
    case 'suggestion':
      return suggestionInstructions;
    default:
      return autoInstructions;
  }
}
