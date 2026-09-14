'use client';

import { AIKit } from '@/components/shadcn/editor/plugins/ai-kit';
import { AlignKit } from '@/components/shadcn/editor/plugins/align-kit';
import { AutoformatKit } from '@/components/shadcn/editor/plugins/autoformat-kit';
import { BasicBlocksKit } from '@/components/shadcn/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/shadcn/editor/plugins/basic-marks-kit';
import { BlockMenuKit } from '@/components/shadcn/editor/plugins/block-menu-kit';
import { BlockPlaceholderKit } from '@/components/shadcn/editor/plugins/block-placeholder-kit';
import { CalloutKit } from '@/components/shadcn/editor/plugins/callout-kit';
import { CodeBlockKit } from '@/components/shadcn/editor/plugins/code-block-kit';
import { ColumnKit } from '@/components/shadcn/editor/plugins/column-kit';
import { CommentKit } from '@/components/shadcn/editor/plugins/comment-kit';
import { CopilotKit } from '@/components/shadcn/editor/plugins/copilot-kit';
import { CursorOverlayKit } from '@/components/shadcn/editor/plugins/cursor-overlay-kit';
import { DateKit } from '@/components/shadcn/editor/plugins/date-kit';
import { DiscussionKit } from '@/components/shadcn/editor/plugins/discussion-kit';
import { DndKit } from '@/components/shadcn/editor/plugins/dnd-kit';
import { DocxKit } from '@/components/shadcn/editor/plugins/docx-kit';
import { EmojiKit } from '@/components/shadcn/editor/plugins/emoji-kit';
import { ExitBreakKit } from '@/components/shadcn/editor/plugins/exit-break-kit';
import { FloatingToolbarKit } from '@/components/shadcn/editor/plugins/floating-toolbar-kit';
import { FontKit } from '@/components/shadcn/editor/plugins/font-kit';
import { LineHeightKit } from '@/components/shadcn/editor/plugins/line-height-kit';
import { LinkKit } from '@/components/shadcn/editor/plugins/link-kit';
import { ListKit } from '@/components/shadcn/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { MathKit } from '@/components/shadcn/editor/plugins/math-kit';
import { MediaKit } from '@/components/shadcn/editor/plugins/media-kit';
import { MentionKit } from '@/components/shadcn/editor/plugins/mention-kit';
import { SlashKit } from '@/components/shadcn/editor/plugins/slash-kit';
import { SuggestionKit } from '@/components/shadcn/editor/plugins/suggestion-kit';
import { TableKit } from '@/components/shadcn/editor/plugins/table-kit';
import { TocKit } from '@/components/shadcn/editor/plugins/toc-kit';
import { ToggleKit } from '@/components/shadcn/editor/plugins/toggle-kit';
import { TrailingBlockPlugin, type Value } from 'platejs';
import { useEditorRef, type TPlateEditor } from 'platejs/react';
import { FixedToolbarKit } from './plugins/fixed-toolbar-kit';

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
