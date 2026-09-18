import { mockApiResponse } from '@/mock/chat';
import { DefaultChatTransport } from 'ai';
import type { PlateEditor } from 'platejs/react';
import * as React from 'react';
import { aiChatPlugin } from '../plugins/ai-kit';

export function createAgentTransport({
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

      const res = await fetch(input, {
        ...init,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return mockApiResponse(editor, init, abortControllerRef);
      }

      return res;
    }) as typeof fetch,
  });
}
