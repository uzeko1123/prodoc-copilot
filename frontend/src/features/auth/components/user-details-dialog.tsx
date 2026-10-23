import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from '@tanstack/react-router';
import * as React from 'react';
import { UserAvatar } from './user-avatar';
import { UserDetailsForm } from './user-details-form';

export function UserDetailsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: me } = useAuthUserRetrieve();

  const [mode, setMode] = React.useState<'view' | 'modify'>('view');

  if (!me) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setMode('view');
        onOpenChange(open);
      }}
    >
      <DialogContent>
        {mode === 'view' ? (
          <>
            <DialogHeader>
              <DialogTitle>用户信息</DialogTitle>
            </DialogHeader>
            <UserAvatar user={me} className="mx-auto size-16" />
            <div className="flex flex-col gap-1 text-center">
              <span className="text-lg font-medium">
                {me.full_name || me.username}
              </span>
              <span className="text-muted-foreground text-sm">
                {me.username}
              </span>
              <span className="text-muted-foreground text-sm break-all">
                {me.email}
              </span>
            </div>
            <DialogFooter>
              <Button asChild variant="outline">
                <Link to="/account/change-password">修改密码</Link>
              </Button>
              <Button onClick={() => setMode('modify')}>修改信息</Button>
            </DialogFooter>
          </>
        ) : (
          <UserDetailsForm
            user={me}
            onCancel={() => setMode('view')}
            onSuccess={() => setMode('view')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
