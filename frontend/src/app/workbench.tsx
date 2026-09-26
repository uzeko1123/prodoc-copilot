import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
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
import { Chat } from '@/features/chat/components/chat';
import { SettingsDialog } from '@/features/chat/components/editor/settings-dialog';
import { Comment } from '@/features/comment/components/comment';
import { Editor } from '@/features/editor/components/editor';
import { EditorKit } from '@/features/editor/components/editor/editor-kit';
import { Find } from '@/features/editor/components/find';
import { ToC } from '@/features/editor/components/toc';
import { useEditorStore } from '@/features/editor/stores';
import { queryClient } from '@/lib/query-client';
import { useWorkbenchStore } from '@/stores/workbench';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PanelRightIcon } from 'lucide-react';
import { Plate, usePlateEditor } from 'platejs/react';
import { useEffect, useRef } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

function Workbench() {
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

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: useEditorStore.getState().value,
  });

  const _hideFindTab = false;
  const _hideRightPanel = false;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Workbench</h1>
      </header>

      <Plate editor={editor}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            collapsible
            defaultSize="10%"
            minSize="10%"
            panelRef={leftPanelRef}
            onResize={handleLeftPanelResize}
          >
            {!_hideFindTab ? (
              <Tabs
                value={activeLeftPanelTab}
                onValueChange={(value) => setActiveLeftPanelTab(value)}
                className="h-full gap-0"
              >
                <TabsList
                  variant="line"
                  className="h-10 min-h-10 w-full border-b"
                >
                  <TabsTrigger value="toc">ToC</TabsTrigger>
                  <TabsTrigger value="find">Find</TabsTrigger>
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
            ) : (
              <Tabs value="toc" className="h-full gap-0">
                <TabsList
                  variant="line"
                  className="h-10 min-h-10 w-full border-b"
                >
                  <TabsTrigger value="toc">ToC</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="toc"
                  className="min-h-0 data-[state=inactive]:hidden"
                >
                  <ToC />
                </TabsContent>
              </Tabs>
            )}
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
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="comment">Comment</TabsTrigger>
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
                <Comment />
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

export const Route = createFileRoute('/workbench/')({
  beforeLoad: () => {
    const _withAuth = false;
    if (_withAuth) {
      void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
    }
  },
  component: Workbench,
});
