import type { ChatMode } from '../components/editor/use-agent';
import autoInstructions from './prompts/instructions-auto.md?raw';
import chatInstructions from './prompts/instructions-chat.md?raw';
import commentInstructions from './prompts/instructions-comment.md?raw';
import suggestionInstructions from './prompts/instructions-suggestion.md?raw';
import commandsSection from './prompts/shared/commands.md?raw';
import contextSection from './prompts/shared/context.md?raw';
import selectionSection from './prompts/shared/selection.md?raw';
import toolsSection from './prompts/shared/tools.md?raw';

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

const instructionsByMode: Record<ChatMode, string> = {
  auto: withSharedSections(autoInstructions),
  chat: withSharedSections(chatInstructions),
  comment: withSharedSections(commentInstructions),
  suggestion: withSharedSections(suggestionInstructions),
};

export function getInstructions(chatMode: ChatMode) {
  return instructionsByMode[chatMode] ?? instructionsByMode.auto;
}
