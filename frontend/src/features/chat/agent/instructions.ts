import type { ChatMode } from '../components/editor/use-agent';
import autoInstructions from './prompts/instructions-auto.md?raw';
import chatInstructions from './prompts/instructions-chat.md?raw';
import commentInstructions from './prompts/instructions-comment.md?raw';
import suggestionInstructions from './prompts/instructions-suggestion.md?raw';

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
