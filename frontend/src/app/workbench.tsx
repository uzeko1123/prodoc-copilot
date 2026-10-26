import {
  getAuthUserRetrieveQueryOptions,
  useAuthUserRetrieve,
} from '@/api/gen/endpoints/auth/auth';
import {
  useMainDocumentsRetrieve,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import type { Task, UserDetails } from '@/api/gen/models';
import { DefaultPending } from '@/components/default-pending';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/shadcn/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/resizable';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/tabs';
import { UserMenu } from '@/features/auth/components/user-menu';
import { Chat } from '@/features/chat/components/chat';
import { Comment } from '@/features/comment/components/comment';
import { Editor } from '@/features/editor/components/editor';
import { Find } from '@/features/editor/components/find';
import { Plate } from '@/features/editor/components/plate';
import { ToC } from '@/features/editor/components/toc';
import { templateValue } from '@/features/editor/data/template';
import { TaskUpdateDialog } from '@/features/task/components/task-dialog';
import type { Role } from '@/features/task/components/task-list';
import { TaskStageBadge } from '@/features/task/components/task-stage-badge';
import { TaskWorkflowDialog } from '@/features/task/components/task-workflow';
import { queryClient } from '@/lib/query-client';
import { useWorkbenchStore } from '@/stores/workbench';
import { noop } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  InfoIcon,
  PanelRightIcon,
  WorkflowIcon,
} from 'lucide-react';
import type { Value } from 'platejs';
import { useEffect, useRef, useState } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';
import { z } from 'zod';

export const Route = createFileRoute('/workbench/$taskId/')({
  validateSearch: z.object({ role: z.enum(['creator', 'reviewer']) }),
  beforeLoad: ({ cause }) => {
    if (cause === 'preload') return;
    void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
  },
  component: WorkbenchPage,
});

function WorkbenchPage() {
  return (
    <ErrorBoundary>
      <Workbench />
    </ErrorBoundary>
  );
}

