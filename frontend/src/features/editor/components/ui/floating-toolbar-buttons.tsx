'use client';

// import * as React from 'react';
import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { InlineEquationToolbarButton } from '@/components/shadcn/ui/equation-toolbar-button';
import {
  IndentToolbarButton,
  OutdentToolbarButton,
} from '@/components/shadcn/ui/indent-toolbar-button';
import { LinkToolbarButton } from '@/components/shadcn/ui/link-toolbar-button';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
import { MoreToolbarButton } from '@/components/shadcn/ui/more-toolbar-button';
import { SuggestionToolbarButton } from '@/components/shadcn/ui/suggestion-toolbar-button';
import { ToolbarGroup, ToolbarSeparator } from '@/components/shadcn/ui/toolbar';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  SparklesIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly, usePluginOption } from 'platejs/react';
import { AlignToolbarButton } from './align-toolbar-button';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from './list-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FloatingToolbarButtons() {
  const selectedBlockIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  return (
    <ToolbarGroup>
      {selectedBlockIds && selectedBlockIds.size > 0 ? (
        <FloatingToolbarButtonsWithBlockSelection />
      ) : (
        <FloatingToolbarButtonsWithSelection />
      )}
      <FloatingToolbarButtonsStatic />
    </ToolbarGroup>
  );
}

function FloatingToolbarButtonsWithSelection() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <FontSizeToolbarButton />

          <ToolbarSeparator className="self-stretch" />

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

          <ToolbarSeparator className="self-stretch" />

          <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
            <Code2Icon />
          </MarkToolbarButton>
          <InlineEquationToolbarButton />
          <LinkToolbarButton />
          <MoreToolbarButton />

          <ToolbarSeparator className="self-stretch" />
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
          <TurnIntoToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <AlignToolbarButton />
          <OutdentToolbarButton />
          <IndentToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <NumberedListToolbarButton />
          <BulletedListToolbarButton />
          <TodoListToolbarButton />

          <ToolbarSeparator className="self-stretch" />
        </>
      )}
    </>
  );
}

function FloatingToolbarButtonsStatic() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      <MarkToolbarButton nodeType={KEYS.highlight} tooltip="Highlight">
        <HighlighterIcon />
      </MarkToolbarButton>

      <CommentToolbarButton />

      {!readOnly && <SuggestionToolbarButton />}

      <AIToolbarButton tooltip="AI commands">
        <SparklesIcon />
      </AIToolbarButton>
    </>
  );
}
