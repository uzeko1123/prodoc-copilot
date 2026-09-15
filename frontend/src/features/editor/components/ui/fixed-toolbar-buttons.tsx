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
import { InsertToolbarButton } from '@/components/shadcn/ui/insert-toolbar-button';
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
import { MoreToolbarButton } from '@/components/shadcn/ui/more-toolbar-button';
import { TableToolbarButton } from '@/components/shadcn/ui/table-toolbar-button';
import { ToggleToolbarButton } from '@/components/shadcn/ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
import { TurnIntoToolbarButton } from '@/components/shadcn/ui/turn-into-toolbar-button';
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
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  const isLeftPanelOpen = useWorkbenchStore((state) => state.isLeftPanelOpen);
  const toggleLeftPanel = useWorkbenchStore((state) => state.toggleLeftPanel);

  return (
    <div className="flex w-full">
      <ToolbarGroup>
        {!isLeftPanelOpen && (
          <Button variant="ghost" onClick={toggleLeftPanel}>
            <PanelLeftIcon />
          </Button>
        )}
      </ToolbarGroup>

      <div className="grow" />

      {
        // eslint-disable-next-line no-constant-binary-expression
        false && !readOnly && (
          <>
            <ToolbarGroup>
              <UndoToolbarButton />
              <RedoToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <AIToolbarButton tooltip="AI commands">
                <WandSparklesIcon />
              </AIToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <ExportToolbarButton>
                <ArrowUpToLineIcon />
              </ExportToolbarButton>

              <ImportToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <InsertToolbarButton />
              <TurnIntoToolbarButton />
              <FontSizeToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton nodeType={KEYS.bold} tooltip="Bold (⌘+B)">
                <BoldIcon />
              </MarkToolbarButton>

              <MarkToolbarButton nodeType={KEYS.italic} tooltip="Italic (⌘+I)">
                <ItalicIcon />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={KEYS.underline}
                tooltip="Underline (⌘+U)"
              >
                <UnderlineIcon />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={KEYS.strikethrough}
                tooltip="Strikethrough (⌘+⇧+M)"
              >
                <StrikethroughIcon />
              </MarkToolbarButton>

              <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
                <Code2Icon />
              </MarkToolbarButton>

              <FontColorToolbarButton
                nodeType={KEYS.color}
                tooltip="Text color"
              >
                <BaselineIcon />
              </FontColorToolbarButton>

              <FontColorToolbarButton
                nodeType={KEYS.backgroundColor}
                tooltip="Background color"
              >
                <PaintBucketIcon />
              </FontColorToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <AlignToolbarButton />

              <NumberedListToolbarButton />
              <BulletedListToolbarButton />
              <TodoListToolbarButton />
              <ToggleToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <LinkToolbarButton />
              <TableToolbarButton />
              <EmojiToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <MediaToolbarButton nodeType={KEYS.img} />
              <MediaToolbarButton nodeType={KEYS.video} />
              <MediaToolbarButton nodeType={KEYS.audio} />
              <MediaToolbarButton nodeType={KEYS.file} />
            </ToolbarGroup>

            <ToolbarGroup>
              <LineHeightToolbarButton />
              <OutdentToolbarButton />
              <IndentToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <MoreToolbarButton />
            </ToolbarGroup>
          </>
        )
      }

      <div className="grow" />

      <ToolbarGroup>
        <MarkToolbarButton nodeType={KEYS.highlight} tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>
        <CommentToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}
