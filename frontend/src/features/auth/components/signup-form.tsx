import { Altcha } from './altcha-field';
import { useAuthRegistrationCreate } from '@/api/gen/endpoints/auth/auth';
import { AuthRegistrationCreateBody } from '@/api/gen/zod/auth/auth';
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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { control, formState, handleSubmit, setError, setValue } = useForm<
    z.infer<typeof AuthRegistrationCreateBody>
  >({ resolver: zodResolver(AuthRegistrationCreateBody) });

  const { mutate, isPending, isSuccess } = useAuthRegistrationCreate({
    mutation: {
      onSettled: () => {
        setValue('altcha', '');
      },
      onSuccess: (_data, variables) => {
        navigate({
          to: '/account/resend-email',
          search: { email: variables.data.email },
          replace: true,
        });
      },
      onError: (error) => {
        if (setFormErrors(error, AuthRegistrationCreateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">创建账号</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="signup-form"
            onSubmit={handleSubmit((data) => mutate({ data }))}
          >
            <FieldGroup>
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="username">用户名</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="username"
                      type="text"
                      placeholder="用户名"
                      autoComplete="username"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
                name="password1"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password1">密码</FieldLabel>
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
                name="password2"
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
                  form="signup-form"
                  disabled={isPending || isSuccess}
                >
                  创建账号
                </Button>
                <FieldDescription className="text-center">
                  已有账号？<Link to="/account/login">登录</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="text-center">
        创建账号，即表示您同意
        <Link to=".">《服务条款》</Link>和<Link to=".">《隐私政策》</Link>。
      </FieldDescription>
    </div>
  );
}
