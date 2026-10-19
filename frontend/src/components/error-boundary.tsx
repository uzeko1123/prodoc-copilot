import { DefaultError } from '@/components/default-error';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary as ErrorBoundaryPrimitive } from 'react-error-boundary';

export function ErrorBoundary({
  message,
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
          fallbackRender={({ error, resetErrorBoundary }) => (
            <DefaultError
              message={message}
              error={error}
              reset={resetErrorBoundary}
            />
          )}
        >
          {children}
        </ErrorBoundaryPrimitive>
      )}
    </QueryErrorResetBoundary>
  );
}
