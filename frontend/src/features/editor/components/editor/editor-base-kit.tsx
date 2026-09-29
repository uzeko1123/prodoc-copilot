import { BaseAlignKit } from '@/components/shadcn/editor/plugins/align-base-kit';
// import { BaseCalloutKit } from '@/components/shadcn/editor/plugins/callout-base-kit';
import { BaseCodeBlockKit } from '@/components/shadcn/editor/plugins/code-block-base-kit';
// import { BaseColumnKit } from '@/components/shadcn/editor/plugins/column-base-kit';
import { BaseCommentKit } from '@/components/shadcn/editor/plugins/comment-base-kit';
// import { BaseDateKit } from '@/components/shadcn/editor/plugins/date-base-kit';
import { BaseFontKit } from '@/components/shadcn/editor/plugins/font-base-kit';
// import { BaseFootnoteKit } from '@/components/shadcn/editor/plugins/footnote-base-kit';
// import { BaseLineHeightKit } from '@/components/shadcn/editor/plugins/line-height-base-kit';
import { BaseLinkKit } from '@/components/shadcn/editor/plugins/link-base-kit';
import { BaseListKit } from '@/components/shadcn/editor/plugins/list-base-kit';
import { MarkdownKit } from '@/components/shadcn/editor/plugins/markdown-kit';
import { BaseMathKit } from '@/components/shadcn/editor/plugins/math-base-kit';
import { BaseMediaKit } from '@/components/shadcn/editor/plugins/media-base-kit';
// import { BaseMentionKit } from '@/components/shadcn/editor/plugins/mention-base-kit';
import { BaseSuggestionKit } from '@/components/shadcn/editor/plugins/suggestion-base-kit';
import { BaseTocKit } from '@/components/shadcn/editor/plugins/toc-base-kit';
// import { BaseToggleKit } from '@/components/shadcn/editor/plugins/toggle-base-kit';
import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from './plugins/basic-marks-base-kit';
import { BaseTableKit } from './plugins/table-base-kit';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseCodeBlockKit,
  ...BaseTableKit,
  // ...BaseToggleKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  // ...BaseCalloutKit,
  // ...BaseColumnKit,
  ...BaseMathKit,
  // ...BaseDateKit,
  ...BaseLinkKit,
  // ...BaseMentionKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  // ...BaseLineHeightKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
  ...MarkdownKit,
  // ...BaseFootnoteKit,
];
