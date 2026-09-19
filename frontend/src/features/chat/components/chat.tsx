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
import type { AIToolName } from '@platejs/ai';
import { AIChatPlugin } from '@platejs/ai/react';
import {
  ArrowUpIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
  WrenchIcon,
} from 'lucide-react';
import {
  useEditorRef,
  useEditorSelection,
  usePluginOption,
} from 'platejs/react';
import * as React from 'react';
import { getSelectionText } from '../lib/utils';
import { useChatStore } from '../stores';
import { Context } from './context';
import { MessageAnimated } from './message-animated';

const TOOL_OPTIONS: { label: string; value: AIToolName }[] = [
  { label: 'Chat', value: null },
  { label: 'Comment', value: 'comment' },
  { label: 'Edit', value: 'edit' },
  { label: 'Generate', value: 'generate' },
];

export function Chat() {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const selectionText = getSelectionText(editor, selection);

  const chatMessages = useChatStore((state) => state.chatMessages);
  const setChatMessages = useChatStore((state) => state.setChatMessages);

  const { status, error } = usePluginOption(AIChatPlugin, 'chat');
  const isBusy = status === 'submitted' || status === 'streaming';

  const [input, setInput] = React.useState('');
  const [toolName, setToolName] = React.useState<AIToolName>(null);
  const activeTool =
    TOOL_OPTIONS.find((option) => option.value === toolName) ?? TOOL_OPTIONS[0];

  const onSubmit = () =>
    editor.getApi(AIChatPlugin).aiChat.submit(input, { toolName });

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
          <Context variant="chat">{selectionText}</Context>
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
                      aria-label="Select tool"
                      type="button"
                      size="xs"
                      variant="outline"
                    >
                      <WrenchIcon />
                      {activeTool.label}
                      <ChevronDownIcon className="opacity-50" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-40"
                  >
                    <DropdownMenuRadioGroup
                      value={toolName ?? 'chat'}
                      onValueChange={(value) =>
                        setToolName(
                          value === 'chat'
                            ? null
                            : (value as Exclude<AIToolName, null>),
                        )
                      }
                    >
                      {TOOL_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.label}
                          value={option.value ?? 'chat'}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardFooter>
      </Card>
    </MessageScrollerProvider>
  );
}
