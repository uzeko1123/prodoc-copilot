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
import { Editor } from '@/features/editor/components/editor';
// import { Comment } from '@/features/comment/components/comment';
import { useWorkbenchStore, type ActiveTab } from '@/stores/workbench';
import { createFileRoute } from '@tanstack/react-router';
import { PanelRightIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

function WorkbenchPage() {
  const activeTab = useWorkbenchStore((state) => state.activeTab);
  const setActiveTab = useWorkbenchStore((state) => state.setActiveTab);

  const sidePanelRef = useRef<PanelImperativeHandle>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const toggleSidePanel = () => {
    if (isSidePanelOpen) {
      sidePanelRef.current?.collapse();
      setIsSidePanelOpen(false);
    } else {
      sidePanelRef.current?.expand();
      setIsSidePanelOpen(true);
    }
  };

  const handleSidePanelResize = () => {
    setIsSidePanelOpen(!sidePanelRef.current?.isCollapsed());
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Workbench</h1>
      </header>

      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="10%" minSize="10%"></ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%" minSize="40%">
          <Editor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="20%" minSize="15%">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ActiveTab)}
            className="h-full gap-0"
          >
            <TabsList
              variant="line"
              className="h-10 max-h-10 min-h-10 w-full border-b"
            >
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="comment">Comment</TabsTrigger>
              <Button
                variant="ghost"
                aria-expanded={isSidePanelOpen}
                onClick={toggleSidePanel}
              >
                <PanelRightIcon />
              </Button>
            </TabsList>
            <TabsContent value="chat" className="min-h-0">
              <Chat />
            </TabsContent>
            <TabsContent value="comment" className="min-h-0">
              {/* <Comment /> */}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          collapsible
          defaultSize="20%"
          minSize="15%"
          panelRef={sidePanelRef}
          onResize={handleSidePanelResize}
        ></ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const Route = createFileRoute('/workbench/')({
  component: WorkbenchPage,
});
