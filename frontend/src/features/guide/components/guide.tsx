import type { Task } from '@/api/gen/models';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { BookOpenIcon } from 'lucide-react';
import { GuideContent } from './guide-content';

export function Guide({ task }: { task: Task }) {
  if (!task.guide)
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle>写作指南</EmptyTitle>
          <EmptyDescription>未指定写作指南</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  return (
    <div className="h-full overflow-y-auto">
      <GuideContent value={task.guide.value} className="editor-font sm:px-6" />
    </div>
  );
}
