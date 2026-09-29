'use client';

import { AlignKit } from '@/components/shadcn/editor/plugins/align-kit';
import { AutoformatKit } from '@/components/shadcn/editor/plugins/autoformat-kit';
// import { CalloutKit } from '@/components/shadcn/editor/plugins/callout-kit';
// import { ColumnKit } from '@/components/shadcn/editor/plugins/column-kit';
// import { DateKit } from '@/components/shadcn/editor/plugins/date-kit';
// import { DocxKit } from '@/components/shadcn/editor/plugins/docx-kit';
// import { EmojiKit } from '@/components/shadcn/editor/plugins/emoji-kit';
import { ExitBreakKit } from '@/components/shadcn/editor/plugins/exit-break-kit';
import { FontKit } from '@/components/shadcn/editor/plugins/font-kit';
// import { LineHeightKit } from '@/components/shadcn/editor/plugins/line-height-kit';
import { ListKit } from '@/components/shadcn/editor/plugins/list-kit';
// import { MentionKit } from '@/components/shadcn/editor/plugins/mention-kit';
// import { SlashKit } from '@/components/shadcn/editor/plugins/slash-kit';
// import { ToggleKit } from '@/components/shadcn/editor/plugins/toggle-kit';
import { AIKit } from '@/features/chat/components/editor/plugins/ai-kit';
// import { CopilotKit } from '@/features/chat/components/editor/plugins/copilot-kit';
import { CommentKit } from '@/features/comment/components/editor/plugins/comment-kit';
import { DiscussionKit } from '@/features/comment/components/editor/plugins/discussion-kit';
import { SuggestionKit } from '@/features/comment/components/editor/plugins/suggestion-kit';
import { TrailingBlockPlugin, type Value } from 'platejs';
import { useEditorRef, type TPlateEditor } from 'platejs/react';
import { BasicBlocksKit } from './plugins/basic-blocks-kit';
import { BasicMarksKit } from './plugins/basic-marks-kit';
import { BlockPlaceholderKit } from './plugins/block-placeholder-kit';
import { BlockSelectionKit } from './plugins/block-selection-kit';
import { CodeBlockKit } from './plugins/code-block-kit';
import { CursorOverlayKit } from './plugins/cursor-overlay-kit';
import { DndKit } from './plugins/dnd-kit';
import { FindReplaceKit } from './plugins/find-replace-kit';
import { FloatingToolbarKit } from './plugins/floating-toolbar-kit';
import { LinkKit } from './plugins/link-kit';
import { MarkdownKit } from './plugins/markdown-kit';
import { MathKit } from './plugins/math-kit';
import { MediaKit } from './plugins/media-kit';
import { SelectionKit } from './plugins/selection-kit';
import { TableKit } from './plugins/table-kit';
import { TocKit } from './plugins/toc-kit';

export const EditorKit = [
  // ...CopilotKit,
  ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  // ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  // ...CalloutKit,
  // ...ColumnKit,
  ...MathKit,
  // ...DateKit,
  ...LinkKit,
  // ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  // ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  // ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...SelectionKit,
  ...BlockSelectionKit,
  ...DndKit,
  // ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  // ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FloatingToolbarKit,

  // Find
  ...FindReplaceKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
