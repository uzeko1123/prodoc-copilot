'use client';

// import * as React from 'react';
import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
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
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './equation-toolbar-button';
import { FontSizeResetToolbarButton } from './font-size-reset-toolbar-button';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import {
  IndentToolbarButton,
  OutdentToolbarButton,
} from './indent-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from './list-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
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
          <FontSizeResetToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <MarkToolbarButton nodeType={KEYS.bold} tooltip="加粗">
            <BoldIcon />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={KEYS.italic} tooltip="斜体">
            <ItalicIcon />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={KEYS.underline} tooltip="下划线">
            <UnderlineIcon />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={KEYS.strikethrough} tooltip="删除线">
            <StrikethroughIcon />
          </MarkToolbarButton>

          <ToolbarSeparator className="self-stretch" />

          <MarkToolbarButton nodeType={KEYS.code} tooltip="行内代码">
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
          <IndentToolbarButton />
          <OutdentToolbarButton />

          <ToolbarSeparator className="self-stretch" />

          <BulletedListToolbarButton />
          <NumberedListToolbarButton />
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
      <MarkToolbarButton nodeType={KEYS.highlight} tooltip="标记">
        <HighlighterIcon />
      </MarkToolbarButton>
      <CommentToolbarButton />
      {!readOnly && <SuggestionToolbarButton />}
      <AIToolbarButton tooltip="AI 指令">
        <SparklesIcon />
      </AIToolbarButton>
    </>
  );
}
