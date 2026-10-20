import {
  getMainTasksListQueryKey,
  getMainTasksRetrieveQueryKey,
  useMainTasksDestroy,
} from '@/api/gen/endpoints/main/main';
import type { Task } from '@/api/gen/models';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shadcn/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/shadcn/ui/dialog';
import { queryClient } from '@/lib/query-client';
import { toast } from 'sonner';
import { TaskCreateForm, TaskUpdateForm } from './task-form';

export function TaskCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <TaskCreateForm
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function TaskUpdateDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <TaskUpdateForm
          task={task}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function TaskDeleteDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate, isPending } = useMainTasksDestroy({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainTasksListQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getMainTasksRetrieveQueryKey(task.id),
        });
        toast.success('文档已删除');
        onOpenChange(false);
      },
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除文档</AlertDialogTitle>
          <AlertDialogDescription>{task.name}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => mutate({ id: task.id })}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
