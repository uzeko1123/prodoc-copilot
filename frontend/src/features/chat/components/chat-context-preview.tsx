'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { useContextStore, useEditorStore } from '@/features/editor/stores';
import { ScanSearchIcon, XIcon } from 'lucide-react';

const MAX_PREVIEW_CHARS = 160;

export function ChatContextPreview() {
  const editor = useEditorStore((state) => state.editor);
  const context = useContextStore((state) => state.context);
  const setContext = useContextStore((state) => state.setContext);

  if (!editor || !context || context.target !== 'chat') return;

  const selection = editor.state.doc.textBetween(context.range.from,  context.range.to, '\n');

  if (!selection) return;

  const truncated =
    selection.length > MAX_PREVIEW_CHARS
      ? selection.slice(0, MAX_PREVIEW_CHARS) + '…'
      : selection;

  return (
    <div className="flex w-full items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      <ScanSearchIcon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">
          Sending selection to AI
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="line-clamp-2 whitespace-pre-wrap wrap-break-word text-sm">
              {truncated}
            </p>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <p className="whitespace-pre-wrap wrap-break-word">{selection}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear selection context"
            className="shrink-0"
            onClick={() => setContext(null)}
          >
            <XIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Clear</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
