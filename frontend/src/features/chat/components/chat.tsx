'use client';

import { Card, CardContent, CardFooter } from '@/components/shadcn/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/shadcn/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { useWorkbenchStore } from '@/stores/workbench';
import { AIChatPlugin } from '@platejs/ai/react';
import {
  ArrowUpIcon,
  FileTextIcon,
  MessageCircleDashedIcon,
  MessagesCircleIcon,
  PencilSparklesIcon,
  RotateCwIcon,
  SectionIcon,
  SparklesIcon,
  SquareIcon,
  SquareSlashIcon,
  WrenchIcon,
} from 'lucide-react';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorSelector,
  usePluginOptions,
} from 'platejs/react';
import * as React from 'react';
import { getChatModeName, getSelectionText } from '../lib/utils';
import { useChatStore } from '../stores';
import { Context } from './context';
import { chatModes, type ChatMode } from './editor/use-agent';
import { MessageAnimated } from './message-animated';
import { AICommentIcon } from './ui/ai-comment-icon';
import { menuStateItems } from './ui/ai-menu';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './ui/message-scroller';

export function Chat() {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const selectionText = useEditorSelector(
    (editor) => getSelectionText(editor, editor.selection),
    [],
  );

  const chatStatus = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.status,
  );
  const chatError = usePluginOptions(
    AIChatPlugin,
    (options) => options.chat?.error,
  );
  const isBusy = chatStatus === 'submitted' || chatStatus === 'streaming';

  const chatMode = useChatStore((state) => state.chatMode);
  const setChatMode = useChatStore((state) => state.setChatMode);
  const chatInput = useChatStore((state) => state.chatInput);
  const setChatInput = useChatStore((state) => state.setChatInput);
  const chatMessages = useChatStore((state) => state.chatMessages);
  const setChatMessages = useChatStore((state) => state.setChatMessages);

  const availableChatModes = React.useMemo(
    () => (readOnly ? ['chat', 'comment'] : chatModes),
    [readOnly],
  );

  React.useEffect(() => {
    if (!availableChatModes.includes(chatMode)) {
      setChatMode('chat');
    }
  }, [availableChatModes, chatMode, setChatMode]);

  const setSettingsDialogOpen = useWorkbenchStore(
    (state) => state.setSettingsDialogOpen,
  );

  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <MessageScrollerProvider autoScroll scrollEdgeThreshold={12}>
      <Card className="flex h-full flex-col gap-0 rounded-none ring-0">
        <CardContent className="flex-1 overflow-hidden p-0">
          {chatMessages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>AI 对话</EmptyTitle>
                <EmptyDescription>发送消息以开始 AI 对话</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport className="data-autoscrolling:[scrollbar-color:var(--color-border)_transparent]!">
                <MessageScrollerContent
                  aria-busy={isBusy}
                  className="p-(--card-spacing)"
                >
                  {chatMessages.map((message) => (
                    <MessageAnimated
                      key={message.id}
                      message={message}
                      scrollAnchor={false}
                    />
                  ))}
                  {chatStatus === 'error' && (
                    <p className="text-destructive whitespace-pre-wrap">
                      {chatError?.message || '未知错误。'}
                    </p>
                  )}
                  {isBusy && (
                    <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm font-medium">
                      <Spinner className="size-3.5" />
                      <span className="shimmer">AI 工作中 . . .</span>
                    </div>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 rounded-none">
          <Context variant="chat" content={selectionText} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isBusy || chatInput.length === 0) return;
              void editor.getApi(AIChatPlugin).aiChat.submit(chatInput);
              setChatInput('');
            }}
            className="w-full"
          >
            <InputGroup className="dark:has-disabled:bg-input/30 has-disabled:bg-transparent has-disabled:opacity-100">
              <InputGroupTextarea
                ref={inputRef}
                aria-label="发送消息"
                className="h-14 min-h-14 overflow-hidden px-3 py-2.5"
                placeholder="发送消息 . . ."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      aria-label="/菜单"
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-sm"
                    >
                      <SquareSlashIcon className="size-4" />
                      <kbd className="bg-border text-muted-foreground ml-1 rounded px-1 font-mono text-[10px] shadow-sm">
                        Tab
                      </kbd>
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-auto"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      inputRef.current?.focus();
                    }}
                  >
                    {!readOnly && (
                      <>
                        {(selectionText.length > 0
                          ? menuStateItems.selectionCommand
                          : menuStateItems.cursorCommand
                        ).flatMap((command) =>
                          command.items.map((item) => (
                            <DropdownMenuItem
                              className="text-sm [&_svg]:size-3.5"
                              key={item.value}
                              onSelect={() => {
                                setChatInput(`${item.value} ${chatInput}`);
                                if (item.chatMode === null) return;
                                useChatStore
                                  .getState()
                                  .setChatMode(item.chatMode);
                              }}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                              <div className="grow"></div>
                              <code className="text-muted-foreground text-xs font-medium">
                                {item.value}
                              </code>
                            </DropdownMenuItem>
                          )),
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {menuStateItems.readonlyCommand.flatMap((command) =>
                      command.items.map((item) => (
                        <DropdownMenuItem
                          className="text-sm [&_svg]:size-3.5"
                          key={item.value}
                          onSelect={() => {
                            setChatInput(`${item.value} ${chatInput}`);
                            if (item.chatMode === null) return;
                            useChatStore.getState().setChatMode(item.chatMode);
                          }}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          <div className="grow"></div>
                          <code className="text-muted-foreground text-xs font-medium">
                            {item.value}
                          </code>
                        </DropdownMenuItem>
                      )),
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-sm [&_svg]:size-3.5"
                      onSelect={() => {
                        setChatInput(`/section ${chatInput}`);
                      }}
                    >
                      <SectionIcon />
                      <span>选择章节</span>
                      <div className="grow"></div>
                      <code className="text-muted-foreground text-xs font-medium">
                        /section
                      </code>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-sm [&_svg]:size-3.5"
                      onSelect={() => {
                        setChatInput(`/fulltext ${chatInput}`);
                      }}
                    >
                      <FileTextIcon />
                      <span>选择全文</span>
                      <div className="grow"></div>
                      <code className="text-muted-foreground text-xs font-medium">
                        /fulltext
                      </code>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-sm"
                      onSelect={() => {
                        editor.getApi(AIChatPlugin).aiChat.reset({
                          undo: false,
                        });
                        setChatMessages([]);
                      }}
                    >
                      <RotateCwIcon className="size-3.5" />
                      重置对话
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-sm"
                      onSelect={() => {
                        setSettingsDialogOpen(true);
                      }}
                    >
                      <WrenchIcon className="size-3.5" />
                      设置
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="grow"></div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      aria-label="选择模式"
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-sm"
                    >
                      <ChatModeIcon chatMode={chatMode} />
                      {getChatModeName(chatMode)}
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="w-auto"
                  >
                    <DropdownMenuRadioGroup
                      value={chatMode}
                      onValueChange={(value) => setChatMode(value as ChatMode)}
                    >
                      {availableChatModes.map((chatMode) => (
                        <DropdownMenuRadioItem
                          className="text-sm"
                          key={chatMode}
                          value={chatMode}
                        >
                          <ChatModeIcon chatMode={chatMode as ChatMode} />
                          {getChatModeName(chatMode as ChatMode)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!isBusy ? (
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={isBusy || chatInput.trim() === ''}
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">发送</span>
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    type="button"
                    variant="default"
                    size="icon-sm"
                    onClick={() => editor.getApi(AIChatPlugin).aiChat.stop()}
                  >
                    <SquareIcon />
                    <span className="sr-only">停止</span>
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardFooter>
      </Card>
    </MessageScrollerProvider>
  );
}

function ChatModeIcon({ chatMode }: { chatMode: ChatMode }) {
  const chatModeIcons = {
    chat: MessagesCircleIcon,
    comment: AICommentIcon,
    suggestion: PencilSparklesIcon,
    auto: SparklesIcon,
  };
  const Icon = chatModeIcons[chatMode as keyof typeof chatModeIcons];
  return <Icon className="size-3.5" />;
}
