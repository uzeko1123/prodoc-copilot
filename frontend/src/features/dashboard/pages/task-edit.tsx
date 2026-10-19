import { ErrorBoundary } from '@/components/error-boundary';
import { TaskList } from '@/features/dashboard/components/task-list';
import { createFileRoute } from '@tanstack/react-router';

function TaskEditPage() {
  return (
    <ErrorBoundary message="任务列表加载失败">
      <TaskList role="editor" />
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/dashboard/task/edit')({
  component: TaskEditPage,
  staticData: { headers: ['任务列表', '我编写的'] },
});
