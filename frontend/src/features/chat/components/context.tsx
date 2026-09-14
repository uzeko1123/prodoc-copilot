import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { QuoteIcon } from 'lucide-react';
import { NodeApi, RangeApi } from 'platejs';
import { useEditorRef, useEditorSelection } from 'platejs/react';

export function Context() {
  const editor = useEditorRef();

  const selection = useEditorSelection();
  if (!selection || RangeApi.isCollapsed(selection)) return;

  const text = editor.api
    .fragment(selection)
    .map((node) => NodeApi.string(node).trim())
    .filter((text) => text !== '')
    .join('\n');
  if (!text) return;

  return (
    <div className="flex w-full gap-1 rounded-lg border p-2">
      <QuoteIcon
        className="text-muted-foreground size-2 rotate-180"
        aria-hidden="true"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-muted-foreground line-clamp-3 flex-1 text-sm whitespace-pre-wrap">
            {text}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="whitespace-pre-wrap">{text}</p>
        </TooltipContent>
      </Tooltip>
      <QuoteIcon
        className="text-muted-foreground size-2 self-end"
        aria-hidden="true"
      />
    </div>
  );
}
