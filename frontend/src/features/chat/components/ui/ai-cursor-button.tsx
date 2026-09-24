'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { AIChatPlugin } from '@platejs/ai/react';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@platejs/floating';
import { useComposedRef } from '@udecode/cn';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from 'lucide-react';
import { RangeApi } from 'platejs';
import {
  useEditorContainerRef,
  useEditorMounted,
  useEditorPlugin,
  useEditorSelection,
  useFocusedLast,
  usePluginOption,
  useScrollRef,
} from 'platejs/react';
import * as React from 'react';

export function AICursorButton() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const selection = useEditorSelection();

  const isFocusedLast = useFocusedLast();
  const isAIMenuClose = !usePluginOption(AIChatPlugin, 'open') && isFocusedLast;
  const isCursor = RangeApi.isCollapsed(selection);

  const floating = useVirtualFloating({
    getBoundingClientRect: () => {
      if (selection) {
        const rangeRect = getRangeBoundingClientRect(editor, selection);
        if (rangeRect) return rangeRect;
      }
      return getDefaultBoundingClientRect();
    },
    middleware: [offset(1)],
    placement: 'bottom',
  });

  const ref = useComposedRef<HTMLDivElement>(floating.refs.setFloating);

  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const containerRef = useEditorContainerRef();
  const { update } = floating;

  React.useEffect(() => {
    void update();
  }, [selection, update]);

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

  if (!isAIMenuClose || !selection) return null;

  return (
    <div
      ref={ref}
      className="z-40 flex flex-col items-center"
      style={floating.style}
    >
      {isCursor ? (
        <ChevronUpIcon className="-my-0.5 size-3.5" />
      ) : (
        <ChevronDownIcon className="-my-0.5 size-3.5" />
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="outline"
              aria-label="AI commands"
              className="rounded-full opacity-50 shadow-md hover:opacity-80"
              onClick={() => {
                api.aiChat.show();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              <SparklesIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            AI commands
            <kbd className="bg-border text-muted-foreground ml-1 rounded px-1 font-mono text-[10px] shadow-sm">
              Ctrl+Q
            </kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
