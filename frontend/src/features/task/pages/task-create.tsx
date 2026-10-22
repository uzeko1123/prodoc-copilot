import { ErrorBoundary } from '@/components/error-boundary';
import { TaskList } from '@/features/task/components/task-list';
import { createFileRoute } from '@tanstack/react-router';

function TaskCreatePage() {
  return (
    <ErrorBoundary message="任务列表加载失败">
      <TaskList role="creator" />
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/dashboard/task/create')({
  component: TaskCreatePage,
  staticData: { headers: ['任务列表', '我创建的'] },
});
