'use client';

import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { Button } from '@/components/shadcn/ui/button';
import { ToolbarGroup, ToolbarSeparator } from '@/components/shadcn/ui/toolbar';
import { useWorkbenchStore } from '@/stores/workbench';
import { PanelLeftIcon, SparklesIcon } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import { CommentToolbarButton } from './comment-toolbar-button';
import { ExportToolbarButton } from './export-toolbar-button';
import { FontToolbarButton } from './font-toolbar-button';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button';
import { ImportToolbarButton } from './import-toolbar-button';
import { InsertToolbarButton } from './insert-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';
import { ModeToolbarButton } from './mode-toolbar-button';
import { TableToolbarButton } from './table-toolbar-button';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  const isLeftPanelOpen = useWorkbenchStore((state) => state.isLeftPanelOpen);
  const toggleLeftPanel = useWorkbenchStore((state) => state.toggleLeftPanel);

  return (
    <div className="flex w-full">
      <ToolbarGroup>
        {!isLeftPanelOpen && (
          <>
            <Button variant="ghost" onClick={toggleLeftPanel}>
              <PanelLeftIcon />
            </Button>

            <ToolbarSeparator className="self-stretch" />
          </>
        )}

        <ImportToolbarButton />
        <ExportToolbarButton />

        <ToolbarSeparator className="self-stretch" />

        <FontToolbarButton />

        <ToolbarSeparator className="self-stretch" />
      </ToolbarGroup>

      <div className="grow" />

      {!readOnly && (
        <ToolbarGroup>
          <UndoToolbarButton />
          <RedoToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <InsertToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <TableToolbarButton />
          <MediaToolbarButton nodeType={KEYS.img} />
          <MediaToolbarButton nodeType={KEYS.file} />
        </ToolbarGroup>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <ToolbarSeparator className="self-stretch" />

        <CommentToolbarButton />
        <AIToolbarButton tooltip="AI 指令">
          <SparklesIcon />
        </AIToolbarButton>

        <ToolbarSeparator className="self-stretch" />

        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}
