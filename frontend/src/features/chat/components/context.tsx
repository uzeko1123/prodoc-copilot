import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { cn } from 'cn';
import { QuoteIcon } from 'lucide-react';
import * as React from 'react';

export function Context({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'chat' | 'message';
}) {
  if (!children) return;

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
            {children}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="whitespace-pre-wrap">{children}</p>
        </TooltipContent>
      </Tooltip>
      <QuoteIcon
        className="text-muted-foreground size-2 self-end"
        aria-hidden="true"
      />
    </div>
  );
}
