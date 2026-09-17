'use client';

import { MessageAnimated } from '@/components/shadcn/message-animated';
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
  DropdownMenuItem,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { chat, initialMessages, transport } from '@/data/chat';
import { getMessageText } from '@/lib/shadcn/ai';
import { useChat } from '@ai-sdk/react';
import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  RotateCwIcon,
  TelescopeIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { useChatStore } from '../stores';
import { Context } from './context';
import type { ChatMessage } from './editor/use-chat';

export function Chat() {
  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages,
    transport,
  });

  const chatMessages = useChatStore((state) => state.chatMessages);
  const setChatMessages = useChatStore((state) => state.setChatMessages);

  useEffect(() => {
    if (messages.length > 0) {
      setChatMessages(messages as unknown as ChatMessage[]);
    }
  }, [messages, setChatMessages]);

  const nextMessage = chat.next(chatMessages);
  const isBusy = status === 'submitted' || status === 'streaming';

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
                  onClick={() => setMessages(initialMessages)}
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
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 rounded-none">
          <Context />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nextMessage || isBusy) {
                return;
              }
              void sendMessage(nextMessage);
            }}
            className="w-full"
          >
            <InputGroup>
              <InputGroupTextarea
                aria-label="Next predefined message"
                className="h-14 min-h-14 overflow-hidden px-3 py-2.5 opacity-60 data-[status=ready]:opacity-100"
                data-status={status}
                placeholder="No messages queued. Reset the conversation."
                value={nextMessage ? getMessageText(nextMessage) : ''}
                readOnly
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      aria-label="Add files"
                      type="button"
                      size="icon-sm"
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
                    <DropdownMenuItem>
                      <PaperclipIcon />
                      Add Photos & Files
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ImageIcon />
                      Create Image
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <TelescopeIcon />
                      Deep Research
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GlobeIcon />
                      Web Search
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={!nextMessage || isBusy}
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardFooter>
      </Card>
    </MessageScrollerProvider>
  );
}
