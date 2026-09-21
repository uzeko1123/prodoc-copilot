import '@/assets/index.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/shadcn/ui/sonner';
import { TooltipProvider } from '@/components/shadcn/ui/tooltip';
import { queryClient } from '@/lib/query-client';
import { router } from '@/lib/router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <div className="hidden">{__VERSION__}</div>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools />
          </TooltipProvider>
          <Toaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
