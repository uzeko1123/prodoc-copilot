'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { AIChatPlugin } from '@platejs/ai/react';
import {
  ArrowUpIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
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

  const chatMode = useChatStore((state) => state.chatMode);
  const setChatMode = useChatStore((state) => state.setChatMode);
  const chatMessages = useChatStore((state) => state.chatMessages);
  const setChatMessages = useChatStore((state) => state.setChatMessages);

  const status = usePluginOptions(AIChatPlugin, (o) => o.chat?.status);
  const error = usePluginOptions(AIChatPlugin, (o) => o.chat?.error);
  const isBusy = status === 'submitted' || status === 'streaming';

  const [input, setInput] = React.useState('');

  const onSubmit = () => editor.getApi(AIChatPlugin).aiChat.submit(input);

  return (
    <MessageScrollerProvider>
      <Card className="flex h-full flex-col gap-0 rounded-none ring-0">
        <CardHeader className="gap-1 rounded-none border-b">
          <CardTitle>New Chat</CardTitle>
          <CardDescription>How can I help you today?</CardDescription>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Reset conversation"
                  onClick={() => {
                    editor.getApi(AIChatPlugin).aiChat.reset({
                      undo: false,
                    });
                    setChatMessages([]);
                  }}
                  disabled={isBusy}
                >
                  <RotateCwIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
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
                  {status === 'error' && (
                    <div className="text-destructive flex items-center gap-1.5 text-sm">
                      <CircleAlertIcon className="size-4 shrink-0" />
                      {error?.message || 'Something went wrong.'}
                    </div>
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
              if (isBusy || input.length === 0) {
                return;
              }
              void onSubmit();
              setInput('');
            }}
            className="w-full"
          >
            <InputGroup>
              <InputGroupTextarea
                aria-label="Chat message"
                className="max-h-40 min-h-14 overflow-y-auto px-3 py-2.5"
                placeholder="Ask anything..."
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
                      aria-label="Select mode"
                      type="button"
                      size="xs"
                      variant="outline"
                    >
                      <WrenchIcon />
                      {getChatModeName(chatMode)}
                      <ChevronDownIcon className="opacity-50" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-40"
                  >
                    <DropdownMenuRadioGroup
                      value={chatMode}
                      onValueChange={(value) => setChatMode(value as ChatMode)}
                    >
                      {chatModes.map((chatMode) => (
                        <DropdownMenuRadioItem key={chatMode} value={chatMode}>
                          {getChatModeName(chatMode as ChatMode)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isBusy ? (
                  <InputGroupButton
                    type="button"
                    variant="default"
                    size="icon-sm"
                    aria-label="Stop"
                    className="ml-auto"
                    onClick={() => editor.getApi(AIChatPlugin).aiChat.stop()}
                  >
                    <SquareIcon className="fill-current" />
                    <span className="sr-only">Stop</span>
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={isBusy}
                    className="ml-auto"
                  >
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
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

function SelectionContext() {
  const selectionText = useEditorSelector(
    (editor) => getSelectionText(editor, editor.selection),
    [],
  );
  return <ContextPrimitive variant="chat" content={selectionText} />;
}
