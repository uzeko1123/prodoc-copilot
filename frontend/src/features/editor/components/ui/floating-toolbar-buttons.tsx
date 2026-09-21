'use client';

// import * as React from 'react';
import { AIToolbarButton } from '@/components/shadcn/ui/ai-toolbar-button';
import { CommentToolbarButton } from '@/components/shadcn/ui/comment-toolbar-button';
import { InlineEquationToolbarButton } from '@/components/shadcn/ui/equation-toolbar-button';
import { LinkToolbarButton } from '@/components/shadcn/ui/link-toolbar-button';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
import { SuggestionToolbarButton } from '@/components/shadcn/ui/suggestion-toolbar-button';
import { ToolbarGroup } from '@/components/shadcn/ui/toolbar';
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
import { useEditorReadOnly } from 'platejs/react';
import { MoreToolbarButton } from './more-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';
import { FontSizeToolbarButton } from '@/components/shadcn/ui/font-size-toolbar-button';

export function FloatingToolbarButtons() {
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

      <ToolbarGroup>
        <MarkToolbarButton nodeType={KEYS.highlight} tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>

        <CommentToolbarButton />

        <SuggestionToolbarButton />

        <AIToolbarButton tooltip="AI commands">
          <SparklesIcon />
        </AIToolbarButton>
      </ToolbarGroup>
    </>
  );
}
