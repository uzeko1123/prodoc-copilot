'use client';

// import * as React from 'react';
import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { InlineEquationToolbarButton } from '@/components/shadcn/ui/equation-toolbar-button';
import { FontSizeToolbarButton } from '@/components/shadcn/ui/font-size-toolbar-button';
import { LinkToolbarButton } from '@/components/shadcn/ui/link-toolbar-button';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
import { SuggestionToolbarButton } from '@/components/shadcn/ui/suggestion-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
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
import { MoreToolbarButton } from './more-toolbar-button';
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
      <FloatingToolbarButtonsTools />
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
            <TurnIntoToolbarButton />
          </ToolbarGroup>

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

            <MoreToolbarButton />
          </ToolbarGroup>
        </>
      )}
    </>
  );
}

function FloatingToolbarButtonsWithBlockSelection() {
  const readOnly = useEditorReadOnly();

  return <>{!readOnly && <></>}</>;
}

function FloatingToolbarButtonsTools() {
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
