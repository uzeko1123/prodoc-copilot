import { NavSecondary } from '@/components/shadcn/nav-secondary';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/shadcn/ui/sidebar';
import {
  CircleHelpIcon,
  CommandIcon,
  ListIcon,
  Settings2Icon,
} from 'lucide-react';
import * as React from 'react';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

// 后续功能扩展：在 navMain / navSecondary 数组中添加导航项即可
const data = {
  navMain: [
    {
      title: '任务',
      url: '/dashboard',
      icon: <ListIcon />,
    },
  ],
  navSecondary: [
    {
      title: '设置',
      url: '#',
      icon: <Settings2Icon />,
    },
    {
      title: '帮助',
      url: '#',
      icon: <CircleHelpIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">ProDoc Copilot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
