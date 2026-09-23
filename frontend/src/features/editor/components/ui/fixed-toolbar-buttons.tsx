'use client';

import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { Button } from '@/components/shadcn/ui/button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { EmojiToolbarButton } from '@/components/shadcn/ui/emoji-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/components/shadcn/ui/history-toolbar-button';
import { MediaToolbarButton } from '@/components/shadcn/ui/media-toolbar-button';
import { ModeToolbarButton } from '@/components/shadcn/ui/mode-toolbar-button';
import { TableToolbarButton } from '@/components/shadcn/ui/table-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
import { useWorkbenchStore } from '@/stores/workbench';
import { PanelLeftIcon, SparklesIcon } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import { ExportToolbarButton } from './export-toolbar-button';
import { ImportToolbarButton } from './import-toolbar-button';
import { InsertToolbarButton } from './insert-toolbar-button';

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

      <ToolbarGroup>
        <ImportToolbarButton />
        <ExportToolbarButton />
      </ToolbarGroup>

      <div className="grow" />

      {!_hideMainToolbar && (
        <>
          <ToolbarGroup>
            <InsertToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <TableToolbarButton />
            <EmojiToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaToolbarButton nodeType={KEYS.img} />
            <MediaToolbarButton nodeType={KEYS.video} />
            <MediaToolbarButton nodeType={KEYS.audio} />
            <MediaToolbarButton nodeType={KEYS.file} />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <CommentToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <AIToolbarButton tooltip="AI commands">
          <SparklesIcon />
        </AIToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}
