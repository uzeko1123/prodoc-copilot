import { useMainTasksRetrieve } from '@/api/gen/endpoints/main/main';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { useParams } from '@tanstack/react-router';
import { BookOpenIcon } from 'lucide-react';
import { GuideContent } from './guide-content';

export function Guide() {
  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const guide = task?.guide ?? null;

  if (!guide)
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
      <GuideContent guide={guide} interactive />
    </div>
  );
}
