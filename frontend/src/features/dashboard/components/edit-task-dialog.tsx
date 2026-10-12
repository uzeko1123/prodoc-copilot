import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import type { Task } from '../stores';
import { useTaskStore } from '../stores';
import { TaskForm } from './task-form';

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateTask = useTaskStore((state) => state.updateTask);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>编辑任务信息</DialogTitle>
          {task && <DialogDescription>{task.name}</DialogDescription>}
        </DialogHeader>
        {task && (
          <TaskForm
            key={task.id}
            formId="edit-task-form"
            defaultValues={{ name: task.name }}
            onSubmit={(values) => {
              updateTask(task.id, values);
              onOpenChange(false);
            }}
            submitLabel="保存"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
