import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { useMainTasksRetrieve } from '@/api/gen/endpoints/main/main';
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
import { SettingsDialog } from '@/features/chat/components/editor/settings-dialog';
import { Comment } from '@/features/comment/components/comment';
import { Editor } from '@/features/editor/components/editor';
import { Find } from '@/features/editor/components/find';
import { Plate } from '@/features/editor/components/plate';
import { ToC } from '@/features/editor/components/toc';
import { queryClient } from '@/lib/query-client';
import { useWorkbenchStore } from '@/stores/workbench';
import { noop } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon, PanelRightIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

export const Route = createFileRoute('/workbench/$taskId/')({
  beforeLoad: () => {
    void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
  },
  component: WorkbenchPage,
});

function WorkbenchPage() {
  return (
    <ErrorBoundary message="任务加载失败">
      <Workbench />
    </ErrorBoundary>
  );
}

function Workbench() {
  const { taskId } = Route.useParams();
  const { data: task, isPending } = useMainTasksRetrieve(taskId);

  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const isLeftPanelOpen = useWorkbenchStore((state) => state.isLeftPanelOpen);
  const setIsLeftPanelOpen = useWorkbenchStore(
    (state) => state.setLeftPanelOpen,
  );

  useEffect(() => {
    if (isLeftPanelOpen) {
      leftPanelRef.current?.expand();
    } else {
      leftPanelRef.current?.collapse();
    }
  }, [isLeftPanelOpen]);

  const handleLeftPanelResize = () => {
    setIsLeftPanelOpen(!leftPanelRef.current?.isCollapsed());
  };

  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const isRightPanelOpen = useWorkbenchStore((state) => state.isRightPanelOpen);
  const setRightPanelOpen = useWorkbenchStore(
    (state) => state.setRightPanelOpen,
  );
  const toggleRightPanel = useWorkbenchStore((state) => state.toggleRightPanel);

  useEffect(() => {
    if (isRightPanelOpen) {
      rightPanelRef.current?.expand();
    } else {
      rightPanelRef.current?.collapse();
    }
  }, [isRightPanelOpen]);

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

  const _hideHeader = false;
  const _hideRightPanel = false;

  if (isPending || !task) return <Pending message="任务加载中 . . ." />;

  return (
    <div className="flex h-dvh flex-col">
      <Plate task={task}>
        {!_hideHeader && (
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/dashboard">
                <ArrowLeftIcon />
              </Link>
            </Button>
            <h1 className="text-sm font-semibold">{task.name}</h1>
            <UserMenu className="ml-auto py-1" />
          </header>
        )}

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
                {!_hideRightPanel && !isRightPanelOpen && (
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
                <Comment task={task} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          {!_hideRightPanel && (
            <>
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
                    <TabsTrigger value="1">1</TabsTrigger>
                    <TabsTrigger value="2">2</TabsTrigger>
                    <TabsTrigger value="3">3</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="1"
                    className="min-h-0 data-[state=inactive]:hidden"
                  ></TabsContent>
                  <TabsContent
                    value="2"
                    className="min-h-0 data-[state=inactive]:hidden"
                  ></TabsContent>
                  <TabsContent
                    value="3"
                    className="min-h-0 data-[state=inactive]:hidden"
                  ></TabsContent>
                </Tabs>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        <SettingsDialog />
      </Plate>
    </div>
  );
}
