'use client';

import { CursorOverlayKit } from '@/components/shadcn/editor/plugins/cursor-overlay-kit';
import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { AIChatPlugin, AIPlugin } from '@platejs/ai/react';
import { AILoadingBar, AIMenu } from '../../ui/ai-menu';
import { AIAnchorElement, AILeaf } from '../../ui/ai-node';
import { useChat } from '../use-chat';

export const aiChatPlugin = AIChatPlugin.extend({
  options: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
    node: AIAnchorElement,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: useChat,
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPlugin,
];
