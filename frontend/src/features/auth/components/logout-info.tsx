import { clearAuth } from '../lib/clear-auth';
import { useAuthLogoutCreate } from '@/api/gen/endpoints/auth/auth';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { useCountdown } from '@/hooks/use-countdown';
import { useMount } from '@/hooks/use-mount';
import { cn } from '@/lib/shadcn/utils';
import { useNavigate } from '@tanstack/react-router';

const LOGOUT_COUNTDOWN = 3;

export function LogoutInfo({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { mutate, isSuccess } = useAuthLogoutCreate({
    mutation: {
      onSuccess: () => {
        clearAuth();
        startCountdown(LOGOUT_COUNTDOWN);
      },
    },
  });

  const navigate = useNavigate();

  const { countdown, startCountdown } = useCountdown(0, () => {
    if (isSuccess) {
      navigate({ to: '/account/login', replace: true });
    }
  });

  useMount(() => mutate());

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">退出登录</CardTitle>
          <CardDescription>
            {isSuccess ? (
              countdown > 0 ? (
                <>将在 {countdown} 秒后退出登录……</>
              ) : (
                <>即将退出登录……</>
              )
            ) : (
              <>正在退出登录……</>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
