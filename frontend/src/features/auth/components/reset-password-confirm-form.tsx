import { clearAuth } from '../lib/clear-auth';
import { Altcha } from './altcha-field';
import { useAuthPasswordResetConfirmCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthPasswordResetConfirmCreateBody } from '@/api/gen/zod/auth/auth';
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

const RESET_PASSWORD_CONFIRM_COUNTDOWN = 3;

export function ResetPasswordConfirmForm({
  uid,
  token,
  className,
  ...props
}: { uid: string; token: string } & React.ComponentProps<'div'>) {
  const {
    control,
    formState,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
  } = useForm<z.infer<typeof AuthPasswordResetConfirmCreateBody>>({
    resolver: zodResolver(AuthPasswordResetConfirmCreateBody),
    defaultValues: { uid: uid, token: token },
  });

  const uidFieldState = getFieldState('uid', formState);
  const tokenFieldState = getFieldState('token', formState);

  const { mutate, isPending, isSuccess } = useAuthPasswordResetConfirmCreate({
    mutation: {
      onSettled: () => {
        setValue('altcha', '');
      },
      onSuccess: () => {
        clearAuth();
        startCountdown(RESET_PASSWORD_CONFIRM_COUNTDOWN);
      },
      onError: (error) => {
        if (setFormErrors(error, AuthPasswordResetConfirmCreateBody, setError))
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
          <CardTitle className="text-xl">重置密码</CardTitle>
          {isSuccess && (
            <CardDescription>
              {countdown > 0 ? (
                <>密码已重置，将在 {countdown} 秒后跳转至登录界面……</>
              ) : (
                <>密码已重置，即将跳转至登录界面……</>
              )}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form
            id="reset-password-confirm-form"
            onSubmit={handleSubmit((data) => mutate({ data }))}
          >
            <FieldGroup>
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
                {uidFieldState.invalid && (
                  <FieldError errors={[uidFieldState.error]} />
                )}
                {tokenFieldState.invalid && (
                  <FieldError errors={[tokenFieldState.error]} />
                )}
                {formState.errors.root && (
                  <FieldError errors={[formState.errors.root]} />
                )}
                <Button
                  type="submit"
                  form="reset-password-confirm-form"
                  disabled={isPending || isSuccess}
                >
                  重置密码
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
