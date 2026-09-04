import { useAuthRegistrationResendEmailCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthRegistrationResendEmailCreateBody } from '@/api/gen/zod/auth/auth';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/shadcn/ui/field';
import { useCountdown } from '@/hooks/use-countdown';
import { useMount } from '@/hooks/use-mount';
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { cn } from '@/lib/shadcn/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const RESEND_EMAIL_COOLDOWN = 60;

export function ResendEmailForm({
  email,
  resend,
  className,
  ...props
}: {
  email: string;
  resend: boolean | undefined;
} & React.ComponentProps<'div'>) {
  const { formState, handleSubmit, setError, getFieldState } = useForm<
    z.infer<typeof AuthRegistrationResendEmailCreateBody>
  >({
    resolver: zodResolver(AuthRegistrationResendEmailCreateBody),
    defaultValues: { email },
  });

  const emailFieldState = getFieldState('email', formState);

  const { mutate, isPending, isSuccess, isError } =
    useAuthRegistrationResendEmailCreate({
      mutation: {
        onSuccess: () => {
          startCountdown(RESEND_EMAIL_COOLDOWN);
        },
        onError: (error) => {
          if (
            setFormErrors(
              error,
              AuthRegistrationResendEmailCreateBody,
              setError,
            )
          )
            return;
          toastErrorMessage(error);
        },
      },
    });

  const { countdown, startCountdown } = useCountdown();

  useMount(() => {
    if (resend) mutate({ data: { email } });
    else startCountdown(RESEND_EMAIL_COOLDOWN);
  });

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">验证邮箱</CardTitle>
          <CardDescription>
            {isSuccess || (!resend && !isError) ? (
              <>
                验证链接已发送至 <a href={`mailto:${email}`}>{email}</a>。
              </>
            ) : (
              <a href={`mailto:${email}`}>{email}</a>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="resend-email-form"
            onSubmit={handleSubmit((data) => mutate({ data }))}
          >
            <FieldGroup>
              <Field>
                {emailFieldState.invalid && (
                  <FieldError errors={[emailFieldState.error]} />
                )}
                {formState.errors.root && (
                  <FieldError errors={[formState.errors.root]} />
                )}
                <Button
                  type="submit"
                  form="resend-email-form"
                  disabled={isPending || countdown > 0}
                >
                  {countdown > 0 ? (
                    <>{countdown} 秒后可再次发送</>
                  ) : (
                    <>发送验证邮件</>
                  )}
                </Button>
                <FieldDescription className="text-center">
                  遇到问题？<Link to=".">联系我们</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
