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
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { CircleAlertIcon } from 'lucide-react';
import {
  ErrorBoundary as ErrorBoundaryPrimitive,
  type FallbackProps,
} from 'react-error-boundary';

export function ErrorBoundary({
  message = '加载失败',
  children,
}: {
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryPrimitive
          onError={(error, info) => {
            console.error(error, info);
          }}
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => (
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
                  <Button size="sm" onClick={() => resetErrorBoundary()}>
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
          )}
        >
          {children}
        </ErrorBoundaryPrimitive>
      )}
    </QueryErrorResetBoundary>
  );
}
