import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { useAuthStore } from '@/features/auth/stores';
import { Link } from '@tanstack/react-router';

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{value ?? '-'}</span>
    </div>
  );
}

export function UserInfoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useAuthStore((state) => state.user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>用户信息</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <InfoRow label="用户名" value={user?.username} />
          <InfoRow label="邮箱" value={user?.email} />
          <InfoRow label="ID" value={user?.pk} />
        </div>
        <DialogFooter>
          <Button asChild variant="outline">
            <Link to="/account/change-password">修改密码</Link>
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
