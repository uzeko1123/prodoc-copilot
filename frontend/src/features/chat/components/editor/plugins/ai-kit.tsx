'use client';

import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { AIAnchorElement, AILeaf } from '@/components/shadcn/ui/ai-node';
import { CursorOverlayKit } from '@/features/editor/components/editor/plugins/cursor-overlay-kit';
import { AIChatPlugin, AIPlugin } from '@platejs/ai/react';
import { AILoadingBar, AIMenu } from '../../ui/ai-menu';
// import { useChat } from '../use-chat';
import { useAgent } from '../use-agent';

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
  shortcuts: { show: { keys: 'Tab' } },
  // useHooks: useChat,
  useHooks: useAgent,
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPlugin,
];
