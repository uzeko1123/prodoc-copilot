import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/shadcn/ui/card';
import { cn } from '@/lib/shadcn/utils';

export function UserInfo({ className, ...props }: React.ComponentProps<'div'>) {
  const { data } = useAuthUserRetrieve();
  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">用户信息</CardTitle>
          <CardDescription>{data?.email}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
