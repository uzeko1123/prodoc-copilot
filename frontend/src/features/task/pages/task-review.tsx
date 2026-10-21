import { ErrorBoundary } from '@/components/error-boundary';
import { TaskList } from '@/features/task/components/task-list';
import { createFileRoute } from '@tanstack/react-router';

function TaskReviewPage() {
  return (
    <ErrorBoundary message="任务列表加载失败">
      <TaskList role="reviewer" />
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/dashboard/task/review')({
  component: TaskReviewPage,
  staticData: { headers: ['任务列表', '我评审的'] },
});
