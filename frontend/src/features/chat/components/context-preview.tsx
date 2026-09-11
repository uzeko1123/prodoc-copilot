import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { useEditorStore, useContextStore } from '@/features/editor/stores';
import { QuoteIcon } from 'lucide-react';

export function ContextPreview() {
  const editor = useEditorStore((state) => state.editor);
  const range = useContextStore((state) => state.selection);

  if (!editor || !range) return;

  const selection = editor.state.doc.textBetween(range.from, range.to, '\n');
  if (!selection) return;

  return (
    <div className="flex w-full gap-1 rounded-lg border p-2">
      <QuoteIcon
        className="size-2 rotate-180 text-muted-foreground"
        aria-hidden="true"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="flex-1 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {selection.trim()}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="whitespace-pre-wrap">{selection.trim()}</p>
        </TooltipContent>
      </Tooltip>
      <QuoteIcon
        className="size-2 self-end text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
