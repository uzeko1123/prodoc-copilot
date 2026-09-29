'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/shadcn/ui/command';
import { Spinner } from '@/components/ui/spinner';
import { AIChatPlugin, useEditorChat } from '@platejs/ai/react';
import {
  flip,
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
  offset,
  shift,
  useVirtualFloating,
} from '@platejs/floating';
import { BlockSelectionPlugin, useIsSelecting } from '@platejs/selection/react';
import { useComposedRef } from '@udecode/cn';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from 'cn';
import {
  BadgeQuestionMarkIcon,
  FeatherIcon,
  GraduationCapIcon,
  LanguagesIcon,
  ListMinusIcon,
  ListPlusIcon,
  ListTreeIcon,
  PauseIcon,
  PencilSparklesIcon,
  SendIcon,
  SpellCheckIcon,
  SummaryIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { isHotkey, type NodeEntry } from 'platejs';
import {
  useEditorContainerRef,
  useEditorMounted,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorRef,
  useEditorSelection,
  useHotkeys,
  useOnClickOutside,
  usePluginOption,
  usePluginOptions,
  useScrollRef,
  type PlateEditor,
} from 'platejs/react';
import * as React from 'react';
import { useChatStore } from '../../stores';
import type { ChatMode } from '../editor/use-agent';
import { AICommentIcon } from './ai-comment-icon';

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const selection = useEditorSelection();

  const open = usePluginOption(AIChatPlugin, 'open');
  const chatStatus = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.status,
  );

  const chatInput = useChatStore((state) => state.chatInput);
  const setChatInput = useChatStore((state) => state.setChatInput);

  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null,
  );

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  const isLoading = chatStatus === 'streaming' || chatStatus === 'submitted';

  const _skipBlockSelection = true;

  useEditorChat({
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!;

      if (
        !_skipBlockSelection &&
        !isLoading &&
        !editor.api.isAt({ end: true }) &&
        !editor.api.isEmpty(ancestor)
      ) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.set(ancestor.id as string);
      }

      show(editor.api.toDOMNode(ancestor)!);
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!);
    },
  });

  useHotkeys('esc', () => {
    api.aiChat.stop();

    // remove when you implement the route /api/ai/command
    // (chat as any)._abortFakeStream();
  });

  React.useEffect(() => {
    if (chatStatus !== 'submitted') return;

    editor.setOption(AIChatPlugin, 'open', false);
  }, [chatStatus, editor]);

  const floatingRef = React.useRef<HTMLDivElement>(null);

  const floating = useVirtualFloating({
    getBoundingClientRect: () => {
      const anchorElementRect = anchorElement?.getBoundingClientRect();
      if (selection) {
        const rangeRect = getRangeBoundingClientRect(editor, selection);
        if (rangeRect && (rangeRect.width > 0 || rangeRect.height > 0)) {
          return new DOMRect(
            anchorElementRect?.x ?? rangeRect.x,
            rangeRect.y,
            anchorElementRect?.width ?? rangeRect.width,
            rangeRect.height,
          );
        }
      }
      return anchorElementRect ?? getDefaultBoundingClientRect();
    },
    placement: 'bottom',
    middleware: [
      offset(12),
      flip({
        mainAxis: true,
        crossAxis: false,
        fallbackPlacements: ['top'],
        padding: 12,
      }),
      shift({
        mainAxis: true,
        crossAxis: false,
        padding: 12,
      }),
    ],
  });

  useOnClickOutside(() => setOpen(false), {
    disabled: !open,
    refs: [floatingRef],
  });

  const ref = useComposedRef<HTMLDivElement>(
    floating.refs.setFloating,
    floatingRef,
  );

  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const containerRef = useEditorContainerRef();
  const { update } = floating;

  React.useEffect(() => {
    void update();
  }, [anchorElement, selection, open, update]);

  React.useEffect(() => {
    if (!editorMounted) return;
    const scroll = scrollRef.current;
    if (!scroll) return;

    scroll.addEventListener('scroll', update, { passive: true });
    return () => scroll.removeEventListener('scroll', update);
  }, [editorMounted, scrollRef, update]);

  React.useEffect(() => {
    if (!editorMounted) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => update());
    observer.observe(container);
    return () => observer.disconnect();
  }, [editorMounted, containerRef, update]);

  if (!open || !anchorElement) return null;

  return (
    <div
      ref={ref}
      className="z-50 flex max-h-[50%] flex-col border-none bg-transparent p-0 shadow-none"
      style={{
        ...floating.style,
        width: anchorElement.offsetWidth,
      }}
    >
      <Command
        className="w-full rounded-lg border shadow-md"
        shouldFilter={false}
      >
        {isLoading ? (
          <div className="text-muted-foreground flex grow items-center justify-center gap-2 p-2 text-sm select-none">
            <Spinner className="size-3.5" />
            <span className="shimmer">AI 工作中 . . .</span>
          </div>
        ) : (
          <>
            <CommandPrimitive.Input
              className={cn(
                'border-input placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                'border-b focus-visible:ring-transparent',
              )}
              value={chatInput}
              onKeyDown={(e) => {
                if (
                  isHotkey('escape')(e) ||
                  (isHotkey('backspace')(e) && chatInput.length === 0)
                ) {
                  e.preventDefault();
                  api.aiChat.hide();
                }
              }}
              onValueChange={setChatInput}
              placeholder="发送 AI 指令 . . ."
              data-plate-focus
              autoFocus
            />
            <CommandList>
              <AIMenuItems input={chatInput} setInput={setChatInput} />
            </CommandList>
          </>
        )}
      </Command>
    </div>
  );
}

