import { ErrorBoundary } from '@/components/error-boundary';
import { TemplateList } from '@/features/template/components/template-list';
import { createFileRoute } from '@tanstack/react-router';

function TemplatePage() {
  return (
    <ErrorBoundary message="模板列表加载失败">
      <TemplateList />
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/dashboard/template')({
  component: TemplatePage,
  staticData: { headers: ['模板 & 指南', '文档模板'] },
});
