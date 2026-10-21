import {
  getMainTasksListQueryKey,
  getMainTasksRetrieveQueryKey,
  useMainTasksCreate,
  useMainTasksPartialUpdate,
} from '@/api/gen/endpoints/main/main';
import type { Task } from '@/api/gen/models';
import {
  MainTasksCreateBody,
  MainTasksPartialUpdateBody,
} from '@/api/gen/zod/main/main';
import { Button } from '@/components/shadcn/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export function TaskCreateForm({ onClose }: { onClose: () => void }) {
  const { control, formState, handleSubmit, setError } = useForm<
    z.infer<typeof MainTasksCreateBody>
  >({ resolver: zodResolver(MainTasksCreateBody) });

  const { mutate, isPending } = useMainTasksCreate({
    mutation: {
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: getMainTasksListQueryKey(),
        });
        onClose();
        void navigate({
          to: '/workbench/$taskId',
          params: { taskId: data.id },
          search: { role: 'creator' },
        });
      },
      onError: (error) => {
        if (setFormErrors(error, MainTasksCreateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  const navigate = useNavigate();

  return (
    <form
      onSubmit={handleSubmit((data) => mutate({ data }))}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>新建文档</DialogTitle>
      </DialogHeader>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="name">文档名称</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="name"
                placeholder="文档名称"
                required
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
          onClick={onClose}
        >
          取消
        </Button>
        <Button type="submit" disabled={isPending}>
          创建
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TaskUpdateForm({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { control, formState, handleSubmit, setError } = useForm<
    z.infer<typeof MainTasksPartialUpdateBody>
  >({
    resolver: zodResolver(MainTasksPartialUpdateBody),
    defaultValues: { name: task.name },
  });

  const { mutate, isPending } = useMainTasksPartialUpdate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainTasksListQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getMainTasksRetrieveQueryKey(task.id),
        });
        toast.success('文档信息已保存');
        onClose();
      },
      onError: (error) => {
        if (setFormErrors(error, MainTasksPartialUpdateBody, setError)) return;
        toastErrorMessage(error);
      },
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutate({ id: task.id, data }))}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>文档信息</DialogTitle>
        <DialogDescription>{task.name}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="name">名称</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="name"
                placeholder="文档名称"
                required
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
          onClick={onClose}
        >
          取消
        </Button>
        <Button type="submit" disabled={isPending}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}