function Workbench() {
  const { taskId } = Route.useParams();
  const { role } = Route.useSearch() as { role: Role };
  const { data: me } = useAuthUserRetrieve();
  const { data: task, isPending: isTaskPending } = useMainTasksRetrieve(taskId);
  const { data: document, isPending: isDocumentPending } =
    useMainDocumentsRetrieve(task?.document ?? '', {
      query: { enabled: task?.document !== undefined },
    });

  const router = useRouter();
  const navigate = useNavigate();

  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const leftPanelOpen = useWorkbenchStore((state) => state.leftPanelOpen);
  const setLeftPanelOpen = useWorkbenchStore((state) => state.setLeftPanelOpen);

  useEffect(() => {
    if (leftPanelOpen) {
      leftPanelRef.current?.expand();
    } else {
      leftPanelRef.current?.collapse();
    }
  }, [leftPanelOpen]);

  const handleLeftPanelResize = () => {
    setLeftPanelOpen(!leftPanelRef.current?.isCollapsed());
  };

  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const rightPanelOpen = useWorkbenchStore((state) => state.rightPanelOpen);
  const setRightPanelOpen = useWorkbenchStore(
    (state) => state.setRightPanelOpen,
  );
  const toggleRightPanel = useWorkbenchStore((state) => state.toggleRightPanel);

  useEffect(() => {
    if (rightPanelOpen) {
      rightPanelRef.current?.expand();
    } else {
      rightPanelRef.current?.collapse();
    }
  }, [rightPanelOpen]);

  const handleRightPanelResize = () => {
    setRightPanelOpen(!rightPanelRef.current?.isCollapsed());
  };

  const activeMainTab = useWorkbenchStore((state) => state.activeMainTab);
  const setActiveMainTab = useWorkbenchStore((state) => state.setActiveMainTab);

  const activeLeftPanelTab = useWorkbenchStore(
    (state) => state.activeLeftPanelTab,
  );
  const setActiveLeftPanelTab = useWorkbenchStore(
    (state) => state.setActiveLeftPanelTab,
  );

  const activeRightPanelTab = useWorkbenchStore(
    (state) => state.activeRightPanelTab,
  );
  const setActiveRightPanelTab = useWorkbenchStore(
    (state) => state.setActiveRightPanelTab,
  );

  const [taskWorkflowDialogOpen, setTaskWorkflowDialogOpen] = useState(false);
  const [taskUpdateDialogOpen, setTaskUpdateDialogOpen] = useState(false);

  if (isTaskPending || !task)
    return <DefaultPending message="任务加载中 . . ." />;
  if (isDocumentPending || !document)
    return <DefaultPending message="文档加载中 . . ." />;

  return (
    <div className="flex h-dvh flex-col">
      <Plate
        value={(document.value as Value) ?? templateValue}
        documentId={task.document}
        canEdit={canEdit(role, me, task)}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.history.canGoBack()
                ? router.history.back()
                : navigate({ to: '/dashboard' })
            }
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="mr-2 text-lg font-medium">{task.name}</h1>
          <TaskStageBadge role={role} stage={task.stage} className="mr-auto" />
          {canSubmitWorkflow(role, me, task) && (
            <Button onClick={() => setTaskWorkflowDialogOpen(true)}>
              <WorkflowIcon />
              提交流程
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setTaskUpdateDialogOpen(true)}
          >
            <InfoIcon />
            文档信息
          </Button>
          <UserMenu className="ml-2 py-1" />
        </header>

        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            collapsible
            defaultSize="10%"
            minSize="10%"
            panelRef={leftPanelRef}
            onResize={handleLeftPanelResize}
          >
            <Tabs
              value={activeLeftPanelTab}
              onValueChange={(value) => setActiveLeftPanelTab(value)}
              className="h-full gap-0"
            >
              <TabsList
                variant="line"
                className="h-10 min-h-10 w-full border-b"
              >
                <TabsTrigger value="toc">大纲</TabsTrigger>
                <TabsTrigger value="find">查找</TabsTrigger>
              </TabsList>
              <TabsContent
                value="toc"
                className="min-h-0 data-[state=inactive]:hidden"
              >
                <ToC />
              </TabsContent>
              <TabsContent
                value="find"
                className="min-h-0 data-[state=inactive]:hidden"
              >
                <Find />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="40%">
            <Editor />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="20%" minSize="15%">
            <Tabs
              value={activeMainTab}
              onValueChange={(value) => setActiveMainTab(value)}
              className="h-full gap-0"
            >
              <TabsList
                variant="line"
                className="h-10 min-h-10 w-full border-b"
              >
                <TabsTrigger value="chat">AI 对话</TabsTrigger>
                <TabsTrigger value="comment">评论 & 修订</TabsTrigger>
                {!rightPanelOpen && (
                  <Button variant="ghost" onClick={toggleRightPanel}>
                    <PanelRightIcon />
                  </Button>
                )}
              </TabsList>
              <TabsContent
                value="chat"
                className="min-h-0 data-[state=inactive]:hidden"
              >
                <Chat />
              </TabsContent>
              <TabsContent
                value="comment"
                className="min-h-0 data-[state=inactive]:hidden"
              >
                <Comment />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            collapsible
            defaultSize="20%"
            minSize="15%"
            panelRef={rightPanelRef}
            onResize={handleRightPanelResize}
          >
            <Tabs
              value={activeRightPanelTab}
              onValueChange={(value) => setActiveRightPanelTab(value)}
              className="h-full gap-0"
            >
              <TabsList
                variant="line"
                className="h-10 min-h-10 w-full border-b"
              >
                <TabsTrigger value="guide">写作指南</TabsTrigger>
                <TabsTrigger value="knowledge">知识库</TabsTrigger>
              </TabsList>
              <TabsContent
                value="guide"
                className="min-h-0 data-[state=inactive]:hidden"
              ></TabsContent>
              <TabsContent
                value="knowledge"
                className="min-h-0 data-[state=inactive]:hidden"
              ></TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>

        <TaskWorkflowDialog
          task={task}
          open={taskWorkflowDialogOpen}
          onOpenChange={setTaskWorkflowDialogOpen}
        />

        <TaskUpdateDialog
          task={task}
          open={taskUpdateDialogOpen}
          onOpenChange={setTaskUpdateDialogOpen}
        />
      </Plate>
    </div>
  );
}

function canEdit(role: Role, user?: UserDetails, task?: Task): boolean {
  if (!user || !task) return false;
  if (role === 'creator' && user.pk === task.creator) {
    return task.stage === 'editing' || task.stage === 'revision';
  }
  return false;
}

function canSubmitWorkflow(
  role: Role,
  user?: UserDetails,
  task?: Task,
): boolean {
  if (!user || !task) return false;
  if (role === 'creator' && user.pk === task.creator) {
    return task.stage === 'editing' || task.stage === 'revision';
  }
  if (role === 'reviewer' && user.pk === task.reviewer) {
    return task.stage === 'review';
  }
  return false;
}
