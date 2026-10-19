import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { Spinner } from '@/components/ui/spinner';

export function DefaultPending({
  message = '加载中 . . .',
}: {
  message?: string;
}) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle className="shimmer">{message}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
