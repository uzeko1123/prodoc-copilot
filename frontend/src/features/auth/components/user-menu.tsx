import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shadcn/ui/alert-dialog';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import { cn } from 'cn';
import { CircleUserRoundIcon, LogOutIcon } from 'lucide-react';
import * as React from 'react';
import { UserAvatar } from './user-avatar';
import { UserDetailsDialog } from './user-details-dialog';

export function UserMenu({
  side = 'bottom',
  align = 'end',
  className,
}: {
  side?: React.ComponentProps<typeof DropdownMenuContent>['side'];
  align?: React.ComponentProps<typeof DropdownMenuContent>['align'];
  className?: string;
}) {
  const { data: user } = useAuthUserRetrieve();
  const navigate = useNavigate();
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] =
    React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn('h-auto py-2', className)}>
            <UserAvatar user={user} className="size-8" />
            <div className="grid flex-1 text-left leading-tight">
              <span className="font-medium">
                {user.full_name || user.username}
              </span>
              <span className="text-muted-foreground text-xs">
                {user.username}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align} sideOffset={4}>
          <DropdownMenuItem onSelect={() => setUserDetailsDialogOpen(true)}>
            <CircleUserRoundIcon />
            账号信息
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLogoutDialogOpen(true)}>
            <LogOutIcon />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetailsDialog
        open={userDetailsDialogOpen}
        onOpenChange={setUserDetailsDialogOpen}
      />

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>退出登录</AlertDialogTitle>
            <AlertDialogDescription>
              确定要退出当前账号吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate({ to: '/account/logout' })}
            >
              退出登录
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
