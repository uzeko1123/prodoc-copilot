import { getSelectionText, sumUsage } from '@/features/chat/lib/utils';
import { useChatStore } from '@/features/chat/stores';
import { useCommentStore } from '@/features/comment/stores';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  DefaultChatTransport,
  streamText,
  toUIMessageStream,
  type LanguageModelUsage,
  type ToolChoice,
  type ToolSet,
} from 'ai';
import type { TRange, Value } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { ChatMessage } from '../components/editor/use-agent';
import { getInstructions } from './instructions';
import { getModel } from './model-openai';
import { getChatModeTools, tools } from './tools';

type Context = {
  children: Value;
  selection: TRange | null;
  toolName: string | null;
};

export function createAgentTransport(editor: PlateEditor) {
  let context: Context | null = null;
  let usage: LanguageModelUsage | undefined = undefined;

  return new DefaultChatTransport({
    fetch: (async (_input, init) => {
      const { ctx, messages } = JSON.parse(init?.body as string) as {
        ctx?: Context;
        messages: ChatMessage[];
      };
      if (ctx) context = ctx;

      const lastMessage = messages.at(-1);
      if (lastMessage) {
        if (lastMessage.role === 'user') {
          usage = undefined;
          useChatStore.getState().upsertChatMessage({
            ...lastMessage,
            metadata: {
              ...lastMessage.metadata,
              selectionText: getSelectionText(editor, context?.selection),
            },
          });
        } else {
          useChatStore.getState().upsertChatMessage(lastMessage);
        }
      }
      const chatMessages = useChatStore.getState().chatMessages;

      const chatMode = useChatStore.getState().chatMode;
      const instructions = getInstructions(chatMode);
      const availableTools = getChatModeTools(chatMode);

      const result = streamText({
        model: getModel(),
        instructions,
        messages: await convertToModelMessages(
          createChatMessagesWithCtx(chatMessages, context),
          { tools, ignoreIncompleteToolCalls: true },
        ),
        tools: availableTools,
        toolChoice:
          ctx?.toolName && ctx.toolName in availableTools
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
          messageMetadata: ({ part }) => {
            if (part.type !== 'finish') return;
            usage = sumUsage(usage, part.totalUsage);
            return { usage };
          },
        }),
      });
    }) as typeof fetch,
  });
}

function createChatMessagesWithCtx(
  chatMessages: ChatMessage[],
  context: Context | null,
) {
  const discussions = useCommentStore.getState().discussions;

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
        text: `<Context>${JSON.stringify({
          children: context?.children,
          selection: context?.selection,
          discussions,
        })}</Context>`,
      },
    ],
  });
}
