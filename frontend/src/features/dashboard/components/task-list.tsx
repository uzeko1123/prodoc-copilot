import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import * as React from 'react';
import type { Task } from '../stores';
import { useTaskStore } from '../stores';
import { CreateTaskDialog } from './create-task-dialog';
import { DeleteTaskDialog } from './delete-task-dialog';
import { EditTaskDialog } from './edit-task-dialog';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

export function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [deleting, setDeleting] = React.useState<Task | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">任务列表</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          新建任务
        </Button>
      </div>
      {tasks.length === 0 ? (
        <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
          暂无任务，点击“新建任务”创建
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(task.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(task.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="任务操作"
                        >
                          <EllipsisVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(task)}>
                          <PencilIcon />
                          编辑信息
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeleting(task)}
                        >
                          <Trash2Icon />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditTaskDialog
        task={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <DeleteTaskDialog
        task={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
