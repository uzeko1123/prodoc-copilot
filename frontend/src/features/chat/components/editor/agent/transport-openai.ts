import { getSelectionText } from '@/features/chat/lib/selection-text';
import { useChatStore } from '@/features/chat/stores';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  DefaultChatTransport,
  streamText,
  toUIMessageStream,
  type ChatTransport,
} from 'ai';
import type { TRange, Value } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import * as React from 'react';
import type { ChatMessage } from '../use-agent';
import { tools } from './tools';

const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

const API_KEY = '26073da819274bb983f3738aa40e7d41.KFJFuEAQU2nPmdxf';

const MODEL = 'glm-5.3';

const SYSTEM_PROMPT = `你是一个富文本文档编辑器中的 AI 助手。

## 输入约定
- 最新用户消息末尾附带 <Context> 块（JSON），含完整文档结构（children）与当前选区（selection），供你定位内容。
- 用户消息中的 /command 前缀（如 /comment、/improveWriting、/continueWrite、/summarize）只是操作意图的提示词，不代表要调用的工具。

## 工具
- generate：在光标下方插入新生成内容，适用于续写、总结等插入类操作。
- edit：重写用户选中的文本，返回完整替换文本。
- comment：对指定块添加评论。

## 规则
- 当请求通过 tool_choice 强制指定工具时，必须调用该工具。
- 仅在无需操作编辑器内容时（如回答提问、解释概念），才直接回复纯文本。`;

type Context = {
  children: Value;
  selection: TRange | null;
  toolName: string | null;
};

export function createAgentTransport({
  editor,
}: {
  api: string;
  abortControllerRef: React.RefObject<AbortController | null>;
  editor: PlateEditor;
}): ChatTransport<ChatMessage> {
  return new DefaultChatTransport({
    fetch: (async (_input, init) => {
      const { ctx, messages } = JSON.parse(init?.body as string) as {
        ctx: Context;
        messages: ChatMessage[];
      };

      const lastMessage = messages.at(-1);
      const selectionText = getSelectionText(editor, ctx.selection);
      if (lastMessage?.role === 'user') {
        lastMessage.metadata = { selectionText };
        useChatStore.getState().upsertChatMessage(lastMessage);
      }
      const chatMessages = useChatStore.getState().chatMessages;

      const result = streamText({
        model: createOpenAICompatible({
          baseURL: BASE_URL,
          name: '',
          apiKey: API_KEY,
        }).chatModel(MODEL),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(
          createChatMessagesWithCtx(chatMessages, ctx),
          { tools, ignoreIncompleteToolCalls: true },
        ),
        tools,
        toolChoice:
          ctx.toolName && ctx.toolName in tools
            ? {
                type: 'tool' as const,
                toolName: ctx.toolName as keyof typeof tools,
              }
            : undefined,
        abortSignal: init?.signal ?? undefined,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream, tools }),
      });
    }) as typeof fetch,
  });
}

function createChatMessagesWithCtx(chatMessages: ChatMessage[], ctx: Context) {
  const lastUserMessageIndex = chatMessages
    .map((message) => message.role === 'user')
    .lastIndexOf(true);
  if (lastUserMessageIndex === -1) return chatMessages;
  return chatMessages.map((message, index) =>
    index === lastUserMessageIndex
      ? {
          ...message,
          parts: [
            ...message.parts,
            {
              type: 'text' as const,
              text: `<Context>\n${JSON.stringify({ children: ctx.children, selection: ctx.selection })}\n</Context>`,
            },
          ],
        }
      : message,
  );
}
