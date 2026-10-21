import {
  getAuthUserRetrieveQueryKey,
  useAuthUserPartialUpdate,
} from '@/api/gen/endpoints/auth/auth';
import type { UserDetails } from '@/api/gen/models';
import { AuthUserPartialUpdateBody } from '@/api/gen/zod/auth/auth';
import { Button } from '@/components/shadcn/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUploadFile } from '@/hooks/use-upload-file';
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from 'cn';
import { PencilIcon } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';
import { z } from 'zod';
import { UserAvatar } from './user-avatar';

export function UserDetailsForm({
  user,
  onSuccess,
  onCancel,
}: {
  user: UserDetails;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { control, formState, handleSubmit, setValue, setError } = useForm<
    z.infer<typeof AuthUserPartialUpdateBody>
  >({
    resolver: zodResolver(AuthUserPartialUpdateBody),
    defaultValues: {
      full_name: user.full_name ?? '',
      avatar: user.avatar,
    },
  });

  const { mutate, isPending } = useAuthUserPartialUpdate({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getAuthUserRetrieveQueryKey(), data);
        toast.success('用户信息已保存');
        onSuccess();
      },
      onError: (error) => {
        if (setFormErrors(error, AuthUserPartialUpdateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  const { isUploading, uploadFile } = useUploadFile({
    onUploadComplete: (file) =>
      setValue('avatar', file.url, { shouldValidate: true }),
  });

  const { openFilePicker } = useFilePicker({
    accept: ['image/*'],
    multiple: false,
    onFilesSelected: ({ plainFiles }) => {
      void uploadFile(plainFiles[0]);
    },
  });

  const avatar = useWatch({ control, name: 'avatar' });

  return (
    <form
      onSubmit={handleSubmit((data) => mutate({ data }))}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>修改用户信息</DialogTitle>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <button
            type="button"
            className="group mx-auto size-16! rounded-full outline-none"
            disabled={isUploading}
            onClick={openFilePicker}
            aria-label="上传头像"
          >
            <UserAvatar
              user={user}
              src={avatar ?? user.avatar}
              className="size-full"
            >
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity [&>svg]:size-5',
                  isUploading
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                )}
              >
                {isUploading ? <Spinner /> : <PencilIcon />}
              </span>
            </UserAvatar>
          </button>
          {formState.errors.avatar && (
            <FieldError errors={[formState.errors.avatar]} />
          )}
        </Field>
        <Controller
          name="full_name"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="full_name">名字</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="full_name"
                placeholder="名字"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {formState.errors.root && (
          <Field>
            <FieldError errors={[formState.errors.root]} />
          </Field>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
        >
          取消
        </Button>
        <Button type="submit" disabled={isPending || isUploading}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}
