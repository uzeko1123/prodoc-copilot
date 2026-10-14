import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { SidebarInset, SidebarProvider } from '@/components/shadcn/ui/sidebar';
import { AppSidebar } from '@/features/dashboard/components/app-sidebar';
import { SiteHeader } from '@/features/dashboard/components/site-header';
import { TaskList } from '@/features/dashboard/components/task-list';
import { queryClient } from '@/lib/query-client';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

function DashboardPage() {
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <TaskList />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: () => {
    const _withAuth = true;
    if (!_withAuth) return;
    void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
  },
  component: DashboardPage,
});
