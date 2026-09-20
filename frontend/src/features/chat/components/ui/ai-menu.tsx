'use client';

import { AIChatEditor as AIChatEditorPrimitive } from '@/components/shadcn/ui/ai-chat-editor';
import { Button } from '@/components/shadcn/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/shadcn/ui/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/shadcn/ui/popover';
import { useChatStore } from '@/features/chat/stores';
import {
  AIChatPlugin,
  AIPlugin,
  useEditorChat,
  useLastAssistantMessage,
} from '@platejs/ai/react';
import { BlockSelectionPlugin, useIsSelecting } from '@platejs/selection/react';
import { getTransientSuggestionKey } from '@platejs/suggestion';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from 'cn';
import {
  Album,
  BadgeHelp,
  BookOpenCheck,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  Loader2Icon,
  PauseIcon,
  PenLine,
  SmileIcon,
  Wand,
  X,
} from 'lucide-react';
import { isHotkey, KEYS, type NodeEntry, type SlateEditor } from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useFocusedLast,
  useHotkeys,
  usePluginOption,
  usePluginOptions,
  type PlateEditor,
} from 'platejs/react';
import * as React from 'react';
import { AICommentIcon } from './ai-comment-icon';

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const toolName = usePluginOption(AIChatPlugin, 'toolName');

  const streaming = usePluginOption(AIChatPlugin, 'streaming');
  const isSelecting = useIsSelecting();
  const isFocusedLast = useFocusedLast();
  const open = usePluginOption(AIChatPlugin, 'open') && isFocusedLast;
  const [value, setValue] = React.useState('');

  const [input, setInput] = React.useState('');

  const chatStatus = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.status,
  );
  const chatMessageLength = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.messages?.length ?? 0,
  );

  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null,
  );

  React.useEffect(() => {
    if (!streaming) return;

    const anchorEntry = api.aiChat.node({ anchor: true });
    if (!anchorEntry) return;

    const anchorDom = editor.api.toDOMNode(anchorEntry[0])!;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Position the popover from editor DOM while the edit stream is active.
    setAnchorElement(anchorDom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

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

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
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

  const isLoading = chatStatus === 'streaming' || chatStatus === 'submitted';

  React.useEffect(() => {
    if (toolName !== 'edit' || mode !== 'chat' || isLoading) return;

    let anchorNode = editor.api.node({
      at: [],
      reverse: true,
      match: (n) => !!n[KEYS.suggestion] && !!n[getTransientSuggestionKey()],
    });

    if (!anchorNode) {
      anchorNode = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes({ selectionFallback: true, sort: true })
        .at(-1);
    }

    if (!anchorNode) return;

    const block = editor.api.block({ at: anchorNode[1] });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Position the popover from editor DOM after the edit stream completes.
    setAnchorElement(editor.api.toDOMNode(block![0]!)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading && mode === 'insert') return null;

  if (toolName === 'comment') return null;

  if (toolName === 'edit' && mode === 'chat' && isLoading) return null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement! }} />

      <PopoverContent
        className="border-none bg-transparent p-0 shadow-none"
        style={{
          width: anchorElement?.offsetWidth,
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();

          api.aiChat.hide();
        }}
        align="center"
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {mode === 'chat' && isSelecting && toolName === 'generate' && (
            <AIChatEditor />
          )}

          {isLoading ? (
            <div className="text-muted-foreground flex grow items-center gap-2 p-2 text-sm select-none">
              <Loader2Icon className="size-4 animate-spin" />
              {chatMessageLength > 1 ? 'Editing...' : 'Thinking...'}
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
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault();
                  api.aiChat.hide();
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  void api.aiChat.submit(input);
                  setInput('');
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
              <AIMenuItems
                input={input}
                setInput={setInput}
                setValue={setValue}
              />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AIChatEditor() {
  const content = useLastAssistantMessage()?.parts.find(
    (part) => part.type === 'text',
  )?.text;
  if (!content) return;
  return <AIChatEditorPrimitive content={content} />;
}

type EditorChatState =
  | 'cursorCommand'
  | 'cursorSuggestion'
  | 'selectionCommand'
  | 'selectionSuggestion';

const aiChatItems = {
  accept: {
    icon: <Check />,
    label: 'Accept',
    value: 'accept',
    onSelect: ({ aiEditor, editor }) => {
      const { mode, toolName } = editor.getOptions(AIChatPlugin);

      if (mode === 'chat' && toolName === 'generate') {
        return editor
          .getTransforms(AIChatPlugin)
          .aiChat.replaceSelection(aiEditor);
      }

      editor.getTransforms(AIChatPlugin).aiChat.accept();
      editor.tf.focus({ edge: 'end' });
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
  discard: {
    icon: <X />,
    label: 'Discard',
    shortcut: 'Escape',
    value: 'discard',
    onSelect: ({ editor }) => {
      editor.getTransforms(AIPlugin).ai.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
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
  insertBelow: {
    icon: <ListEnd />,
    label: 'Insert below',
    value: 'insertBelow',
    onSelect: ({ aiEditor, editor }) => {
      /** Format: 'none' Fix insert table */
      void editor
        .getTransforms(AIChatPlugin)
        .aiChat.insertBelow(aiEditor, { format: 'none' });
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
  replace: {
    icon: <Check />,
    label: 'Replace selection',
    value: 'replace',
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
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
    label: 'Add a summary',
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
  tryAgain: {
    icon: <CornerUpLeft />,
    label: 'Try again',
    value: 'tryAgain',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
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
      aiEditor,
      editor,
      input,
    }: {
      aiEditor: SlateEditor;
      editor: PlateEditor;
      input: string;
    }) => void;
  }
>;

const menuStateItems: Record<
  EditorChatState,
  {
    items: (typeof aiChatItems)[keyof typeof aiChatItems][];
    heading?: string;
  }[]
> = {
  cursorCommand: [
    {
      items: [
        aiChatItems.comment,
        aiChatItems.generateMdxSample,
        aiChatItems.generateMarkdownSample,
        aiChatItems.continueWrite,
        aiChatItems.summarize,
        aiChatItems.explain,
      ],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting,
        aiChatItems.comment,
        aiChatItems.emojify,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
      ],
    },
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItems.accept,
        aiChatItems.discard,
        aiChatItems.insertBelow,
        aiChatItems.tryAgain,
      ],
    },
  ],
};

export const AIMenuItems = ({
  input,
  setInput,
  setValue,
}: {
  input: string;
  setInput: (value: string) => void;
  setValue: (value: string) => void;
}) => {
  const editor = useEditorRef();
  const hasChatMessages = usePluginOptions(
    AIChatPlugin,
    (options) => (options.chat?.messages?.length ?? 0) > 0,
  );
  const aiEditor = usePluginOption(AIChatPlugin, 'aiEditor')!;
  const isSelecting = useIsSelecting();

  const menuState = React.useMemo(() => {
    if (hasChatMessages) {
      return isSelecting ? 'selectionSuggestion' : 'cursorSuggestion';
    }

    return isSelecting ? 'selectionCommand' : 'cursorCommand';
  }, [isSelecting, hasChatMessages]);

  const menuGroups = React.useMemo(() => {
    const items = menuStateItems[menuState];

    return items;
  }, [menuState]);

  React.useEffect(() => {
    if (menuGroups.length > 0 && menuGroups[0].items.length > 0) {
      setValue(menuGroups[0].items[0].value);
    }
  }, [menuGroups, setValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({
                  aiEditor,
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
      ))}
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
