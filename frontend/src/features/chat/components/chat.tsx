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
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/shadcn/ui/message-scroller';
import { useWorkbenchStore } from '@/stores/workbench';
import { AIChatPlugin } from '@platejs/ai/react';
import {
  ArrowUpIcon,
  ChevronDownIcon,
  MessageCircleDashedIcon,
  MessagesCircleIcon,
  MessageSquareTextIcon,
  PencilSparklesIcon,
  PlusIcon,
  RotateCwIcon,
  SparklesIcon,
  SquareIcon,
  WrenchIcon,
} from 'lucide-react';
import {
  useEditorRef,
  useEditorSelector,
  usePluginOptions,
} from 'platejs/react';
import * as React from 'react';
import { getChatModeName, getSelectionText } from '../lib/utils';
import { useChatStore } from '../stores';
import { Context as ContextPrimitive } from './context';
import { chatModes, type ChatMode } from './editor/use-agent';
import { MessageAnimated } from './message-animated';

export function Chat() {
  const editor = useEditorRef();
  const chatStatus = usePluginOptions(AIChatPlugin, (o) => o.chat?.status);
  const chatError = usePluginOptions(AIChatPlugin, (o) => o.chat?.error);
  const isBusy = chatStatus === 'submitted' || chatStatus === 'streaming';

  const chatMode = useChatStore((state) => state.chatMode);
  const setChatMode = useChatStore((state) => state.setChatMode);
  const chatMessages = useChatStore((state) => state.chatMessages);
  const setChatMessages = useChatStore((state) => state.setChatMessages);

  const setSettingsDialogOpen = useWorkbenchStore(
    (state) => state.setSettingsDialogOpen,
  );

  const [input, setInput] = React.useState('');

  return (
    <MessageScrollerProvider>
      <Card className="flex h-full flex-col gap-0 rounded-none ring-0">
        <CardContent className="scrollbar-thumb-border flex-1 scrollbar-thin overflow-hidden p-0">
          {chatMessages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>Morning, shadcn!</EmptyTitle>
                <EmptyDescription>
                  What are we working on today? Press send to start a new
                  conversation
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent
                  aria-busy={isBusy}
                  className="p-(--card-spacing)"
                >
                  {chatMessages.map((message) => (
                    <MessageAnimated
                      key={message.id}
                      message={message}
                      scrollAnchor={message.role === 'user'}
                    />
                  ))}
                  {chatStatus === 'error' && (
                    <p className="text-destructive whitespace-pre-wrap">
                      {chatError?.message || 'Unknown error.'}
                    </p>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 rounded-none">
          <SelectionContext />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isBusy || input.length === 0) return;
              void editor.getApi(AIChatPlugin).aiChat.submit(input);
              setInput('');
            }}
            className="w-full"
          >
            <InputGroup className="dark:has-disabled:bg-input/30 has-disabled:bg-transparent has-disabled:opacity-100">
              <InputGroupTextarea
                aria-label="Chat message"
                className="h-14 min-h-14 overflow-hidden px-3 py-2.5"
                placeholder="Chat message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
                      aria-label="Add"
                      type="button"
                      size="icon-xs"
                      variant="outline"
                    >
                      <PlusIcon />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-44"
                  >
                    <DropdownMenuItem
                      onSelect={() => {
                        editor.getApi(AIChatPlugin).aiChat.reset({
                          undo: false,
                        });
                        setChatMessages([]);
                      }}
                    >
                      <RotateCwIcon />
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setSettingsDialogOpen(true);
                      }}
                    >
                      <WrenchIcon />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="group">
                    <InputGroupButton
                      aria-label="Select mode"
                      type="button"
                      size="xs"
                      variant="outline"
                    >
                      <ChatModeIcon chatMode={chatMode} />
                      {getChatModeName(chatMode)}
                      <ChevronDownIcon className="rotate-180 group-data-[state=closed]:rotate-270" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-44"
                  >
                    <DropdownMenuRadioGroup
                      value={chatMode}
                      onValueChange={(value) => setChatMode(value as ChatMode)}
                    >
                      {chatModes.map((chatMode) => (
                        <DropdownMenuRadioItem key={chatMode} value={chatMode}>
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
                    disabled={isBusy || input.trim() === ''}
                    className="ml-auto"
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    type="button"
                    variant="default"
                    size="icon-sm"
                    className="ml-auto"
                    onClick={() => editor.getApi(AIChatPlugin).aiChat.stop()}
                  >
                    <SquareIcon />
                    <span className="sr-only">Stop</span>
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
    comment: MessageSquareTextIcon,
    suggestion: PencilSparklesIcon,
    auto: SparklesIcon,
  };
  const Icon = chatModeIcons[chatMode as keyof typeof chatModeIcons];
  return <Icon />;
}

function SelectionContext() {
  const selectionText = useEditorSelector(
    (editor) => getSelectionText(editor, editor.selection),
    [],
  );
  return <ContextPrimitive variant="chat" content={selectionText} />;
}
