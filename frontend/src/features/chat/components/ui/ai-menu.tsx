'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/shadcn/ui/command';
import { useChatStore } from '@/features/chat/stores';
import { AIChatPlugin, useEditorChat } from '@platejs/ai/react';
import {
  flip,
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@platejs/floating';
import { BlockSelectionPlugin, useIsSelecting } from '@platejs/selection/react';
import { useComposedRef } from '@udecode/cn';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from 'cn';
import {
  Album,
  BadgeHelp,
  BookOpenCheck,
  Check,
  FeatherIcon,
  ListMinus,
  ListPlus,
  Loader2Icon,
  PauseIcon,
  PenLine,
  SendIcon,
  SmileIcon,
  Wand,
} from 'lucide-react';
import { isHotkey, type NodeEntry } from 'platejs';
import {
  useEditorContainerRef,
  useEditorMounted,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorRef,
  useEditorSelection,
  useFocusedLast,
  useHotkeys,
  useOnClickOutside,
  usePluginOption,
  usePluginOptions,
  useScrollRef,
  type PlateEditor,
} from 'platejs/react';
import * as React from 'react';
import { AICommentIcon } from './ai-comment-icon';

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const selection = useEditorSelection();

  const isFocusedLast = useFocusedLast();
  const open = usePluginOption(AIChatPlugin, 'open') && isFocusedLast;

  const [input, setInput] = React.useState('');

  const chatStatus = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.status,
  );

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
        setInput('');
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
    middleware: [
      offset(12),
      flip({
        fallbackPlacements: [
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ],
        padding: 12,
      }),
    ],
    placement: 'bottom',
  });

  const clickOutsideRef = useOnClickOutside(() => setOpen(false));
  const ref = useComposedRef<HTMLDivElement>(
    floating.refs.setFloating,
    clickOutsideRef,
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
      className="z-50"
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
          <div className="text-muted-foreground flex grow items-center gap-2 p-2 text-sm select-none">
            <Loader2Icon className="size-4 animate-spin" />
            {chatStatus === 'submitted' ? 'Editing...' : 'Thinking...'}
          </div>
        ) : (
          <CommandPrimitive.Input
            className={cn(
              'border-input placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm',
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
              'border-b focus-visible:ring-transparent',
            )}
            value={input}
            onKeyDown={(e) => {
              if (
                isHotkey('escape')(e) ||
                (isHotkey('backspace')(e) && input.length === 0)
              ) {
                e.preventDefault();
                api.aiChat.hide();
              }
            }}
            onValueChange={setInput}
            placeholder="Ask AI anything..."
            data-plate-focus
            autoFocus
          />
        )}

        {!isLoading && (
          <CommandList>
            <AIMenuItems input={input} setInput={setInput} />
          </CommandList>
        )}
      </Command>
    </div>
  );
}

type EditorChatState =
  'sendCommand' | 'cursorCommand' | 'selectionCommand' | 'readonlyCommand';

const aiChatItems = {
  send: {
    icon: <SendIcon />,
    label: 'Send',
    value: 'send',
    onSelect: ({ editor, input }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit(input);
    },
  },
  comment: {
    icon: <AICommentIcon />,
    label: 'Comment',
    value: 'comment',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('comment');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/comment ${input}` : '/comment', {
          mode: 'insert',
          toolName: 'comment',
        });
    },
  },
  continueWrite: {
    icon: <PenLine />,
    label: 'Continue writing',
    value: 'continueWrite',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/continueWrite ${input}` : '/continueWrite', {
          mode: 'insert',
          toolName: 'generate',
        });
    },
  },
  emojify: {
    icon: <SmileIcon />,
    label: 'Emojify',
    value: 'emojify',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/emojify ${input}` : '/emojify', {
          toolName: 'edit',
        });
    },
  },
  explain: {
    icon: <BadgeHelp />,
    label: 'Explain',
    value: 'explain',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('chat');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/explain ${input}` : '/explain');
    },
  },
  fixSpelling: {
    icon: <Check />,
    label: 'Fix spelling & grammar',
    value: 'fixSpelling',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/fixSpelling ${input}` : '/fixSpelling', {
          toolName: 'edit',
        });
    },
  },
  generateMarkdownSample: {
    icon: <BookOpenCheck />,
    label: 'Generate Markdown sample',
    value: 'generateMarkdownSample',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(
          input
            ? `/generateMarkdownSample ${input}`
            : '/generateMarkdownSample',
          {
            toolName: 'generate',
          },
        );
    },
  },
  generateMdxSample: {
    icon: <BookOpenCheck />,
    label: 'Generate MDX sample',
    value: 'generateMdxSample',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(
          input ? `/generateMdxSample ${input}` : '/generateMdxSample',
          {
            toolName: 'generate',
          },
        );
    },
  },
  improveWriting: {
    icon: <Wand />,
    label: 'Improve writing',
    value: 'improveWriting',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/improveWriting ${input}` : '/improveWriting', {
          toolName: 'edit',
        });
    },
  },
  makeLonger: {
    icon: <ListPlus />,
    label: 'Make longer',
    value: 'makeLonger',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/makeLonger ${input}` : '/makeLonger', {
          toolName: 'edit',
        });
    },
  },
  makeShorter: {
    icon: <ListMinus />,
    label: 'Make shorter',
    value: 'makeShorter',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(input ? `/makeShorter ${input}` : '/makeShorter', {
          toolName: 'edit',
        });
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: 'Simplify language',
    value: 'simplifyLanguage',
    onSelect: ({ editor, input }) => {
      useChatStore.getState().setChatMode('suggestion');
      void editor
        .getApi(AIChatPlugin)
        .aiChat.submit(
          input ? `/simplifyLanguage ${input}` : '/simplifyLanguage',
          {
            toolName: 'edit',
          },
        );
    },
  },
  summarize: {
    icon: <Album />,
    label: 'Summarize',
    value: 'summarize',
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
  sendCommand: [
    {
      items: [aiChatItems.send],
    },
  ],
  cursorCommand: [
    {
      items: [
        aiChatItems.generateMdxSample,
        aiChatItems.generateMarkdownSample,
        aiChatItems.continueWrite,
      ],
      heading: 'Cursor Command',
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting,
        aiChatItems.emojify,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
      ],
      heading: 'Selection Command',
    },
  ],
  readonlyCommand: [
    {
      items: [aiChatItems.comment, aiChatItems.explain, aiChatItems.summarize],
      heading: 'Readonly Command',
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
        ? ['sendCommand', 'readonlyCommand']
        : isSelecting
          ? ['sendCommand', 'selectionCommand', 'readonlyCommand']
          : ['sendCommand', 'cursorCommand', 'readonlyCommand']
    ) as EditorChatState[];
  }, [readOnly, isSelecting]);

  return (
    <>
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
      <span>{chatStatus === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <PauseIcon className="h-4 w-4" />
        Stop
        <kbd className="bg-border text-muted-foreground ml-1 rounded px-1 font-mono text-[10px] shadow-sm">
          Esc
        </kbd>
      </Button>
    </div>
  );
}
