import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { cn } from 'cn';
import { QuoteIcon } from 'lucide-react';

export function Context({
  content,
  variant,
}: {
  content: string;
  variant: 'chat' | 'message';
}) {
  if (!content) return null;

  return (
    <div className="flex w-full gap-1 rounded-lg border p-2">
      <QuoteIcon
        className="text-muted-foreground size-2 rotate-180"
        aria-hidden="true"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            className={cn(
              'text-muted-foreground flex-1 text-xs whitespace-pre-wrap',
              variant === 'chat' ? 'line-clamp-3' : 'line-clamp-1',
            )}
          >
            {content}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="whitespace-pre-wrap">{content}</p>
        </TooltipContent>
      </Tooltip>
      <QuoteIcon
        className="text-muted-foreground size-2 self-end"
        aria-hidden="true"
      />
    </div>
  );
}
