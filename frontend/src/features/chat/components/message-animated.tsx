'use client';

import { Bubble, BubbleContent } from '@/components/shadcn/ui/bubble';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/shadcn/ui/collapsible';
import { Message, MessageContent } from '@/components/shadcn/ui/message';
import { MessageScrollerItem } from '@/components/shadcn/ui/message-scroller';
import { Spinner } from '@/components/shadcn/ui/spinner';
import type { MessageAnimationPreset } from '@/lib/shadcn/message-animations';
import { MESSAGE_ANIMATIONS } from '@/lib/shadcn/message-animations';
import type { ToolUIPart } from 'ai';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BrainIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
import { formatTokens, getParagraphs, getToolPartName } from '../lib/utils';
import { Context } from './context';
import type { Tools } from './editor/agent/tools';
import type { ChatMessage } from './editor/use-agent';
import { AIChatEditor } from './ui/ai-chat-editor';
import { cn } from 'cn';

const MotionMessageScrollerItem = motion.create(MessageScrollerItem);

function MessageAnimated({
  message,
  animationPreset = MESSAGE_ANIMATIONS['slide-up'],
  assistantVariant = 'ghost',
  scrollAnchor,
  userVariant = 'muted',
  ...props
}: Omit<
  React.ComponentProps<typeof MotionMessageScrollerItem>,
  'animate' | 'children' | 'exit' | 'initial' | 'messageId' | 'variants'
> & {
  animationPreset?: MessageAnimationPreset;
  assistantVariant?: React.ComponentProps<typeof Bubble>['variant'];
  message: ChatMessage;
  userVariant?: React.ComponentProps<typeof Bubble>['variant'];
}) {
  const shouldReduceMotion = useReducedMotion();
  const isUserMessage = message.role === 'user';

  if (isUserMessage) {
    return (
      <MotionMessageScrollerItem
        messageId={message.id}
        scrollAnchor={scrollAnchor ?? true}
        variants={animationPreset.variants}
        initial={shouldReduceMotion ? false : 'initial'}
        animate="animate"
        exit={shouldReduceMotion ? undefined : 'exit'}
        {...props}
      >
        <MessageAnimatedRow
          message={message}
          assistantVariant={assistantVariant}
          userVariant={userVariant}
        />
      </MotionMessageScrollerItem>
    );
  }

  return (
    <MotionMessageScrollerItem
      messageId={message.id}
      scrollAnchor={scrollAnchor}
      initial={false}
      {...props}
    >
      <MessageAnimatedRow
        message={message}
        assistantVariant={assistantVariant}
        userVariant={userVariant}
      />
    </MotionMessageScrollerItem>
  );
}

function MessageAnimatedRow({
  message,
  assistantVariant,
  userVariant,
}: {
  assistantVariant: React.ComponentProps<typeof Bubble>['variant'];
  message: ChatMessage;
  userVariant: React.ComponentProps<typeof Bubble>['variant'];
}) {
  return (
    <Message align={message.role === 'user' ? 'end' : 'start'}>
      <MessageContent>
        {message.parts.map((part, index) => {
          if (message.role === 'user') {
            if (part.type !== 'text') return;
            return (
              <Bubble key={index} variant={userVariant}>
                <BubbleContent className="space-y-2">
                  {message.metadata?.selectionText && (
                    <Context variant="message">
                      {message.metadata.selectionText}
                    </Context>
                  )}
                  {getParagraphs(part.text).map((paragraph, paragraphIndex) => (
                    <p
                      key={`${index}-${paragraphIndex}`}
                      className="whitespace-pre-wrap"
                    >
                      {paragraph}
                    </p>
                  ))}
                </BubbleContent>
              </Bubble>
            );
          }
          if (part.type === 'text') {
            return (
              <Bubble key={index} variant={assistantVariant}>
                <BubbleContent className="space-y-2">
                  <AIChatEditor content={part.text} />
                </BubbleContent>
              </Bubble>
            );
          }
          if (part.type === 'reasoning') {
            return (
              <Collapsible
                key={index}
                defaultOpen={false}
                className="text-muted-foreground group w-full"
              >
                <CollapsibleTrigger className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                  <BrainIcon className="size-3.5" />
                  Reasoning
                  <ChevronDownIcon className="size-3.5 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-muted-foreground/30 space-y-1.5 border-l-2 py-1 pl-3 text-sm">
                  <AIChatEditor content={part.text} />
                </CollapsibleContent>
              </Collapsible>
            );
          }
          if (part.type.startsWith('tool-')) {
            const toolPart = part as ToolUIPart<Tools>;
            return (
              <>
                <Collapsible
                  key={index}
                  defaultOpen={false}
                  className="text-muted-foreground group w-full"
                >
                  <CollapsibleTrigger
                    className={cn(
                      'mb-1 flex items-center gap-1.5 text-xs font-medium',
                      toolPart.state === 'output-error' && 'text-destructive',
                    )}
                  >
                    {toolPart.state === 'output-available' ? (
                      <CheckIcon className="size-3.5" />
                    ) : toolPart.state === 'output-error' ? (
                      <CircleAlertIcon className="text-destructive size-3.5" />
                    ) : (
                      <Spinner className="size-3.5" />
                    )}
                    {getToolPartName(toolPart)}
                    <ChevronDownIcon className="size-3.5 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-muted-foreground/30 space-y-1.5 border-l-2 py-1 pl-3 text-sm">
                    {toolPart.state === 'input-available' ? (
                      <pre className="font-mono">
                        {JSON.stringify(toolPart.input)}
                      </pre>
                    ) : toolPart.state === 'output-available' ? (
                      <AIChatEditor content={toolPart.output} />
                    ) : toolPart.state === 'output-error' ? (
                      getParagraphs(toolPart.errorText).map(
                        (paragraph, paragraphIndex) => (
                          <p
                            key={`${index}-${paragraphIndex}`}
                            className="whitespace-pre-wrap"
                          >
                            {paragraph}
                          </p>
                        ),
                      )
                    ) : (
                      <p>Executing...</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </>
            );
          }
        })}
        {message.metadata?.usage && (
          <div className="text-muted-foreground flex w-full items-center gap-1.5 text-xs">
            {message.metadata.usage.inputTokens && (
              <span className="flex items-center gap-0.5">
                <ArrowUpIcon className="size-3" />
                {formatTokens(message.metadata.usage.inputTokens)}
              </span>
            )}
            {message.metadata.usage.outputTokens && (
              <span className="flex items-center gap-0.5">
                <ArrowDownIcon className="size-3" />
                {formatTokens(message.metadata.usage.outputTokens)}
              </span>
            )}
          </div>
        )}
      </MessageContent>
    </Message>
  );
}

export { MessageAnimated };
