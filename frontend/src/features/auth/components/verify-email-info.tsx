import { useAuthRegistrationVerifyEmailCreate } from '@/api/gen/endpoints/auth/auth';
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

const VERIFY_EMAIL_COUNTDOWN = 3;

export function VerifyEmailInfo({
  key_,
  className,
  ...props
}: { key_: string } & React.ComponentProps<'div'>) {
  const { mutate, isSuccess } = useAuthRegistrationVerifyEmailCreate({
    mutation: {
      onSuccess: () => {
        startCountdown(VERIFY_EMAIL_COUNTDOWN);
      },
    },
  });

  const navigate = useNavigate();

  const { countdown, startCountdown } = useCountdown(0, () => {
    if (isSuccess) {
      navigate({ to: '/account/login', replace: true });
    }
  });

  useMount(() => mutate({ data: { key: key_ } }));

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">验证邮箱</CardTitle>
          <CardDescription>
            {isSuccess ? (
              countdown > 0 ? (
                <>验证成功，将在 {countdown} 秒后跳转至登录界面……</>
              ) : (
                <>验证成功，即将跳转至登录界面……</>
              )
            ) : (
              <>正在验证邮箱……</>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
