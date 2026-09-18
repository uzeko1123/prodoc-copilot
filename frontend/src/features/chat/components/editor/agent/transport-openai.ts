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
import type * as React from 'react';
import type { ChatMessage } from '../use-agent';
import { tools } from './tools';

const BASE_URL = '';

const API_KEY = '';

const MODEL = '';

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

/** Editor context submitted by `aiChat.submit`. */
type Ctx = {
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
        ctx: Ctx;
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
        messages: await convertToModelMessages(chatMessages, {
          ignoreIncompleteToolCalls: true,
          tools,
        }),
        tools,
        toolChoice:
          ctx.toolName && ctx.toolName in tools
            ? {
                type: 'tool',
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
