import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import { useMainTemplatesList } from '@/api/gen/endpoints/main/main';
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
import { FormIcon } from 'lucide-react';
import * as React from 'react';
import { TemplateDialog } from './template-dialog';

export function TemplateList() {
  const { data: me } = useAuthUserRetrieve();
  const {
    data: templates,
    isPending,
    isPlaceholderData,
  } = useMainTemplatesList({
    query: { enabled: !!me, placeholderData: keepPreviousData },
  });

  const [templateDialogId, setTemplateDialogId] = React.useState<string | null>(
    null,
  );

  if (isPending) return <DefaultPending message="模板列表加载中 . . ." />;

  return (
    <div className="flex flex-col gap-4">
      {!templates || templates.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FormIcon />
            </EmptyMedia>
            <EmptyTitle>暂无模板</EmptyTitle>
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
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      className="hover:underline hover:underline-offset-4"
                      onClick={() => {
                        setTemplateDialogId(template.id);
                      }}
                    >
                      {template.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(template.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(template.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={() => setTemplateDialogId(template.id)}
                      >
                        查看模板
                      </Button>
                    </div>
                  </TableCell>
                  <TemplateDialog
                    template={template}
                    open={templateDialogId === template.id}
                    onOpenChange={(open) =>
                      setTemplateDialogId(open ? template.id : null)
                    }
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
