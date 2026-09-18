import { faker } from '@faker-js/faker';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { createChat } from '@shadcn/helpers/ai-sdk';
import { KEYS, nanoid, NodeApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';

//#region @shadcn/helpers/ai-sdk

export const chat = createChat()
  .user(
    "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.",
  )
  .sleep(1000)
  .assistant(({ writer }) => {
    writer.reasoning(
      'They are describing a streaming transcript that keeps taking control of the viewport. I should explain when auto-scroll follows and when it stops.',
    );
    writer.sleep(1000);
    writer.text(
      "That's the classic streaming scroll problem. Wrap your message list in `MessageScroller` and turn on `autoScroll` — the viewport pins to the bottom as tokens arrive, so users always see the latest text land in place.\n\nThe important part: it only auto-scrolls while the reader is already at the bottom. The moment they scroll up to read something earlier, auto-scroll backs off and their position is preserved. You get smooth streaming without fighting the user's intent.",
    );
  })
  .user(
    'Okay, but when someone sends a new message the view still feels jarring — like the whole conversation reloads from the top.',
  )
  .sleep(1000)
  .assistant(
    "MessageScrollerItem fixes that with turn anchoring. Set `scrollAnchor` on the turn that should settle near the top instead of blindly snapping to the document bottom.\n\nIt also leaves a small peek of the previous exchange visible above the anchor, so context isn't lost. The reply starts in view without that disorienting jump you get from a plain overflow container.",
  )
  .user(
    "And if they've scrolled up to re-read an older answer? I don't want to yank them back down.",
  )
  .sleep(1000)
  .assistant(
    "You won't. Auto-scroll only runs when the viewport is already pinned to the bottom, so scrolling up is a deliberate opt-out — their place in the thread stays put even as new tokens keep arriving below.\n\nWhen there is content they haven't seen yet, `MessageScrollerButton` appears at the bottom of the viewport. One tap jumps them back to the newest message and re-engages auto-scroll. Same pattern as Slack or iMessage: quiet when you're caught up, helpful when you're not.",
  )
  .user('Last one — does this work with assistive tech?')
  .sleep(1000)
  .assistant(
    '`MessageScrollerContent` sets `role="log"` and `aria-relevant="additions"` by default, so screen readers announce new messages as they stream in.\n\nThe scroll button is a real `<button>` with an sr-only label, and it\'s removed from the tab order when you\'re already at the bottom — no ghost focus stops.',
  );
export const initialMessages = chat.get(0);
export const transport = chat.transport({ delayMs: 20 });

//#endregion

//#region  @platejs/ai

export async function mockApiResponse(
  editor: PlateEditor,
  init: RequestInit | undefined,
  abortControllerRef: React.RefObject<AbortController | null>,
) {
  let sample: 'comment' | 'markdown' | 'mdx' | 'table' | null = null;

  try {
    const body = JSON.parse(init?.body as string);
    const content = body.messages
      .at(-1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .parts.find((p: any) => p.type === 'text')?.text;

    if (content.includes('Generate a markdown sample')) {
      sample = 'markdown';
    } else if (content.includes('Generate a mdx sample')) {
      sample = 'mdx';
    } else if (content.includes('comment')) {
      sample = 'comment';
    }

    // Detect table editing by checking if multiple table cells are selected
    // Single cell selection should use normal edit flow, only multi-cell uses table tool
    if (!sample) {
      // First check: selectedCells from TablePlugin (cell selection mode)
      const selectedCells =
        editor.getOption({ key: KEYS.table }, 'selectedCells') || [];

      if (selectedCells.length > 1) {
        sample = 'table';
      }
      // Second check: selection range spans multiple cells
      else if (body.ctx?.children && body.ctx?.selection) {
        const { selection, children } = body.ctx;
        const anchorPath = selection.anchor?.path;
        const focusPath = selection.focus?.path;

        if (anchorPath && anchorPath.length >= 3) {
          const rootIndex = anchorPath[0];
          const rootNode = children[rootIndex];

          if (rootNode?.type === 'table') {
            // Cell path is at index 2 (table -> row -> cell)
            const anchorCellPath = anchorPath.slice(0, 3).join(',');
            const focusCellPath = focusPath?.slice(0, 3).join(',');

            // Only use table mock if anchor and focus are in different cells
            if (focusCellPath && anchorCellPath !== focusCellPath) {
              sample = 'table';
            }
          }
        }
      }
    }
  } catch {
    sample = null;
  }

  const abortController = new AbortController();
  abortControllerRef.current = abortController;

  await new Promise((resolve) => setTimeout(resolve, 400));

  const stream = fakeStreamText({
    editor,
    sample,
    signal: abortController.signal,
  });

  const response = new Response(stream, {
    headers: {
      Connection: 'keep-alive',
      'Content-Type': 'text/plain',
    },
  });

  return response;
}
// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  editor,
  sample = null,
  signal,
}: {
  editor: PlateEditor;
  chunkCount?: number;
  sample?: 'comment' | 'markdown' | 'mdx' | 'table' | null;
  signal?: AbortSignal;
}) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const blocks = (() => {
        if (sample === 'markdown') {
          return markdownChunks;
        }

        if (sample === 'mdx') {
          return mdxChunks;
        }

        if (sample === 'comment') {
          const commentChunks = createCommentChunks(editor);
          return commentChunks;
        }

        if (sample === 'table') {
          const tableChunks = createTableCellChunks(editor);
          return tableChunks;
        }

        return [
          Array.from({ length: chunkCount }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),

          Array.from({ length: chunkCount + 2 }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),

          Array.from({ length: chunkCount + 4 }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),
        ];
      })();
      if (signal?.aborted) {
        controller.error(new Error('Aborted before start'));
        return;
      }

      const abortHandler = () => {
        controller.error(new Error('Stream aborted'));
      };

      signal?.addEventListener('abort', abortHandler);

      // Generate a unique message ID
      const messageId = `msg_${faker.string.alphanumeric(40)}`;

      // Handle comment and table data differently (they use data events, not text streams)
      if (sample === 'comment' || sample === 'table') {
        controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(encoder.encode('data: {"type":"start-step"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        // For comments and tables, send data events directly
        for (const block of blocks) {
          for (const chunk of block) {
            await new Promise((resolve) => setTimeout(resolve, chunk.delay));

            if (signal?.aborted) {
              signal?.removeEventListener('abort', abortHandler);
              return;
            }

            // Send the data event directly (already formatted as JSON)
            controller.enqueue(encoder.encode(`data: ${chunk.texts}\n\n`));
          }
        }

        // Send the final DONE event
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } else {
        // Send initial stream events for text content
        controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(encoder.encode('data: {"type":"start-step"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(
          encoder.encode(
            `data: {"type":"text-start","id":"${messageId}","providerMetadata":{"openai":{"itemId":"${messageId}"}}}\n\n`,
          ),
        );
        await new Promise((resolve) => setTimeout(resolve, 10));

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];

          // Stream the block content
          for (const chunk of block) {
            await new Promise((resolve) => setTimeout(resolve, chunk.delay));

            if (signal?.aborted) {
              signal?.removeEventListener('abort', abortHandler);
              return;
            }

            // Properly escape the text for JSON
            const escapedText = chunk.texts
              .replace(/\\/g, '\\\\') // Escape backslashes first
              .replace(/"/g, String.raw`\"`) // Escape quotes
              .replace(/\n/g, String.raw`\n`) // Escape newlines
              .replace(/\r/g, String.raw`\r`) // Escape carriage returns
              .replace(/\t/g, String.raw`\t`); // Escape tabs

            controller.enqueue(
              encoder.encode(
                `data: {"type":"text-delta","id":"${messageId}","delta":"${escapedText}"}\n\n`,
              ),
            );
          }

          // Add double newline after each block except the last one
          if (i < blocks.length - 1) {
            controller.enqueue(
              encoder.encode(
                `data: {"type":"text-delta","id":"${messageId}","delta":"\\n\\n"}\n\n`,
              ),
            );
          }
        }

        // Send end events
        controller.enqueue(
          encoder.encode(`data: {"type":"text-end","id":"${messageId}"}\n\n`),
        );
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(encoder.encode('data: {"type":"finish-step"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'));
        await new Promise((resolve) => setTimeout(resolve, 10));

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      }

      signal?.removeEventListener('abort', abortHandler);
      controller.close();
    },
  });
};

