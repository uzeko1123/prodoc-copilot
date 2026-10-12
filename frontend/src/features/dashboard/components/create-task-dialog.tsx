import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { useTaskStore } from '../stores';
import { TaskForm } from './task-form';

export function CreateTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addTask = useTaskStore((state) => state.addTask);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
          <DialogDescription>请输入任务名称。</DialogDescription>
        </DialogHeader>
        <TaskForm
          formId="create-task-form"
          onSubmit={(values) => {
            addTask(values);
            onOpenChange(false);
          }}
          submitLabel="创建"
        />
      </DialogContent>
    </Dialog>
  );
}