type EditorChatState = 'cursorCommand' | 'selectionCommand' | 'readonlyCommand';

const aiChatItems = {
  continue: {
    icon: <PencilSparklesIcon />,
    label: '自动续写',
    value: '/continue',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/continue ${input}` : '/continue', {
          mode: 'insert',
          toolName: 'generate',
        });
    },
  },
  outline: {
    icon: <ListTreeIcon />,
    label: '生成大纲',
    value: '/outline',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/outline ${input}` : '/outline', {
          mode: 'insert',
          toolName: 'generate',
        });
    },
  },
  polish: {
    icon: <WandSparklesIcon />,
    label: '智能润色',
    value: '/polish',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/polish ${input}` : '/polish', {
          toolName: 'edit',
        });
    },
  },
  fix: {
    icon: <SpellCheckIcon />,
    label: '语法校对',
    value: '/fix',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/fix ${input}` : '/fix', {
          toolName: 'edit',
        });
    },
  },
  expand: {
    icon: <ListPlusIcon />,
    label: '扩写内容',
    value: '/expand',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/expand ${input}` : '/expand', {
          toolName: 'edit',
        });
    },
  },
  shorten: {
    icon: <ListMinusIcon />,
    label: '精简内容',
    value: '/shorten',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/shorten ${input}` : '/shorten', {
          toolName: 'edit',
        });
    },
  },
  formal: {
    icon: <GraduationCapIcon />,
    label: '书面用语',
    value: '/formal',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/formal ${input}` : '/formal', {
          toolName: 'edit',
        });
    },
  },
  simplify: {
    icon: <FeatherIcon />,
    label: '通俗用语',
    value: '/simplify',
    chatMode: 'suggestion',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/simplify ${input}` : '/simplify', {
          toolName: 'edit',
        });
    },
  },
  review: {
    icon: <AICommentIcon />,
    label: '智能评阅',
    value: '/review',
    chatMode: 'review',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('review');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/review ${input}` : '/review', {
          mode: 'insert',
          toolName: 'comment',
        });
    },
  },
  translate: {
    icon: <LanguagesIcon />,
    label: '双语互译',
    value: '/translate',
    chatMode: 'chat',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('chat');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/translate ${input}` : '/translate');
    },
  },
  explain: {
    icon: <BadgeQuestionMarkIcon />,
    label: '深度解释',
    value: '/explain',
    chatMode: 'chat',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('chat');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/explain ${input}` : '/explain');
    },
  },
  summarize: {
    icon: <SummaryIcon />,
    label: '提炼总结',
    value: '/summarize',
    chatMode: 'chat',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('chat');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/summarize ${input}` : '/summarize', {
          mode: 'insert',
        });
    },
  },
} satisfies Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    value: string;
    chatMode: ChatMode | null;
    component?: React.ComponentType<{ menuState: EditorChatState }>;
    filterItems?: boolean;
    items?: { label: string; value: string }[];
    shortcut?: string;
    onSelect?: ({
      editor,
      input,
    }: {
      editor: PlateEditor;
      input: string;
    }) => void;
  }
