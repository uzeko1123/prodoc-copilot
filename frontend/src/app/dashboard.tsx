import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { ErrorBoundary } from '@/components/error-boundary';
import { SidebarInset, SidebarProvider } from '@/components/shadcn/ui/sidebar';
import { AppSidebar } from '@/features/dashboard/components/app-sidebar';
import { SiteHeader } from '@/features/dashboard/components/site-header';
import { queryClient } from '@/lib/query-client';
import { noop } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ cause }) => {
    if (cause === 'preload') return;
    void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
  },
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

function Dashboard() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex-1 px-4 lg:px-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
