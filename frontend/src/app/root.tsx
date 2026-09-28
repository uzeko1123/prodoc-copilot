import { getAuthCsrfRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { queryClient } from '@/lib/query-client';
import { noop } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  beforeLoad: () => {
    void queryClient
      .query(
        getAuthCsrfRetrieveQueryOptions({ query: { staleTime: Infinity } }),
      )
      .catch(noop);
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
