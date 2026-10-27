import { ErrorBoundary } from '@/components/error-boundary';
import { GuideList } from '@/features/guide/components/guide-list';
import { createFileRoute } from '@tanstack/react-router';

function GuidePage() {
  return (
    <ErrorBoundary message="指南列表加载失败">
      <GuideList />
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/dashboard/guide')({
  component: GuidePage,
  staticData: { headers: ['模板 & 指南', '写作指南'] },
});
