'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';
import { useChatStore } from '../../stores';
import { applyComment, finishAIComments } from './tool-comment';
import { applyEditChunk } from './tool-edit';
import { applyGenerateChunk } from './tool-generate';
import { type Chat, type ChatMessage } from './use-chat';

//#region Agent tool dispatch

const archiveEditorMessages = (messages: ChatMessage[] | undefined) => {
  if (!messages || messages.length === 0) return;

  const { appendEditorChatMessages, editorChatMessages } =
    useChatStore.getState();
  const lastArchivedId = editorChatMessages.at(-1)?.id;
  const lastArchivedIndex = lastArchivedId
    ? messages.findIndex((message) => message.id === lastArchivedId) + 1
    : 0;

  const newMessages = messages.slice(lastArchivedIndex).map((message) => ({
    ...message,
    // The selection text is re-derived on each request; don't persist it
    parts: message.parts.filter((part) => part.type !== 'data-selectionText'),
  }));

  if (newMessages.length > 0) appendEditorChatMessages(newMessages);
};

/**
 * Consume the agent's streamed tool calls (`tool-generate` / `tool-edit` /
 * `tool-comment` parts): diff each tool's streamed input per toolCallId and
 * hand the chunk to the tool's apply function (see tool-generate / tool-edit /
 * tool-comment). Mirrors `useChatChunk`'s text diffing.
 */
export const useEditorAgentTools = () => {
  const editor = useEditorRef();
  // The chat option is registered untyped by use-chat; recover our typed view
  const chat = usePluginOption(AIChatPlugin, 'chat') as unknown as Chat;

  const isLoading = chat.status === 'streaming' || chat.status === 'submitted';
  const lastAssistantMessage = chat.messages?.findLast(
    (message) => message.role === 'assistant',
  );

  const insertedLengthRef = React.useRef<Record<string, number>>({});
  const appliedCommentsRef = React.useRef<Set<string>>(new Set());
  const finishedIdsRef = React.useRef<Set<string>>(new Set());
  const prevIsLoadingRef = React.useRef(false);

  React.useEffect(() => {
    const message = lastAssistantMessage;
    if (!message) return;

    for (const part of message.parts) {
      if (part.type === 'tool-generate' || part.type === 'tool-edit') {
        if (
          part.state !== 'input-streaming' &&
          part.state !== 'input-available'
        ) {
          continue;
        }

        // input-streaming parts hold partial JSON whose `content` may not be
        // readable yet — skip until the string parses
        const content = part.input?.content;
        if (typeof content !== 'string') continue;

        const inserted = insertedLengthRef.current[part.toolCallId] ?? 0;
        const chunk = content.slice(inserted);
        if (!chunk) continue;
        insertedLengthRef.current[part.toolCallId] = content.length;

        if (part.type === 'tool-generate') {
          applyGenerateChunk(editor, {
            chunk,
            isFirst: inserted === 0,
          });
        } else {
          applyEditChunk(editor, {
            isFirst: inserted === 0,
            text: content,
          });
        }
      }

      if (part.type === 'tool-comment' && part.state === 'input-available') {
        if (appliedCommentsRef.current.has(part.toolCallId)) continue;
        appliedCommentsRef.current.add(part.toolCallId);

        applyComment(editor, part.input);
      }
    }
  }, [editor, lastAssistantMessage]);

  // On finish: settle comment marks, report tool outputs locally (no automatic
  // re-send while the mock route is active) and archive the conversation
  React.useEffect(() => {
    const finished =
      prevIsLoadingRef.current && !isLoading && chat.status === 'ready';
    prevIsLoadingRef.current = isLoading;

    if (!finished || !lastAssistantMessage) return;
    if (finishedIdsRef.current.has(lastAssistantMessage.id)) return;
    finishedIdsRef.current.add(lastAssistantMessage.id);

    finishAIComments(editor);

    for (const part of lastAssistantMessage.parts) {
      if (
        (part.type === 'tool-generate' ||
          part.type === 'tool-edit' ||
          part.type === 'tool-comment') &&
        part.state !== 'output-available'
      ) {
        chat.addToolOutput({
          output: { success: true },
          tool: part.type.slice('tool-'.length) as
            'comment' | 'edit' | 'generate',
          toolCallId: part.toolCallId,
        });
      }
    }

    archiveEditorMessages(chat.messages);
  }, [chat, editor, isLoading, lastAssistantMessage]);
};

//#endregion
