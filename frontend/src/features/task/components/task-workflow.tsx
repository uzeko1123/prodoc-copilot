import {
  getMainTasksListQueryKey,
  getMainTasksRetrieveQueryKey,
  useMainTasksApproveCreate,
  useMainTasksResubmitCreate,
  useMainTasksSendBackCreate,
  useMainTasksSubmitCreate,
} from '@/api/gen/endpoints/main/main';
import type { Task, User } from '@/api/gen/models';
import { MainTasksSubmitCreateBody } from '@/api/gen/zod/main/main';
import { Button } from '@/components/shadcn/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/shadcn/ui/field';
import { Combobox, ComboboxInput } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserSelect } from '@/features/auth/components/user-select';
import { toastErrorMessage } from '@/lib/error-message';
import { setFormErrors } from '@/lib/form-errors';
import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export function TaskWorkflowDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (task.stage === 'final') return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {task.stage === 'editing' && (
          <TaskSubmitForm task={task} onClose={() => onOpenChange(false)} />
        )}
        {task.stage === 'review' && (
          <TaskReviewForm task={task} onClose={() => onOpenChange(false)} />
        )}
        {task.stage === 'revision' && (
          <TaskResubmitForm task={task} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskSubmitForm({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { control, formState, handleSubmit, setError } = useForm<
    z.infer<typeof MainTasksSubmitCreateBody>
  >({ resolver: zodResolver(MainTasksSubmitCreateBody) });

  const { mutate, isPending } = useMainTasksSubmitCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainTasksListQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getMainTasksRetrieveQueryKey(task.id),
        });
        onClose();
      },
      onError: (error) => {
        if (setFormErrors(error, MainTasksSubmitCreateBody, setError)) return;
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
        <DialogTitle>提交评审</DialogTitle>
        <DialogDescription>{task.name}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Controller
          name="reviewer"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="reviewer">评审人</FieldLabel>
              <UserSelect {...field} id="reviewer" placeholder="选择评审人" />
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
          提交
        </Button>
      </DialogFooter>
    </form>
  );
}

function TaskResubmitForm({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { mutate, isPending } = useMainTasksResubmitCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainTasksListQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getMainTasksRetrieveQueryKey(task.id),
        });
        onClose();
      },
      onError: (error) => {
        toastErrorMessage(error);
      },
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({ id: task.id });
      }}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>重新提交评审</DialogTitle>
        <DialogDescription>{task.name}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reviewer">评审人</FieldLabel>
          <Combobox
            value={task.reviewer}
            itemToStringLabel={(user: User) => user.full_name || user.username}
          >
            <ComboboxInput id="reviewer" placeholder="未指定" disabled />
          </Combobox>
        </Field>
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
          提交
        </Button>
      </DialogFooter>
    </form>
  );
}

function TaskReviewForm({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { mutate: approveMutate, isPending: approveIsPending } =
    useMainTasksApproveCreate({
      mutation: {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getMainTasksListQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getMainTasksRetrieveQueryKey(task.id),
          });
          onClose();
        },
        onError: (error) => {
          toastErrorMessage(error);
        },
      },
    });

  const { mutate: sendBackMutate, isPending: sendBackIsPending } =
    useMainTasksSendBackCreate({
      mutation: {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getMainTasksListQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getMainTasksRetrieveQueryKey(task.id),
          });
          onClose();
        },
        onError: (error) => {
          toastErrorMessage(error);
        },
      },
    });

  const isPending = approveIsPending || sendBackIsPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        approveMutate({ id: task.id });
      }}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>提交评审结论</DialogTitle>
        <DialogDescription>{task.name}</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="creator">创建者</FieldLabel>
          <Combobox
            value={task.creator}
            itemToStringLabel={(user: User) => user.full_name || user.username}
          >
            <ComboboxInput id="creator" placeholder="未知用户" disabled />
          </Combobox>
        </Field>
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
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => sendBackMutate({ id: task.id })}
        >
          退回
        </Button>
        <Button type="submit" disabled={approveIsPending}>
          通过
        </Button>
      </DialogFooter>
    </form>
  );
}
