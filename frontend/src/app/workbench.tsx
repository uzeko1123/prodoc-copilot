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
import { createFileRoute } from '@tanstack/react-router';

function WorkbenchPage() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Workbench</h1>
      </header>

      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="60%" minSize="50%">
          <Editor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="20%" minSize="15%">
          <Tabs defaultValue="chat" className="h-full gap-0">
            <TabsList variant="line" className="w-full border-b">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="comment">Comment</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="min-h-0">
              <Chat />
            </TabsContent>
            <TabsContent value="comment"></TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          collapsible
          defaultSize="20%"
          minSize="15%"
        ></ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const Route = createFileRoute('/workbench/')({
  component: WorkbenchPage,
});
