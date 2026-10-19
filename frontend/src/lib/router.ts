import { DefaultError } from '@/components/default-error';
import { DefaultPending } from '@/components/default-pending';
import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  defaultPendingComponent: DefaultPending,
  defaultErrorComponent: DefaultError,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    headers?: string[];
  }
}
