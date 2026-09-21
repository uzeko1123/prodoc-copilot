'use client';

import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { AlignToolbarButton } from '@/components/shadcn/ui/align-toolbar-button';
import { Button } from '@/components/shadcn/ui/button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { EmojiToolbarButton } from '@/components/shadcn/ui/emoji-toolbar-button';
import { ExportToolbarButton } from '@/components/shadcn/ui/export-toolbar-button';
import { FontColorToolbarButton } from '@/components/shadcn/ui/font-color-toolbar-button';
import { FontSizeToolbarButton } from '@/components/shadcn/ui/font-size-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/components/shadcn/ui/history-toolbar-button';
import { ImportToolbarButton } from '@/components/shadcn/ui/import-toolbar-button';
import {
  IndentToolbarButton,
  OutdentToolbarButton,
} from '@/components/shadcn/ui/indent-toolbar-button';
import { LineHeightToolbarButton } from '@/components/shadcn/ui/line-height-toolbar-button';
import { LinkToolbarButton } from '@/components/shadcn/ui/link-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from '@/components/shadcn/ui/list-toolbar-button';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
import { MediaToolbarButton } from '@/components/shadcn/ui/media-toolbar-button';
import { ModeToolbarButton } from '@/components/shadcn/ui/mode-toolbar-button';
import { TableToolbarButton } from '@/components/shadcn/ui/table-toolbar-button';
import { ToggleToolbarButton } from '@/components/shadcn/ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
import { useWorkbenchStore } from '@/stores/workbench';
import {
  ArrowUpToLineIcon,
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  PanelLeftIcon,
  SparklesIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import { InsertToolbarButton } from './insert-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

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

      <ToolbarGroup>
        <ExportToolbarButton>
          <ArrowUpToLineIcon />
        </ExportToolbarButton>

        <ImportToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <UndoToolbarButton />
        <RedoToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup></ToolbarGroup>

      <div className="grow" />

      {!_hideMainToolbar && !readOnly && (
        <>
          <ToolbarGroup>
            <InsertToolbarButton />
            <TurnIntoToolbarButton />
            <AlignToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <TableToolbarButton />
            <MediaToolbarButton nodeType={KEYS.img} />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />

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