const delay = faker.number.int({ max: 20, min: 5 });

const markdownChunks = [
  [
    { delay, texts: 'Make text ' },
    { delay, texts: '**bold**' },
    { delay, texts: ', ' },
    { delay, texts: '*italic*' },
    { delay, texts: ', ' },
    { delay, texts: '__underlined__' },
    { delay, texts: ', or apply a ' },
    {
      delay,
      texts: '***combination***',
    },
    { delay, texts: ' ' },
    { delay, texts: 'of ' },
    { delay, texts: 'these ' },
    { delay, texts: 'styles ' },
    { delay, texts: 'for ' },
    { delay, texts: 'a ' },
    { delay, texts: 'visually ' },
    { delay, texts: 'striking ' },
    { delay, texts: 'effect.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Add ' },
    {
      delay,
      texts: '~~strikethrough~~',
    },
    { delay, texts: ' ' },
    { delay, texts: 'to ' },
    { delay, texts: 'indicate ' },
    { delay, texts: 'deleted ' },
    { delay, texts: 'or ' },
    { delay, texts: 'outdated ' },
    { delay, texts: 'content.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Write ' },
    { delay, texts: 'code ' },
    { delay, texts: 'snippets ' },
    { delay, texts: 'with ' },
    { delay, texts: 'inline ' },
    { delay, texts: '`code`' },
    { delay, texts: ' formatting ' },
    { delay, texts: 'for ' },
    { delay, texts: 'easy ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'readability.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Add ' },
    {
      delay,
      texts: '[links](https://example.com)',
    },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: ' to ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'external ' },
    { delay, texts: 'resources ' },
    { delay, texts: 'or ' },
    {
      delay,
      texts: 'references.\n\n',
    },

    { delay, texts: 'Use ' },
    { delay, texts: 'inline ' },
    { delay, texts: 'math ' },
    { delay, texts: 'equations ' },
    { delay, texts: 'like ' },
    { delay, texts: '$E = mc^2$ ' },
    { delay, texts: 'for ' },
    { delay, texts: 'scientific ' },
    { delay, texts: 'notation.' },
    { delay, texts: '\n\n' },

    { delay, texts: '# ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '1\n\n' },
    { delay, texts: '## ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '### ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '3\n\n' },
    { delay, texts: '> ' },
    { delay, texts: 'Blockquote\n\n' },
    { delay, texts: '- ' },
    { delay, texts: 'Unordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '- ' },
    { delay, texts: 'Unordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '1. ' },
    { delay, texts: 'Ordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '2. ' },
    { delay, texts: 'Ordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '- ' },
    { delay, texts: '[ ' },
    { delay, texts: '] ' },
    { delay, texts: 'Task ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '- ' },
    { delay, texts: '[x] ' },
    { delay, texts: 'Task ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '![Alt ' },
    {
      delay,
      texts:
        'text](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay,
      texts: '### Advantage blocks:\n',
    },
    { delay, texts: '\n' },
    { delay, texts: '$$\n' },
    {
      delay,
      texts: 'a^2 + b^2 = c^2\n',
    },
    { delay, texts: '$$\n' },
    { delay, texts: '\n' },
    { delay, texts: '```python\n' },
    { delay, texts: '# ' },
    { delay, texts: 'Code ' },
    { delay, texts: 'block\n' },
    { delay, texts: 'print("Hello, ' },
    { delay, texts: 'World!")\n' },
    { delay, texts: '```\n\n' },
    { delay, texts: 'Horizontal ' },
    { delay, texts: 'rule\n\n' },
    { delay, texts: '---\n\n' },
    { delay, texts: '| ' },
    { delay, texts: 'Header ' },
    { delay, texts: '1 ' },
    { delay, texts: '| ' },
    { delay, texts: 'Header ' },
    { delay, texts: '2 ' },
    { delay, texts: '|\n' },
    {
      delay,
      texts: '|----------|----------|\n',
    },
    { delay, texts: '| ' },
    { delay, texts: 'Row ' },
    { delay, texts: '1   ' },
    { delay, texts: ' | ' },
    { delay, texts: 'Data    ' },
    { delay, texts: ' |\n' },
    { delay, texts: '| ' },
    { delay, texts: 'Row ' },
    { delay, texts: '2   ' },
    { delay, texts: ' | ' },
    { delay, texts: 'Data    ' },
    { delay, texts: ' |' },
  ],
];

const mdxChunks = [
  [
    {
      delay,
      texts: '## ',
    },
    {
      delay,
      texts: 'Basic ',
    },
    {
      delay,
      texts: 'Markdown\n\n',
    },
    {
      delay,
      texts: '> ',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'following ',
    },
    {
      delay,
      texts: 'node ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'marks ',
    },
    {
      delay,
      texts: 'is ',
    },
    {
      delay,
      texts: 'supported ',
    },
    {
      delay,
      texts: 'by ',
    },
    {
      delay,
      texts: 'the ',
    },
    {
      delay,
      texts: 'Markdown ',
    },
    {
      delay,
      texts: 'standard.\n\n',
    },
    {
      delay,
      texts: 'Format ',
    },
    {
      delay,
      texts: 'text ',
    },
    {
      delay,
      texts: 'with **b',
    },
    {
      delay,
      texts: 'old**, _',
    },
    {
      delay,
      texts: 'italic_,',
    },
    {
      delay,
      texts: ' _**comb',
    },
    {
      delay,
      texts: 'ined sty',
    },
    {
      delay,
      texts: 'les**_, ',
    },
    {
      delay,
      texts: '~~strike',
    },
    {
      delay,
      texts: 'through~',
    },
    {
      delay,
      texts: '~, `code',
    },
    {
      delay,
      texts: '` format',
    },
    {
      delay,
      texts: 'ting, an',
    },
    {
      delay,
      texts: 'd [hyper',
    },
    {
      delay,
      texts: 'links](https://en.wikipedia.org/wiki/Hypertext).\n\n',
    },
    {
      delay,
      texts: '```javascript\n',
    },
    {
      delay,
      texts: '// Use code blocks to showcase code snippets\n',
    },
    {
      delay,
      texts: 'function greet() {\n',
    },
    {
      delay,
      texts: '  console.info("Hello World!")\n',
    },
    {
      delay,
      texts: '}\n',
    },
    {
      delay,
      texts: '```\n\n',
    },
    {
      delay,
      texts: '- Simple',
    },
    {
      delay,
      texts: ' lists f',
    },
    {
      delay,
      texts: 'or organ',
    },
    {
      delay,
      texts: 'izing co',
    },
    {
      delay,
      texts: 'ntent\n',
    },
    {
      delay,
      texts: '1. ',
    },
    {
      delay,
      texts: 'Numbered ',
    },
    {
      delay,
      texts: 'lists ',
    },
    {
      delay,
      texts: 'for ',
    },
    {
      delay,
      texts: 'sequential ',
    },
    {
      delay,
      texts: 'steps\n\n',
    },
    {
      delay,
      texts: '| **Plugin**  | **Element** | **Inline** | **Void** |\n',
    },
    {
      delay,
      texts: '| ----------- | ----------- | ---------- | -------- |\n',
    },
    {
      delay,
      texts: '| **Heading** |             |            | No       |\n',
    },
    {
      delay,
      texts: '| **Image**   | Yes         | No         | Yes      |\n',
    },
    {
      delay,
      texts: '| **Ment',
    },
    {
      delay,
      texts: 'ion** | Yes         | Yes        | Yes      |\n\n',
    },
    {
      delay,
      texts:
        '![](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay,
      texts: '- [x] Co',
    },
    {
      delay,
      texts: 'mpleted ',
    },
    {
      delay,
      texts: 'tasks\n',
    },
    {
      delay,
      texts: '- [ ] Pe',
    },
    {
      delay,
      texts: 'nding ta',
    },
    {
      delay,
      texts: 'sks\n\n',
    },
    {
      delay,
      texts: '---\n\n## Advan',
    },
    {
      delay,
      texts: 'ced Feat',
    },
    {
      delay,
      texts: 'ures\n\n',
    },
    {
      delay,
      texts: '<callout> ',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'following ',
    },
    {
      delay,
      texts: 'node ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'marks ',
    },
    {
      delay,
      texts: 'are ',
    },
    {
      delay,
      texts: 'not ',
    },
    {
      delay,
      texts: 'supported ',
    },
    {
      delay,
      texts: 'in ',
    },
    {
      delay,
      texts: 'Markdown ',
    },
    {
      delay,
      texts: 'but ',
    },
    {
      delay,
      texts: 'can ',
    },
    {
      delay,
      texts: 'be ',
    },
    {
      delay,
      texts: 'serialized ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'deserialized ',
    },
    {
      delay,
      texts: 'using ',
    },
    {
      delay,
      texts: 'MDX ',
    },
    {
      delay,
      texts: 'or ',
    },
    {
      delay,
      texts: 'specialized ',
    },
    {
      delay,
      texts: 'UnifiedJS ',
    },
    {
      delay,
      texts: 'plugins. ',
    },
    {
      delay,
      texts: '</callout>\n\n',
    },
    {
      delay,
      texts: 'Advanced ',
    },
    {
      delay,
      texts: 'marks: ',
    },
    {
      delay,
      texts: '<kbd>⌘ ',
    },
    {
      delay,
      texts: '+ ',
    },
    {
      delay,
      texts: 'B</kbd>,<u>underlined</u>, ',
    },
    {
      delay,
      texts: '<mark',
    },
    {
      delay,
      texts: '>highli',
    },
    {
      delay,
      texts: 'ghted</m',
    },
    {
      delay,
      texts: 'ark',
    },
    {
      delay,
      texts: '> text, ',
    },
    {
      delay,
      texts: '<span s',
    },
    {
      delay,
      texts: 'tyle="co',
    },
    {
      delay,
      texts: 'lor: #93',
    },
    {
      delay,
      texts: 'C47D;">c',
    },
    {
      delay,
      texts: 'olored t',
    },
    {
      delay,
      texts: 'ext</spa',
    },
    {
      delay,
      texts: 'n> and ',
    },
    {
      delay,
      texts: '<spa',
    },
    {
      delay,
      texts: 'n',
    },
    {
      delay,
      texts: ' style="',
    },
    {
      delay,
      texts: 'backgrou',
    },
    {
      delay,
      texts: 'nd-color',
    },
    {
      delay,
      texts: ': #6C9EE',
    },
    {
      delay,
      texts: 'B;">back',
    },
    {
      delay,
      texts: 'ground h',
    },
    {
      delay,
      texts: 'ighlight',
    },
    {
      delay,
      texts: 's</spa',
    },
    {
      delay,
      texts: 'n> for ',
    },
    {
      delay,
      texts: 'visual e',
    },
    {
      delay,
      texts: 'mphasis.\n\n',
    },
    {
      delay,
      texts: 'Superscript ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: 'E=mc<sup>2</sup> ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'subscript ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: 'H<sub>2</sub>O ',
    },
    {
      delay,
      texts: 'demonstrate ',
    },
    {
      delay,
      texts: 'mathematical ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'chemical ',
    },
    {
      delay,
      texts: 'notation ',
    },
    {
      delay,
      texts: 'capabilities.\n\n',
    },
    {
      delay,
      texts: 'Add ',
    },
    {
      delay,
      texts: 'mentions ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: '@BB-8, d',
    },
    {
      delay,
      texts: 'ates (<d',
    },
    {
      delay,
      texts: 'ate>2025',
    },
    {
      delay,
      texts: '-05-08</',
    },
    {
      delay,
      texts: 'date>), ',
    },
    {
      delay,
      texts: 'and math',
    },
    {
      delay,
      texts: ' formula',
    },
    {
      delay,
      texts: 's ($E=mc',
    },
    {
      delay,
      texts: '^2$).\n\n',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'table ',
    },
    {
      delay,
      texts: 'of ',
    },
    {
      delay,
      texts: 'contents ',
    },
    {
      delay,
      texts: 'feature ',
    },
    {
      delay,
      texts: 'automatically ',
    },
    {
      delay,
      texts: 'generates ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'structure ',
    },
    {
      delay,
      texts: 'for ',
    },
    {
      delay,
      texts: 'easy ',
    },
    {
      delay,
      texts: 'navigation.\n\n',
    },
    {
      delay,
      texts: '<toc ',
    },
    {
      delay,
      texts: '/>\n\n',
    },
    {
      delay,
      texts: 'Math ',
    },
    {
      delay,
      texts: 'formula ',
    },
    {
      delay,
      texts: 'support ',
    },
    {
      delay,
      texts: 'makes ',
    },
    {
      delay,
      texts: 'displaying ',
    },
    {
      delay,
      texts: 'complex ',
    },
    {
      delay,
      texts: 'mathematical ',
    },
    {
      delay,
      texts: 'expressions ',
    },
    {
      delay,
      texts: 'simple.\n\n',
    },
    {
      delay,
      texts: '$$\n',
    },
    {
      delay,
      texts: 'a^2',
    },
    {
      delay,
      texts: '+b^2',
    },
    {
      delay,
      texts: '=c^2\n',
    },
    {
      delay,
      texts: '$$\n\n',
    },
    {
      delay,
      texts: 'Multi-co',
    },
    {
      delay,
      texts: 'lumn lay',
    },
    {
      delay,
      texts: 'out feat',
    },
    {
      delay,
      texts: 'ures ena',
    },
    {
      delay,
      texts: 'ble rich',
    },
    {
      delay,
      texts: 'er page ',
    },
    {
      delay,
      texts: 'designs ',
    },
    {
      delay,
      texts: 'and cont',
    },
    {
      delay,
      texts: 'ent layo',
    },
    {
      delay,
      texts: 'uts.\n\n',
    },
    // {
    //  delay,
    //   texts: '<column_group layout="[50,50]">\n',
    // },
    // {
    //  delay,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //  delay,
    //   texts: '  left\n',
    // },
    // {
    //  delay,
    //   texts: '</column>\n',
    // },
    // {
    //  delay,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //  delay,
    //   texts: '  right\n',
    // },
    // {
    //  delay,
    //   texts: '</column>\n',
    // },
    // {
    //  delay,
    //   texts: '</column_group>\n\n',
    // },
    {
      delay,
      texts: 'PDF ',
    },
    {
      delay,
      texts: 'embedding ',
    },
    {
      delay,
      texts: 'makes ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'referencing ',
    },
    {
      delay,
      texts: 'simple ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'intuitive.\n\n',
    },
    {
      delay,
      texts: '<file ',
    },
    {
      delay,
      texts: 'name="sample.pdf" ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" isUpload="true" />\n\n',
    },
    {
      delay,
      texts: 'Audio ',
    },
    {
      delay,
      texts: 'players ',
    },
    {
      delay,
      texts: 'can ',
    },
    {
      delay,
      texts: 'be ',
    },
    {
      delay,
      texts: 'embedded ',
    },
    {
      delay,
      texts: 'directly ',
    },
    {
      delay,
      texts: 'into ',
    },
    {
      delay,
      texts: 'documents, ',
    },
    {
      delay,
      texts: 'supporting ',
    },
    {
      delay,
      texts: 'online ',
    },
    {
      delay,
      texts: 'audio ',
    },
    {
      delay,
      texts: 'resources.\n\n',
    },
    {
      delay,
      texts: '<audio ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%" />\n\n',
    },
    {
      delay,
      texts: 'Video ',
    },
    {
      delay,
      texts: 'playback ',
    },
    {
      delay,
      texts: 'features ',
    },
    {
      delay,
      texts: 'support ',
    },
    {
      delay,
      texts: 'embedding ',
    },
    {
      delay,
      texts: 'various ',
    },
    {
      delay,
      texts: 'online ',
    },
    {
      delay,
      texts: 'video ',
    },
    {
      delay,
      texts: 'resources, ',
    },
    {
      delay,
      texts: 'enriching ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'content.\n\n',
    },
    {
      delay,
      texts: '<video ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" isUpload="true" />',
    },
  ],
];

const createCommentChunks = (editor: PlateEditor) => {
  const selectedBlocksApi = editor.getApi(BlockSelectionPlugin).blockSelection;

  const selectedBlocks = selectedBlocksApi
    .getNodes({
      selectionFallback: true,
      sort: true,
    })
    .map(([block]) => block);

  const isSelectingSome = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome',
  );

  const blocks =
    selectedBlocks.length > 0 && (editor.api.isExpanded() || isSelectingSome)
      ? selectedBlocks
      : editor.children;

  const max = blocks.length;

  const commentCount = Math.ceil(max / 2);

  const result = new Set<number>();

  while (result.size < commentCount) {
    const num = Math.floor(Math.random() * max); // 0 to max-1 (fixed: was 1 to max)
    result.add(num);
  }

  const indexes = Array.from(result).sort((a, b) => a - b);

  const chunks = indexes
    .map((index, i) => {
      const block = blocks[index];
      if (!block) {
        return [];
      }

      const blockString = NodeApi.string(block);
      const endIndex = blockString.indexOf('.');
      const content =
        endIndex === -1 ? blockString : blockString.slice(0, endIndex);

      return [
        {
          delay: faker.number.int({ max: 500, min: 200 }),
          texts: `{"id":"${nanoid()}","data":{"comment":{"blockId":"${block.id}","comment":"${faker.lorem.sentence()}","content":"${content}"},"status":"${i === indexes.length - 1 ? 'finished' : 'streaming'}"},"type":"data-comment"}`,
        },
      ];
    })
    .filter((chunk) => chunk.length > 0);

  const result_chunks = [
    [{ delay: 50, texts: '{"data":"comment","type":"data-toolName"}' }],
    ...chunks,
  ];

  return result_chunks;
};

const createTableCellChunks = (editor: PlateEditor) => {
  // Get selected table cells from the TablePlugin
  const selectedCells =
    editor.getOption({ key: KEYS.table }, 'selectedCells') || [];

  // If no cells selected, try to get cells from current selection
  let cellIds: string[] = [];

  if (selectedCells.length > 0) {
    cellIds = selectedCells
      .map((cell: { id?: string }) => cell.id)
      .filter(Boolean);
  } else {
    // Try to find table cells in current selection
    const cells = Array.from(
      editor.api.nodes({
        at: editor.selection ?? undefined,
        match: (n) =>
          (n as { type?: string }).type === KEYS.td ||
          (n as { type?: string }).type === KEYS.th,
      }),
    );
    cellIds = cells
      .map(([node]) => (node as { id?: string }).id)
      .filter(Boolean) as string[];
  }

  // If still no cells, return empty chunks
  if (cellIds.length === 0) {
    return [
      [{ delay: 50, texts: '{"data":"edit","type":"data-toolName"}' }],
      [
        {
          delay: 100,
          texts: `{"id":"${nanoid()}","data":{"cellUpdate":null,"status":"finished"},"type":"data-table"}`,
        },
      ],
    ];
  }

  // Generate mock content for each cell
  const chunks = cellIds.map((cellId, i) => [
    {
      delay: faker.number.int({ max: 300, min: 100 }),
      texts: `{"id":"${nanoid()}","data":{"cellUpdate":{"id":"${cellId}","content":"${faker.lorem.sentence()}"},"status":"${i === cellIds.length - 1 ? 'finished' : 'streaming'}"},"type":"data-table"}`,
    },
  ]);

  const result_chunks = [
    [{ delay: 50, texts: '{"data":"edit","type":"data-toolName"}' }],
    ...chunks,
  ];

  return result_chunks;
};

//#endregion
