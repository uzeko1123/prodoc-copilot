import { Altcha } from './altcha-field';
import { useAuthPasswordResetCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthPasswordResetCreateBody } from '@/api/gen/zod/auth/auth';
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
  FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { useCountdown } from '@/hooks/use-countdown';
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { cn } from '@/lib/shadcn/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

const RESET_PASSWORD_COOLDOWN = 60;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { control, formState, handleSubmit, setError, setValue } = useForm<
    z.infer<typeof AuthPasswordResetCreateBody>
  >({ resolver: zodResolver(AuthPasswordResetCreateBody) });

  const { mutate, isPending, isSuccess } = useAuthPasswordResetCreate({
    mutation: {
      onSettled: () => {
        setValue('altcha', '');
      },
      onSuccess: () => {
        startCountdown(RESET_PASSWORD_COOLDOWN);
      },
      onError: (error) => {
        if (setFormErrors(error, AuthPasswordResetCreateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  const { countdown, startCountdown } = useCountdown();

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">重置密码</CardTitle>
          {isSuccess && (
            <CardDescription>确认链接已发送至邮箱。</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form
            id="reset-password-form"
            onSubmit={handleSubmit((data) => mutate({ data }))}
          >
            <FieldGroup>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">邮箱</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="email"
                      type="email"
                      placeholder="username@example.com"
                      autoComplete="email"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="altcha"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="-mb-5">
                    <Altcha {...field} value={field.value ?? ''} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                {formState.errors.root && (
                  <FieldError errors={[formState.errors.root]} />
                )}
                <Button
                  type="submit"
                  form="reset-password-form"
                  disabled={isPending || countdown > 0}
                >
                  {countdown > 0 ? (
                    <>{countdown} 秒后可再次发送</>
                  ) : (
                    <>发送确认邮件</>
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
