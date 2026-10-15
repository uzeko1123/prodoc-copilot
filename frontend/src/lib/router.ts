import { Pending } from '@/components/pending';
import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: Pending,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
