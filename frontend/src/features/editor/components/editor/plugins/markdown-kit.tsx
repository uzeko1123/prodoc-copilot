import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '@platejs/footnote';
import {
  convertNodesDeserialize,
  MarkdownPlugin,
  remarkMdx,
} from '@platejs/markdown';
import { KEYS } from 'platejs';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  BaseFootnoteReferencePlugin,
  BaseFootnoteDefinitionPlugin,
  MarkdownPlugin.configure({
    options: {
      plainMarks: [KEYS.suggestion, KEYS.comment],
      remarkPlugins: [
        remarkMath,
        remarkGfm,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remarkEmoji as any,
        remarkMdx,
      ],
      rules: {
        blockquote: {
          deserialize: (mdastNode, deco, options) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            convertNodesDeserialize(mdastNode.children, deco, options) as any,
        },
      },
    },
  }),
];
