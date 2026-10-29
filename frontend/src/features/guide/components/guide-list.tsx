import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import { useMainGuidesList } from '@/api/gen/endpoints/main/main';
import { DefaultPending } from '@/components/default-pending';
import { Button } from '@/components/shadcn/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { formatDate } from '@/lib/format-date';
import { keepPreviousData } from '@tanstack/react-query';
import { cn } from 'cn';
import { BookOpenIcon } from 'lucide-react';
import * as React from 'react';
import { GuideDialog } from './guide-dialog';

export function GuideList() {
  const { data: me } = useAuthUserRetrieve();
  const {
    data: guides,
    isPending,
    isPlaceholderData,
  } = useMainGuidesList(
    {},
    {
      query: { enabled: !!me, placeholderData: keepPreviousData },
    },
  );

  const [guideDialogId, setGuideDialogId] = React.useState<string | null>(null);

  if (isPending) return <DefaultPending message="指南列表加载中 . . ." />;

  return (
    <div className="flex flex-col gap-4">
      {!guides || guides.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenIcon />
            </EmptyMedia>
            <EmptyTitle>暂无指南</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div
          className={cn(
            'overflow-hidden rounded-lg border',
            isPlaceholderData && 'opacity-60',
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="w-36" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      className="hover:underline hover:underline-offset-4"
                      onClick={() => {
                        setGuideDialogId(guide.id);
                      }}
                    >
                      {guide.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(guide.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(guide.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={() => setGuideDialogId(guide.id)}
                      >
                        查看指南
                      </Button>
                      <GuideDialog
                        guide={guide}
                        open={guideDialogId === guide.id}
                        onOpenChange={(open) =>
                          setGuideDialogId(open ? guide.id : null)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