>;

// eslint-disable-next-line react-refresh/only-export-components
export const menuStateItems: Record<
  EditorChatState,
  {
    items: (typeof aiChatItems)[keyof typeof aiChatItems][];
    heading?: string;
  }[]
> = {
  cursorCommand: [
    {
      items: [aiChatItems.continue, aiChatItems.outline],
      heading: '内容生成',
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.polish,
        aiChatItems.fix,
        aiChatItems.expand,
        aiChatItems.shorten,
        aiChatItems.formal,
        aiChatItems.simplify,
      ],
      heading: '文档编辑',
    },
  ],
  readonlyCommand: [
    {
      items: [
        aiChatItems.review,
        aiChatItems.translate,
        aiChatItems.explain,
        aiChatItems.summarize,
      ],
      heading: '对话 & 评论',
    },
  ],
};

export const AIMenuItems = ({
  input,
  setInput,
}: {
  input: string;
  setInput: (value: string) => void;
}) => {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const isSelecting = useIsSelecting();

  const menuStates = React.useMemo(() => {
    return (
      readOnly
        ? ['readonlyCommand']
        : isSelecting
          ? ['selectionCommand', 'readonlyCommand']
          : ['cursorCommand', 'readonlyCommand']
    ) as EditorChatState[];
  }, [readOnly, isSelecting]);

  return (
    <>
      <CommandGroup>
        <CommandItem
          className="[&_svg]:text-muted-foreground"
          value="/"
          onSelect={() => {
            void editor.getApi(AIChatPlugin).aiChat.submit(input);
            setInput('');
          }}
        >
          <SendIcon />
          <span>直接发送</span>
        </CommandItem>
      </CommandGroup>
      {menuStates.map((menuState, menuStateIndex) =>
        menuStateItems[menuState].map((group, index) => (
          <CommandGroup
            key={`${menuStateIndex}-${index}`}
            heading={group.heading}
          >
            {group.items.map((menuItem) => (
              <CommandItem
                key={menuItem.value}
                className="[&_svg]:text-muted-foreground"
                value={menuItem.value}
                onSelect={() => {
                  menuItem.onSelect?.({
                    editor,
                    input,
                  });
                  setInput('');
                }}
              >
                {menuItem.icon}
                <span>{menuItem.label}</span>
                {menuItem.value !== '/' && (
                  <>
                    <div className="grow" />
                    <code
                      className="text-muted-foreground text-xs font-medium"
                      data-slot="command-shortcut"
                    >
                      {menuItem.value}
                    </code>
                  </>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )),
      )}
    </>
  );
};

export function AILoadingBar() {
  const chatStatus = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.status,
  );

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading = chatStatus === 'streaming' || chatStatus === 'submitted';

  useHotkeys('esc', () => {
    api.aiChat.stop();

    // remove when you implement the route /api/ai/command
    // (chat as any)._abortFakeStream();
  });

  if (!isLoading) return null;

  const _hide = true;
  if (_hide) return null;

  return (
    <div
      className={cn(
        'border-border bg-muted text-muted-foreground absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-md border px-3 py-1.5 text-sm shadow-md transition-all duration-300',
      )}
    >
      <span className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
      <span>AI 工作中 . . .</span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <PauseIcon className="h-4 w-4" />
        停止
        <kbd className="bg-border text-muted-foreground ml-1 rounded px-1 font-mono text-[10px] shadow-sm">
          Esc
        </kbd>
      </Button>
    </div>
  );
}
