import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { useLocation } from '@tanstack/react-router';
import { FileQuestionIcon } from 'lucide-react';

export function DefaultNotFound() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>页面不存在</EmptyTitle>
        <EmptyDescription>{useLocation().href}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
