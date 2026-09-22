'use client';

import { Button } from '@/components/shadcn/ui/button';
import { ExportToolbarButton } from '@/components/shadcn/ui/export-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/components/shadcn/ui/history-toolbar-button';
import { ImportToolbarButton } from '@/components/shadcn/ui/import-toolbar-button';
import { ModeToolbarButton } from '@/components/shadcn/ui/mode-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
import { useWorkbenchStore } from '@/stores/workbench';
import { PanelLeftIcon } from 'lucide-react';
import { useEditorReadOnly } from 'platejs/react';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  const isLeftPanelOpen = useWorkbenchStore((state) => state.isLeftPanelOpen);
  const toggleLeftPanel = useWorkbenchStore((state) => state.toggleLeftPanel);

  const _hideMainToolbar = false;

  return (
    <div className="flex w-full">
      <ToolbarGroup>
        {!isLeftPanelOpen && (
          <Button variant="ghost" onClick={toggleLeftPanel}>
            <PanelLeftIcon />
          </Button>
        )}
      </ToolbarGroup>

      {!readOnly && (
        <ToolbarGroup>
          <UndoToolbarButton />
          <RedoToolbarButton />
        </ToolbarGroup>
      )}

      <div className="grow" />

      {!_hideMainToolbar && <>...</>}

      <div className="grow" />

      <ToolbarGroup>
        <ImportToolbarButton />
        <ExportToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}
