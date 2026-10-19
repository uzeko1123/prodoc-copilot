import { Button } from '@/components/shadcn/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { getErrorMessage } from '@/lib/error-message';
import { CircleAlertIcon } from 'lucide-react';

export function DefaultError({
  message = '加载失败',
  error,
  reset,
}: {
  message?: string;
  error: unknown;
  reset: () => void;
}) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{message}</EmptyTitle>
        <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => reset()}>
            重试
          </Button>
          {window.history.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}
