import { getErrorMessage } from '@/lib/error-message';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import {
  ErrorBoundary as ErrorBoundaryPrimitive,
  type FallbackProps,
} from 'react-error-boundary';

export function ErrorBoundary({
  title = '加载失败',
  children,
}: {
  title?: string;
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
            <div role="alert">
              <p>{title}</p>
              <pre>{getErrorMessage(error)}</pre>
              <button onClick={resetErrorBoundary}>重试</button>
            </div>
          )}
        >
          {children}
        </ErrorBoundaryPrimitive>
      )}
    </QueryErrorResetBoundary>
  );
}
