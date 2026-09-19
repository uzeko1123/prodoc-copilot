'use client';

import { useChatStore } from '@/features/chat/stores';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { AIChatPlugin } from '@platejs/ai/react';
import type { UIMessage } from 'ai';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import { applyTools, type Tools } from './agent/tools';
// import { createAgentTransport } from './agent/transport';
import { createAgentTransport } from './agent/transport-openai';

type MetaData = { selectionText?: string };

export type ChatMessage = UIMessage<MetaData, Record<never, never>, Tools>;

export type Chat = UseChatHelpers<ChatMessage>;

export const useAgent = () => {
  const editor = useEditorRef();
  const chat = useChat<ChatMessage>({
    transport: createAgentTransport(editor),
  });

  const finishedChatMessageIdRef = React.useRef<string | null>(null);
  const upsertChatMessage = useChatStore((state) => state.upsertChatMessage);

  React.useEffect(() => {
    const lastChatMessage = chat.messages.at(-1);
    if (lastChatMessage?.role !== 'assistant') return;

    applyTools(editor, chat, lastChatMessage);
    upsertChatMessage(lastChatMessage);

    if (chat.status === 'streaming' || chat.status === 'submitted') return;
    if (finishedChatMessageIdRef.current === lastChatMessage.id) return;

    finishedChatMessageIdRef.current = lastChatMessage.id;
    editor.getApi(AIChatPlugin).aiChat.stop();
  }, [editor, chat, upsertChatMessage]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.setOption(AIChatPlugin, 'chat', chat as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.messages, chat.error]);

  return chat;
};
