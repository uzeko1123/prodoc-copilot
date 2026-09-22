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
    trigger: [],
  },
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
    node: AIAnchorElement,
  },
  shortcuts: { show: { keys: 'mod+q' } },
  // useHooks: useChat,
  useHooks: useAgent,
}).extendApi(({ api, getOption, getOptions, setOption }) => {
  const show = api.aiChat.show;
  const hide = api.aiChat.hide;

  const isRunning = () =>
    getOption('streaming') ||
    getOptions().chat?.status === 'streaming' ||
    getOptions().chat?.status === 'submitted';

  return {
    show: () => {
      if (isRunning()) {
        setOption('open', true);
        return;
      }
      show();
    },
    hide: (options?: { focus?: boolean; undo?: boolean }) => {
      if (isRunning()) {
        setOption('open', false);
        return;
      }
      hide(options);
    },
  };
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPlugin,
];
