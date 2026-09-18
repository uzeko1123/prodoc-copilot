'use client';

/* eslint-disable react-hooks/refs -- Fake stream abort control is imperative transport state. */
import { discussionPlugin } from '@/features/comment/components/editor/plugins/discussion-kit';
import { useChat as useBaseChat, type UseChatHelpers } from '@ai-sdk/react';
import { BaseAIPlugin, withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  aiCommentToRange,
  applyAISuggestions,
  applyTableCellSuggestion,
  getInsertPreviewStart,
  streamInsertChunk,
  useChatChunk,
} from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';
import {
  ElementApi,
  getPluginType,
  KEYS,
  nanoid,
  NodeApi,
  PathApi,
  TextApi,
  type TNode,
} from 'platejs';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';
import { createChatTransport, type AgentTools } from './chat-transport';
import { aiChatPlugin } from './plugins/ai-kit-new';

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
  selectionText?: string;
  toolName: ToolName;
  comment?: TComment;
  table?: TTableCellUpdate;
};

export type Chat = UseChatHelpers<ChatMessage>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ChatMessage = UIMessage<{}, MessageDataPart, AgentTools>;

export const useChat = () => {
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
      createChatTransport({
        api: options.api || '/api/ai/command',
        abortControllerRef,
        editor,
      }),
    [editor, options.api],
  );

  const baseChat = useBaseChat<ChatMessage>({
    id: 'editor',
    transport,
    onData(data) {
      if (data.type === 'data-toolName') {
        editor.setOption(AIChatPlugin, 'toolName', data.data as ToolName);
      }

      if (data.type === 'data-table' && data.data) {
        const tableData = data.data as TTableCellUpdate;

        if (tableData.status === 'finished') {
          const chatSelection = editor.getOption(AIChatPlugin, 'chatSelection');

          if (!chatSelection) return;

          editor.tf.setSelection(chatSelection);

          return;
        }

        const cellUpdate = tableData.cellUpdate!;

        withAIBatch(editor, () => {
          applyTableCellSuggestion(editor, cellUpdate);
        });
      }

      if (data.type === 'data-comment' && data.data) {
        const commentData = data.data as TComment;

        if (commentData.status === 'finished') {
          editor.getApi(BlockSelectionPlugin).blockSelection.deselect();

          return;
        }

        const aiComment = commentData.comment!;
        const range = aiCommentToRange(editor, aiComment);

        if (!range) return console.warn('No range found for AI comment');

        const discussions =
          editor.getOption(discussionPlugin, 'discussions') || [];

        // Generate a new discussion ID
        const discussionId = nanoid();

        // Create a new comment
        const newComment = {
          id: nanoid(),
          contentRich: [{ children: [{ text: aiComment.comment }], type: 'p' }],
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: editor.getOption(discussionPlugin, 'currentUserId'),
        };

        // Create a new discussion
        const newDiscussion = {
          id: discussionId,
          comments: [newComment],
          createdAt: new Date(),
          documentContent: deserializeMd(editor, aiComment.content)
            .map((node: TNode) => NodeApi.string(node))
            .join('\n'),
          isResolved: false,
          userId: editor.getOption(discussionPlugin, 'currentUserId'),
        };

        // Update discussions
        const updatedDiscussions = [...discussions, newDiscussion];
        editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);

        // Apply comment marks to the editor
        editor.tf.withMerging(() => {
          editor.tf.setNodes(
            {
              [getCommentKey(newDiscussion.id)]: true,
              [getTransientCommentKey()]: true,
              [KEYS.comment]: true,
            },
            {
              at: range,
              match: TextApi.isText,
              split: true,
            },
          );
        });
      }
    },

    ...options,
  });

  const chat = {
    ...baseChat,
    _abortFakeStream,
  };

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.setOption(AIChatPlugin, 'chat', chat as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.messages, chat.error, _abortFakeStream]);

  return chat;
};

/**
 * Result handling for the legacy text-part stream: apply each streamed chunk
 * to the editor (insert preview in `insert` mode, inline suggestions for
 * `edit`). Agent responses stream editor writes as tool parts instead — any
 * text part in the same message must not go through this path too.
 */
export const useEditorChatChunk = () => {
  const editor = useEditorRef();
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const toolName = usePluginOption(AIChatPlugin, 'toolName');

  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text: content }) => {
      // Agent responses stream editor writes as tool parts; any text part
      // in the same message must not go through this legacy path too
      const lastAssistantMessage = editor
        .getOption(AIChatPlugin, 'chat')
        .messages?.findLast((message) => message.role === 'assistant');

      if (
        lastAssistantMessage?.parts.some((part) =>
          part.type.startsWith('tool-'),
        )
      ) {
        return;
      }

      if (isFirst && mode === 'insert') {
        const { startBlock, startInEmptyParagraph } =
          getInsertPreviewStart(editor);

        editor.getTransforms(BaseAIPlugin).ai.beginPreview({
          originalBlocks:
            startInEmptyParagraph &&
            startBlock &&
            ElementApi.isElement(startBlock)
              ? [cloneDeep(startBlock)]
              : [],
        });

        editor.tf.withoutSaving(() => {
          editor.tf.insertNodes(
            {
              children: [{ text: '' }],
              type: getPluginType(editor, KEYS.aiChat),
            },
            {
              at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
            },
          );
        });
        editor.setOption(AIChatPlugin, 'streaming', true);
      }

      if (mode === 'insert' && nodes.length > 0) {
        editor.tf.withoutSaving(() => {
          if (!editor.getOption(AIChatPlugin, 'streaming')) return;

          editor.tf.withScrolling(() => {
            streamInsertChunk(editor, chunk, {
              textProps: {
                [getPluginType(editor, KEYS.ai)]: true,
              },
            });
          });
        });
      }

      if (toolName === 'edit' && mode === 'chat') {
        withAIBatch(
          editor,
          () => {
            applyAISuggestions(editor, content);
          },
          {
            split: isFirst,
          },
        );
      }
    },
    onFinish: () => {
      editor.getApi(AIChatPlugin).aiChat.stop();
    },
  });
};
