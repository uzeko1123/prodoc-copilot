import { useChatStore } from '@/features/chat/stores';
import { mockApiResponse } from '@/mock/chat';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  convertToModelMessages,
  DefaultChatTransport,
  streamText,
  type ModelMessage,
} from 'ai';
import { KEYS, NodeApi, type TNode, type TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type * as React from 'react';
import type { ChatMessage } from '../use-chat';
import { TOOL_NAMES } from './tools';
import { commentTool } from './tool-comment';
import { editTool } from './tool-edit';
import { generateTool } from './tool-generate';

const SYSTEM_PROMPT = `你是一个富文本文档编辑器中的 AI 助手。

## 输入约定
- 用户消息可能包含 <Selection> 块，其中是用户当前选中的文本。
- 用户消息中的 /command 前缀（如 /comment、/improveWriting、/continueWrite、/summarize）只是操作意图的提示词，不代表要调用的工具。
- 请求体中的 context 字段包含完整文档结构（children）与当前选区（selection），供你定位内容。

## 工具
- generate：在光标下方插入新生成内容，适用于续写、总结等插入类操作。
- edit：重写用户选中的文本，返回完整替换文本。
- comment：对指定块添加评论。
工具的执行结果会以 { "success": boolean } 返回给你。

## 规则
- 当请求通过 tool_choice 强制指定工具时，必须调用该工具。
- 仅在无需操作编辑器内容时（如回答提问、解释概念），才直接回复纯文本。`;

/**
 * Intercepts the request assembled by `aiChat.submit` (after submit, before it
 * hits the network) and normalizes it into an ai-sdk standardized,
 * OpenAI-compatible chat completions request:
 *
 * 1. `context: {children, selection}` as a standalone body field (never in a Message);
 * 2. persists the user message (prompt + selectionText metadata) to the chat store;
 * 3. declares the three standardized tools (generate / edit / comment) and forces
 *    the tool requested via `ctx.toolName` through `tool_choice`;
 * 4. converts UIMessages to model messages and consumes the OpenAI SSE response
 *    natively via `streamText` + `@ai-sdk/openai-compatible`, returning a UI
 *    message stream that `useChat` can consume directly.
 *
 * Falls back to the existing `mockApiResponse` (which receives the ORIGINAL,
 * un-normalized request) whenever the API is unreachable, keeping the no-backend
 * demo flows working unchanged.
 */
export function createAgentChatTransport({
  api,
  abortControllerRef,
  editor,
}: {
  api: string;
  abortControllerRef: React.RefObject<AbortController | null>;
  editor: PlateEditor;
}) {
  return new DefaultChatTransport({
    api,
    fetch: (async (_input, init) => {
      // Read chatOptions.body imperatively to avoid a module cycle with ai-kit.
      const bodyOptions = (
        editor.getOptions({ key: KEYS.aiChat }).chatOptions as
          { body?: Record<string, unknown> } | undefined
      )?.body;

      const initBody = JSON.parse(init?.body as string) as {
        ctx?: {
          children?: TNode[];
          selection?: TRange | null;
          toolName?: string;
        };
        messages?: ChatMessage[];
      };
      const ctx = initBody.ctx;
      const messages = initBody.messages ?? [];
      const selectionText = getSelectionText(editor, ctx?.selection);

      // 1. Persist the user message (prompt + selectionText) before sending.
      const lastMessage = messages.at(-1);

      if (lastMessage?.role === 'user') {
        useChatStore.getState().appendChatMessage({
          ...lastMessage,
          metadata: { ...(lastMessage.metadata ?? {}), selectionText },
        });
      }

      // 2. Standard UIMessage -> ModelMessage conversion, keeping prior tool
      //    calls/results and dropping interrupted tool calls.
      let modelMessages = await convertToModelMessages(messages, {
        ignoreIncompleteToolCalls: true,
        tools: { comment: commentTool, edit: editTool, generate: generateTool },
      });

      if (selectionText) {
        modelMessages = appendSelectionBlock(modelMessages, selectionText);
      }

      // /command is only a prompt hint; ctx.toolName forces the real tool.
      const forcedToolName = TOOL_NAMES.find((name) => name === ctx?.toolName);
      let mockResponse: Response | null = null;

      // 3. OpenAI-compatible provider. Its custom fetch enriches the SDK-built
      //    standard body with the standalone `context` field and falls back to
      //    the existing mock when the API is unavailable.
      const provider = createOpenAICompatible({
        baseURL: api,
        fetch: async (_url, providerInit) => {
          const enriched = {
            ...JSON.parse(providerInit?.body as string),
            context: {
              children: ctx?.children ?? editor.children,
              selection: ctx?.selection ?? null,
            },
            ...bodyOptions,
          };

          const res = await fetch(api, {
            ...providerInit,
            body: JSON.stringify(enriched),
          });

          if (!res.ok || !res.body) {
            // The mock consumes the ORIGINAL (un-normalized) request.
            mockResponse = await mockApiResponse(
              editor,
              init,
              abortControllerRef,
            );
            // Synthesize an empty OpenAI SSE stream so streamText finishes
            // cleanly; the outer fetch returns the mock response instead.
            return new Response('data: [DONE]\n\n', {
              headers: { 'content-type': 'text/event-stream' },
              status: 200,
            });
          }

          return res;
        },
        name: 'prodoc-agent',
      });

      // 4. streamText drives the full protocol conversion: request
      //    serialization, OpenAI SSE parsing and UI message stream generation.
      const result = streamText({
        abortSignal: init?.signal ?? undefined,
        messages: modelMessages,
        model: provider.chatModel(
          (bodyOptions as { model?: string } | undefined)?.model ?? 'agent',
        ),
        system: SYSTEM_PROMPT,
        toolChoice: forcedToolName
          ? { toolName: forcedToolName, type: 'tool' }
          : undefined,
        tools: { comment: commentTool, edit: editTool, generate: generateTool },
      });

      await result.response;
      if (mockResponse) return mockResponse;
      return result.toUIMessageStreamResponse();
    }) as typeof fetch,
  });
}

function getSelectionText(
  editor: PlateEditor,
  selection?: TRange | null,
): string | undefined {
  try {
    if (!selection) return undefined;

    const text = editor.api
      .fragment(selection)
      .map((node) => NodeApi.string(node).trim())
      .filter((t) => t !== '')
      .join('\n');

    return text === '' ? undefined : text;
  } catch {
    return undefined;
  }
}

function appendSelectionBlock(
  messages: ModelMessage[],
  selectionText: string,
): ModelMessage[] {
  const block = `\n\n<Selection>\n${selectionText}\n</Selection>`;

  return messages.map((message, index) => {
    if (index !== messages.length - 1 || message.role !== 'user') {
      return message;
    }

    return {
      ...message,
      content:
        typeof message.content === 'string'
          ? message.content + block
          : [...message.content, { text: block, type: 'text' as const }],
    };
  });
}
