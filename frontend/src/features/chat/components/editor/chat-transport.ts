'use client';

import { fakeStreamText } from '@/data/chat';
import { serializeMd } from '@platejs/markdown';
import { DefaultChatTransport } from 'ai';
import { KEYS, type TNode, type TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import * as React from 'react';
import { aiChatPlugin } from './plugins/ai-kit-new';
import { commentToolDefinition, type CommentToolInput } from './tool-comment';
import { editToolDefinition, type EditToolInput } from './tool-edit';
import {
  generateToolDefinition,
  type GenerateToolInput,
} from './tool-generate';
import type { ChatMessage, ToolName } from './use-chat';

//#region Agent protocol types

export type AgentToolOutput = { success: boolean };

/** Tool invocations carried on assistant messages (UIMessage third generic). */
export type AgentTools = {
  comment: { input: CommentToolInput; output: AgentToolOutput | undefined };
  edit: { input: EditToolInput; output: AgentToolOutput | undefined };
  generate: { input: GenerateToolInput; output: AgentToolOutput | undefined };
};

//#endregion

//#region Request normalization

/** Tool contract sent to the backend agent (JSON-schema form). */
export const TOOL_DEFINITIONS = [
  generateToolDefinition,
  editToolDefinition,
  commentToolDefinition,
] as const;

export type AgentRequestBody = {
  ctx?: {
    children: TNode[];
    selection?: TRange | null;
    toolName?: ToolName | null;
  };
  id?: string;
  messages?: ChatMessage[];
  messageId?: string;
  tools?: typeof TOOL_DEFINITIONS;
  trigger?: string;
} & Record<string, unknown>;

/**
 * Restructure the outgoing request body into the agent protocol:
 * - `ctx` stays at the body level (whole document + selection), never inside a
 *   message
 * - the last user message carries the `/command [input]` text plus the selected
 *   text as a `data-selectionText` part
 * - `tools` advertises the generate/edit/comment contract to the agent
 */
export const normalizeAgentRequestBody = (
  body: AgentRequestBody,
  editor: PlateEditor,
): AgentRequestBody => {
  const messages = body.messages ?? [];
  const selection = body.ctx?.selection ?? null;

  if (selection) {
    const lastUserMessage = messages.findLast(
      (message) => message.role === 'user',
    );

    if (
      lastUserMessage &&
      !lastUserMessage.parts.some((part) => part.type === 'data-selectionText')
    ) {
      lastUserMessage.parts.push({
        data: serializeMd(editor, {
          value: editor.api.fragment(selection),
        }),
        type: 'data-selectionText',
      });
    }
  }

  return {
    ...body,
    ctx: body.ctx ? { children: body.ctx.children, selection } : undefined,
    messages,
    tools: TOOL_DEFINITIONS,
  };
};

//#endregion

//#region Transport

export function createChatTransport({
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
    // Mock the API response. Remove it when you implement the route /api/ai/command
    fetch: (async (input, init) => {
      const bodyOptions = editor.getOptions(aiChatPlugin).chatOptions?.body;

      const initBody = JSON.parse(init?.body as string);

      const body = {
        ...initBody,
        ...bodyOptions,
      };

      const normalizedBody = normalizeAgentRequestBody(body, editor);

      const res = await fetch(input, {
        ...init,
        body: JSON.stringify(normalizedBody),
      });

      if (!res.ok) {
        let sample: 'comment' | 'markdown' | 'mdx' | 'table' | null = null;

        try {
          const body = JSON.parse(init?.body as string);
          const content = body.messages
            .at(-1)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .parts.find((p: any) => p.type === 'text')?.text;

          if (content.includes('generateMarkdownSample')) {
            sample = 'markdown';
          } else if (content.includes('generateMdxSample')) {
            sample = 'mdx';
          } else if (content.includes('comment')) {
            sample = 'comment';
          }

          // Detect table editing by checking if multiple table cells are selected
          // Single cell selection should use normal edit flow, only multi-cell uses table tool
          if (!sample) {
            // First check: selectedCells from TablePlugin (cell selection mode)
            const selectedCells =
              editor.getOption({ key: KEYS.table }, 'selectedCells') || [];

            if (selectedCells.length > 1) {
              sample = 'table';
            }
            // Second check: selection range spans multiple cells
            else if (body.ctx?.children && body.ctx?.selection) {
              const { selection, children } = body.ctx;
              const anchorPath = selection.anchor?.path;
              const focusPath = selection.focus?.path;

              if (anchorPath && anchorPath.length >= 3) {
                const rootIndex = anchorPath[0];
                const rootNode = children[rootIndex];

                if (rootNode?.type === 'table') {
                  // Cell path is at index 2 (table -> row -> cell)
                  const anchorCellPath = anchorPath.slice(0, 3).join(',');
                  const focusCellPath = focusPath?.slice(0, 3).join(',');

                  // Only use table mock if anchor and focus are in different cells
                  if (focusCellPath && anchorCellPath !== focusCellPath) {
                    sample = 'table';
                  }
                }
              }
            }
          }
        } catch {
          sample = null;
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText({
          editor,
          sample,
          signal: abortController.signal,
        });

        const response = new Response(stream, {
          headers: {
            Connection: 'keep-alive',
            'Content-Type': 'text/plain',
          },
        });

        return response;
      }

      return res;
    }) as typeof fetch,
  });
}

//#endregion
