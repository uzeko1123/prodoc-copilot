import { clearAuth } from '../lib/clear-auth';
import { Altcha } from './altcha-field';
import { useAuthPasswordChangeCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthPasswordChangeCreateBody } from '@/api/gen/zod/auth/auth';
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
import { useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

const CHANGE_PASSWORD_COUNTDOWN = 3;

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { control, formState, handleSubmit, setError, setValue } = useForm<
    z.infer<typeof AuthPasswordChangeCreateBody>
  >({ resolver: zodResolver(AuthPasswordChangeCreateBody) });

  const { mutate, isPending, isSuccess } = useAuthPasswordChangeCreate({
    mutation: {
      onSettled: () => {
        setValue('altcha', '');
      },
      onSuccess: () => {
        clearAuth();
        startCountdown(CHANGE_PASSWORD_COUNTDOWN);
      },
      onError: (error) => {
        if (setFormErrors(error, AuthPasswordChangeCreateBody, setError))
          return;
        toastErrorMessage(error);
      },
    },
  });

  const navigate = useNavigate();

  const { countdown, startCountdown } = useCountdown(0, () => {
    if (isSuccess) {
      navigate({ to: '/account/login', replace: true });
    }
  });

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">修改密码</CardTitle>
          {isSuccess && (
            <CardDescription>
              {countdown > 0 ? (
                <>密码已修改，将在 {countdown} 秒后跳转至登录界面……</>
              ) : (
                <>密码已修改，即将跳转至登录界面……</>
              )}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form
            id="change-password-form"
            onSubmit={handleSubmit((data) => mutate({ data }))}
          >
            <FieldGroup>
              <Controller
                name="old_password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password">旧密码</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="new_password1"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password1">新密码</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="password1"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="new_password2"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password2">确认密码</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="password2"
                      type="password"
                      autoComplete="new-password"
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
                  form="change-password-form"
                  disabled={isPending || isSuccess}
                >
                  修改密码
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
