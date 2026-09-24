'use client';

import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { AIAnchorElement, AILeaf } from '@/components/shadcn/ui/ai-node';
import { CursorOverlayKit } from '@/features/editor/components/editor/plugins/cursor-overlay-kit';
import { useWorkbenchStore } from '@/stores/workbench';
import { AIChatPlugin, AIPlugin } from '@platejs/ai/react';
import { AICursorButton } from '../../ui/ai-cursor-button';
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
    afterEditable: () => (
      <>
        <AIMenu />
        <AICursorButton />
      </>
    ),
    node: AIAnchorElement,
  },
  shortcuts: { show: { keys: 'mod+q' } },
  // useHooks: useChat,
  useHooks: useAgent,
}).extendApi(({ api, getOption, getOptions, setOption }) => {
  const { show, hide, submit } = api.aiChat;

  const isRunning = () =>
    getOption('streaming') ||
    getOptions().chat?.status === 'streaming' ||
    getOptions().chat?.status === 'submitted';

  return {
    submit: (...args: Parameters<typeof submit>) => {
      useWorkbenchStore.getState().setActiveMainTab('chat');
      submit(...args);
    },
    show: () => {
      useWorkbenchStore.getState().setActiveMainTab('chat');
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
