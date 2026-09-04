import { useAuthStore } from '../stores';
import { Altcha } from './altcha-field';
import { useAuthLoginCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthLoginCreateBody } from '@/api/gen/zod/auth/auth';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
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
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { cn } from '@/lib/shadcn/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { control, formState, handleSubmit, setError, setValue, getValues } =
    useForm<z.infer<typeof AuthLoginCreateBody>>({
      resolver: zodResolver(AuthLoginCreateBody),
    });

  const { mutate, isPending, isSuccess } = useAuthLoginCreate({
    mutation: {
      onSettled: () => {
        setValue('altcha', '');
      },
      onSuccess: (data) => {
        useAuthStore.setState({ user: data.user });
        navigate({ to: '/account', replace: true });
      },
      onError: (error) => {
        const emailUnverified = (
          error.response?.data as { non_field_errors?: string[] } | undefined
        )?.non_field_errors?.includes('邮箱未验证。'); // HACK
        if (emailUnverified) {
          setError('root', {
            type: 'EmailUnverified',
            message: '邮箱未验证。',
          });
          return;
        }
        if (setFormErrors(error, AuthLoginCreateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
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
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">密码</FieldLabel>
                      <FieldDescription>
                        <Link to="/account/reset-password">忘记密码</Link>？
                      </FieldDescription>
                    </div>
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
                {formState.errors.root &&
                  (formState.errors.root.type === 'EmailUnverified' ? (
                    <FieldError>
                      邮箱未验证。
                      <Link
                        to="/account/resend-email"
                        search={{ email: getValues('email')!, resend: true }}
                        className="underline underline-offset-4"
                      >
                        重新验证
                      </Link>
                    </FieldError>
                  ) : (
                    <FieldError errors={[formState.errors.root]} />
                  ))}
                <Button
                  type="submit"
                  form="login-form"
                  disabled={isPending || isSuccess}
                >
                  登录
                </Button>
                <FieldDescription className="text-center">
                  没有账号？<Link to="/account/signup">创建账号</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="text-center">{__VERSION__}</FieldDescription>
    </div>
  );
}
