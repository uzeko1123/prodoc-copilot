import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/resizable';
import { Chat } from '@/features/chat/components/chat';
import { Editor } from '@/features/editor/components/editor';
import { TableOfContents } from '@/features/editor/components/table-of-contents';
import { createFileRoute } from '@tanstack/react-router';

function WorkbenchPage() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Workbench</h1>
      </header>

      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel collapsible defaultSize="10%" minSize="10%">
          <TableOfContents />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%" minSize="40%">
          <Editor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="20%" minSize="15%">
          <Chat />
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
