import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/shadcn/ui/breadcrumb';
import { Separator } from '@/components/shadcn/ui/separator';
import { SidebarTrigger } from '@/components/shadcn/ui/sidebar';
import { useMatches } from '@tanstack/react-router';
import { Fragment } from 'react';

export function SiteHeader() {
  const matches = useMatches();
  const headers = matches.findLast((match) => match.staticData.headers)
    ?.staticData.headers ?? ['ProDoc Copilot'];

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2" />
        <Breadcrumb>
          <BreadcrumbList>
            {headers.map((header, index) => (
              <Fragment key={header}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === headers.length - 1 ? (
                    <BreadcrumbPage className="font-medium">
                      {header}
                    </BreadcrumbPage>
                  ) : (
                    header
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
