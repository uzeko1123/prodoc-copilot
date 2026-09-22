'use client';

import { AlignKit } from '@/components/shadcn/editor/plugins/align-kit';
import { AutoformatKit } from '@/components/shadcn/editor/plugins/autoformat-kit';
import { BasicBlocksKit } from '@/components/shadcn/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/shadcn/editor/plugins/basic-marks-kit';
import { BlockPlaceholderKit } from '@/components/shadcn/editor/plugins/block-placeholder-kit';
import { CalloutKit } from '@/components/shadcn/editor/plugins/callout-kit';
import { CodeBlockKit } from '@/components/shadcn/editor/plugins/code-block-kit';
import { ColumnKit } from '@/components/shadcn/editor/plugins/column-kit';
import { CursorOverlayKit } from '@/components/shadcn/editor/plugins/cursor-overlay-kit';
import { DateKit } from '@/components/shadcn/editor/plugins/date-kit';
import { DndKit } from '@/components/shadcn/editor/plugins/dnd-kit';
import { DocxKit } from '@/components/shadcn/editor/plugins/docx-kit';
import { EmojiKit } from '@/components/shadcn/editor/plugins/emoji-kit';
import { ExitBreakKit } from '@/components/shadcn/editor/plugins/exit-break-kit';
import { FontKit } from '@/components/shadcn/editor/plugins/font-kit';
import { LineHeightKit } from '@/components/shadcn/editor/plugins/line-height-kit';
import { LinkKit } from '@/components/shadcn/editor/plugins/link-kit';
import { ListKit } from '@/components/shadcn/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { MathKit } from '@/components/shadcn/editor/plugins/math-kit';
import { MediaKit } from '@/components/shadcn/editor/plugins/media-kit';
import { MentionKit } from '@/components/shadcn/editor/plugins/mention-kit';
import { SlashKit } from '@/components/shadcn/editor/plugins/slash-kit';
import { TableKit } from '@/components/shadcn/editor/plugins/table-kit';
import { TocKit } from '@/components/shadcn/editor/plugins/toc-kit';
import { ToggleKit } from '@/components/shadcn/editor/plugins/toggle-kit';
import { AIKit } from '@/features/chat/components/editor/plugins/ai-kit';
import { CopilotKit } from '@/features/chat/components/editor/plugins/copilot-kit';
import { CommentKit } from '@/features/comment/components/editor/plugins/comment-kit';
import { DiscussionKit } from '@/features/comment/components/editor/plugins/discussion-kit';
import { SuggestionKit } from '@/features/comment/components/editor/plugins/suggestion-kit';
import { TrailingBlockPlugin, type Value } from 'platejs';
import { useEditorRef, type TPlateEditor } from 'platejs/react';
import { BlockSelectionKit } from './plugins/block-selection-kit';
import { FindReplaceKit } from './plugins/find-replace-kit';
import { FixedToolbarKit } from './plugins/fixed-toolbar-kit';
import { FloatingToolbarKit } from './plugins/floating-toolbar-kit';

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
  ...BlockSelectionKit,
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

  // Find
  ...FindReplaceKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
