import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { Spinner } from '@/components/ui/spinner';

export function Pending({ message = '加载中 . . .' }: { message?: string }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{message}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
