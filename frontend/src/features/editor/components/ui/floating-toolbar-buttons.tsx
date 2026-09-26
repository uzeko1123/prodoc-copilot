'use client';

// import * as React from 'react';
import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { AlignToolbarButton } from '@/components/shadcn/ui/align-toolbar-button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { InlineEquationToolbarButton } from '@/components/shadcn/ui/equation-toolbar-button';
import { FontColorToolbarButton } from '@/components/shadcn/ui/font-color-toolbar-button';
import { FontSizeToolbarButton } from '@/components/shadcn/ui/font-size-toolbar-button';
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
import { MoreToolbarButton } from '@/components/shadcn/ui/more-toolbar-button';
import { SuggestionToolbarButton } from '@/components/shadcn/ui/suggestion-toolbar-button';
import { ToggleToolbarButton } from '@/components/shadcn/ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  SparklesIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly, usePluginOption } from 'platejs/react';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FloatingToolbarButtons() {
  const selectedBlockIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  return (
    <>
      {selectedBlockIds && selectedBlockIds.size > 0 ? (
        <FloatingToolbarButtonsWithBlockSelection />
      ) : (
        <FloatingToolbarButtonsWithSelection />
      )}
      <FloatingToolbarButtonsStatic />
    </>
  );
}

function FloatingToolbarButtonsWithSelection() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
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

            <FontColorToolbarButton nodeType={KEYS.color} tooltip="Text color">
              <BaselineIcon />
            </FontColorToolbarButton>

            <FontColorToolbarButton
              nodeType={KEYS.backgroundColor}
              tooltip="Background color"
            >
              <PaintBucketIcon />
            </FontColorToolbarButton>

            <InlineEquationToolbarButton />

            <LinkToolbarButton />

            <MoreToolbarButton />
          </ToolbarGroup>
        </>
      )}
    </>
  );
}

function FloatingToolbarButtonsWithBlockSelection() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <TurnIntoToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignToolbarButton />

            <NumberedListToolbarButton />
            <BulletedListToolbarButton />
            <TodoListToolbarButton />
            <ToggleToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LineHeightToolbarButton />
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>
        </>
      )}
    </>
  );
}

function FloatingToolbarButtonsStatic() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      <ToolbarGroup>
        <MarkToolbarButton nodeType={KEYS.highlight} tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>

        <CommentToolbarButton />

        {!readOnly && <SuggestionToolbarButton />}

        <AIToolbarButton tooltip="AI commands">
          <SparklesIcon />
        </AIToolbarButton>
      </ToolbarGroup>
    </>
  );
}
