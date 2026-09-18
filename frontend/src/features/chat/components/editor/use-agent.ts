'use client';

/* eslint-disable react-hooks/refs -- Fake stream abort control is imperative transport state. */
import { useChatStore } from '@/features/chat/stores';
import { useChat as useBaseChat, type UseChatHelpers } from '@ai-sdk/react';
import { AIChatPlugin } from '@platejs/ai/react';
import { type UIMessage } from 'ai';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';
import { aiChatPlugin } from '../editor/plugins/ai-kit';
import { applyTools, type Tools } from './agent/tools';
import { createAgentTransport } from './agent/transport';

export type ToolName = 'comment' | 'edit' | 'generate';

export type TComment = {
  comment: {
    blockId: string;
    comment: string;
    content: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type TTableCellUpdate = {
  cellUpdate: {
    content: string;
    id: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type MessageDataPart = {
  toolName: ToolName;
  comment?: TComment;
  table?: TTableCellUpdate;
};

export type Chat = UseChatHelpers<ChatMessage>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ChatMessage = UIMessage<{}, MessageDataPart, Tools>;

export const useAgent = () => {
  const editor = useEditorRef();
  const options = usePluginOption(aiChatPlugin, 'chatOptions');

  // remove when you implement the route /api/ai/command
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const _abortFakeStream = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const transport = React.useMemo(
    () =>
      createAgentTransport({
        api: options.api || '/api/ai/command',
        abortControllerRef,
        editor,
      }),
    [editor, options.api],
  );

  const baseChat = useBaseChat<ChatMessage>({
    id: 'editor',
    transport,
    ...options,
  });

  const chat = React.useMemo(
    () => ({
      ...baseChat,
      _abortFakeStream,
    }),
    [baseChat, _abortFakeStream],
  );

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
  }, [chat, editor, upsertChatMessage]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.setOption(AIChatPlugin, 'chat', chat as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.messages, chat.error, _abortFakeStream]);

  return chat;
};
