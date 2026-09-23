import { getSelectionText } from '@/features/chat/lib/utils';
import { useChatStore } from '@/features/chat/stores';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  DefaultChatTransport,
  streamText,
  toUIMessageStream,
  type ToolChoice,
  type ToolSet,
} from 'ai';
import type { TRange, Value } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { ChatMessage } from '../components/editor/use-agent';
import { getInstructions } from './instructions';
import { model } from './model-openai';
import { getChatModeTools, tools } from './tools';

type Context = {
  children: Value;
  selection: TRange | null;
  toolName: string | null;
};

export function createAgentTransport(editor: PlateEditor) {
  return new DefaultChatTransport({
    fetch: (async (_input, init) => {
      const { ctx, messages } = JSON.parse(init?.body as string) as {
        ctx: Context;
        messages: ChatMessage[];
      };

      const lastMessage = messages.at(-1);
      if (lastMessage?.role === 'user') {
        useChatStore.getState().upsertChatMessage({
          ...lastMessage,
          metadata: {
            ...lastMessage.metadata,
            selectionText: getSelectionText(editor, ctx.selection),
          },
        });
      }
      const chatMessages = useChatStore.getState().chatMessages;

      const chatMode = useChatStore.getState().chatMode;
      const instructions = getInstructions(chatMode);
      const availableTools = getChatModeTools(chatMode);

      const result = streamText({
        model,
        instructions,
        messages: await convertToModelMessages(
          createChatMessagesWithCtx(chatMessages, ctx),
          { tools, ignoreIncompleteToolCalls: true },
        ),
        tools: availableTools,
        toolChoice:
          ctx.toolName && ctx.toolName in availableTools
            ? ({
                type: 'tool',
                toolName: ctx.toolName,
              } as ToolChoice<ToolSet>)
            : undefined,
        abortSignal: init?.signal ?? undefined,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({
          stream: result.stream,
          tools,
          messageMetadata: ({ part }) =>
            part.type === 'finish' ? { usage: part.totalUsage } : undefined,
        }),
      });
    }) as typeof fetch,
  });
}

function createChatMessagesWithCtx(chatMessages: ChatMessage[], ctx: Context) {
  const lastUserChatMessageIndex = chatMessages.findLastIndex(
    (message) => message.role === 'user',
  );
  if (lastUserChatMessageIndex === -1) return chatMessages;
  const lastUserChatMessage = chatMessages[lastUserChatMessageIndex];

  return chatMessages.with(lastUserChatMessageIndex, {
    ...lastUserChatMessage,
    parts: [
      ...lastUserChatMessage.parts,
      {
        type: 'text',
        text: `<Context>${JSON.stringify({ children: ctx.children, selection: ctx.selection })}</Context>`,
      },
    ],
  });
}
