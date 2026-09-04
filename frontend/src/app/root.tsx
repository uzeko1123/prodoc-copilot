import { getAuthCsrfRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { queryClient } from '@/lib/query-client';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  beforeLoad: () => {
    queryClient.fetchQuery(getAuthCsrfRetrieveQueryOptions());
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
