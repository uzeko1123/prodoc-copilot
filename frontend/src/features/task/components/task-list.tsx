import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import { useMainTasksList } from '@/api/gen/endpoints/main/main';
import type { StageEnum, Task } from '@/api/gen/models';
import { DefaultPending } from '@/components/default-pending';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/shadcn/ui/toggle-group';
import { formatDate } from '@/lib/format-date';
import { keepPreviousData } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { cn } from 'cn';
import {
  EllipsisVerticalIcon,
  InboxIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import * as React from 'react';
import {
  TaskCreateDialog,
  TaskDeleteDialog,
  TaskUpdateDialog,
} from './task-dialog';
import { TaskStageBadge } from './task-stage-badge';

export type Role = 'creator' | 'reviewer';

export function TaskList({ role }: { role: Role }) {
  const { data: user, isSuccess: isAuthSuccess } = useAuthUserRetrieve();
  const [stage, setStage] = React.useState<StageEnum | 'all'>('all');

  const {
    data: tasks,
    isPending,
    isPlaceholderData,
  } = useMainTasksList(
    {
      ...(role === 'creator' ? { creator: user?.pk } : { reviewer: user?.pk }),
      ...(stage !== 'all' && { stage }),
    },
    {
      query: { enabled: isAuthSuccess, placeholderData: keepPreviousData },
    },
  );

  const [taskCreateDialogOpen, setTaskCreateDialogOpen] = React.useState(false);
  const [taskUpdateDialogOpen, setTaskUpdateDialogOpen] = React.useState(false);
  const [taskDeleteDialogOpen, setTaskDeleteDialogOpen] = React.useState(false);

  if (isPending) return <DefaultPending message="任务列表加载中 . . ." />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        {role === 'creator' ? (
          <Button size="sm" onClick={() => setTaskCreateDialogOpen(true)}>
            <PlusIcon /> 新建文档
          </Button>
        ) : (
          <></>
          // <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          //   <PlusIcon /> 新建评审任务
          // </Button>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          className="ml-auto"
          value={stage}
          onValueChange={(value) => setStage(value as StageEnum | 'all')}
        >
          <ToggleGroupItem value="all">全部</ToggleGroupItem>
          {role === 'creator' && (
            <ToggleGroupItem value="editing">编写中</ToggleGroupItem>
          )}
          <ToggleGroupItem value="review">评审中</ToggleGroupItem>
          <ToggleGroupItem value="revision">修订中</ToggleGroupItem>
          <ToggleGroupItem value="final">已完成</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {!tasks || tasks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>
              {role === 'creator' ? '暂无文档' : '暂无评审任务'}
            </EmptyTitle>
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
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="w-36" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/workbench/$taskId"
                      params={{ taskId: task.id }}
                      search={{ role }}
                      className="hover:underline hover:underline-offset-4"
                    >
                      {task.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TaskStageBadge role={role} stage={task.stage} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(task.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(task.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" asChild>
                        <Link
                          to="/workbench/$taskId"
                          params={{ taskId: task.id }}
                          search={{ role }}
                        >
                          {getEnterLabel(role, task)}
                        </Link>
                      </Button>
                      {role === 'creator' && task.stage !== 'review' && (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <EllipsisVerticalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setTaskUpdateDialogOpen(true)}
                              >
                                <PencilIcon />
                                修改信息
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setTaskDeleteDialogOpen(true)}
                              >
                                <TrashIcon />
                                删除文档
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <TaskUpdateDialog
                            task={task}
                            open={taskUpdateDialogOpen}
                            onOpenChange={setTaskUpdateDialogOpen}
                          />

                          <TaskDeleteDialog
                            task={task}
                            open={taskDeleteDialogOpen}
                            onOpenChange={setTaskDeleteDialogOpen}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <TaskCreateDialog
        open={taskCreateDialogOpen}
        onOpenChange={setTaskCreateDialogOpen}
      />
    </div>
  );
}

function getEnterLabel(role: Role, task: Task) {
  if (role === 'creator') {
    if (task.stage === 'editing') return '进入编写';
    if (task.stage === 'revision') return '进入修改';
  }
  if (role === 'reviewer') {
    if (task.stage === 'review') return '进入评审';
  }
  return '查看任务';
}
