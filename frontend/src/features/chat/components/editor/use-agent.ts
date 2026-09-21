'use client';

import { useChatStore } from '@/features/chat/stores';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { AIChatPlugin } from '@platejs/ai/react';
import type { LanguageModelUsage, ToolUIPart, UIMessage } from 'ai';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import { applyTools, resetTools, type Tools } from '../../agent/tools';
import { createAgentTransport } from '../../agent/transport';

export const chatModes = ['chat', 'comment', 'suggestion', 'auto'];
export type ChatMode = (typeof chatModes)[number];

type MetaData = {
  selectionText?: string;
  usage?: LanguageModelUsage;
};

export type ChatMessage = UIMessage<MetaData, Record<never, never>, Tools>;

export type Chat = UseChatHelpers<ChatMessage>;

export const useAgent = () => {
  const editor = useEditorRef();
  const transport = React.useMemo(() => createAgentTransport(editor), [editor]);
  const chat = useChat<ChatMessage>({
    transport,
    // TODO
    // 每个模型 chunk 都同步驱动渲染级联（zustand 全列表 + Plate 反序列化），
    // 本地 streamText 密集 chunk 会触发嵌套更新上限。100ms => 最多 10 次/秒 UI 更新。
    throttle: 100,
    sendAutomaticallyWhen: ({ messages }) => {
      const lastPart = messages.at(-1)?.parts.at(-1);
      if (lastPart?.type.startsWith('tool-')) {
        const lastToolPart = lastPart as ToolUIPart<Tools>;
        return lastToolPart.state === 'output-available';
      }
      return false;
    },
  });

  const finishedChatMessageIdRef = React.useRef<string | null>(null);
  const upsertChatMessage = useChatStore((state) => state.upsertChatMessage);

  React.useEffect(() => {
    const lastChatMessage = chat.messages.at(-1);
    if (lastChatMessage?.role !== 'assistant') {
      resetTools();
      return;
    }

    applyTools(editor, chat, lastChatMessage);
    upsertChatMessage(lastChatMessage);

    if (chat.status === 'streaming' || chat.status === 'submitted') return;
    if (finishedChatMessageIdRef.current === lastChatMessage.id) return;
    finishedChatMessageIdRef.current = lastChatMessage.id;
    editor.getApi(AIChatPlugin).aiChat.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, chat.status, chat.messages, chat.error]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.setOption(AIChatPlugin, 'chat', chat as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.messages, chat.error]);

  return chat;
};
