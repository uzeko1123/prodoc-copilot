import { Button } from '@/components/shadcn/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/resizable';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/tabs';
import { Chat } from '@/features/chat/components/chat';
import { Comment } from '@/features/comment/components/comment';
import { Editor } from '@/features/editor/components/editor';
import { EditorKit } from '@/features/editor/components/editor/editor-kit';
import { useWorkbenchStore, type ActiveTab } from '@/stores/workbench';
import { createFileRoute } from '@tanstack/react-router';
import { PanelRightIcon } from 'lucide-react';
import { normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { useRef, useState } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

function WorkbenchPage() {
  const activeTab = useWorkbenchStore((state) => state.activeTab);
  const setActiveTab = useWorkbenchStore((state) => state.setActiveTab);

  const sidePanelRef = useRef<PanelImperativeHandle>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const toggleSidePanel = () => {
    if (isSidePanelOpen) {
      sidePanelRef.current?.collapse();
      setIsSidePanelOpen(false);
    } else {
      sidePanelRef.current?.expand();
      setIsSidePanelOpen(true);
    }
  };

  const handleSidePanelResize = () => {
    setIsSidePanelOpen(!sidePanelRef.current?.isCollapsed());
  };

  const editor = usePlateEditor({
    plugins: EditorKit,
    value,
  });

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">Workbench</h1>
      </header>

      <Plate editor={editor}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="10%" minSize="10%"></ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="40%">
            <Editor />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="20%" minSize="15%">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as ActiveTab)}
              className="h-full gap-0"
            >
              <TabsList
                variant="line"
                className="h-10 max-h-10 min-h-10 w-full border-b"
              >
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="comment">Comment</TabsTrigger>
                <Button
                  variant="ghost"
                  aria-expanded={isSidePanelOpen}
                  onClick={toggleSidePanel}
                >
                  <PanelRightIcon />
                </Button>
              </TabsList>
              <TabsContent value="chat" className="min-h-0">
                <Chat />
              </TabsContent>
              <TabsContent value="comment" className="min-h-0">
                <Comment />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            collapsible
            defaultSize="20%"
            minSize="15%"
            panelRef={sidePanelRef}
            onResize={handleSidePanelResize}
          ></ResizablePanel>
        </ResizablePanelGroup>
      </Plate>
    </div>
  );
}

export const Route = createFileRoute('/workbench/')({
  component: WorkbenchPage,
});

const value = normalizeStaticValue([
  {
    children: [{ text: 'Welcome to the Plate Playground!' }],
    type: 'h1',
  },
  {
    children: [
      { text: 'Experience a modern rich-text editor built with ' },
      { children: [{ text: 'Slate' }], type: 'a', url: 'https://slatejs.org' },
      { text: ' and ' },
      { children: [{ text: 'React' }], type: 'a', url: 'https://reactjs.org' },
      {
        text: ". This playground showcases just a part of Plate's capabilities. ",
      },
      {
        children: [{ text: 'Explore the documentation' }],
        type: 'a',
        url: '/docs',
      },
      { text: ' to discover more.' },
    ],
    type: 'p',
  },
  // Suggestions & Comments Section
  {
    children: [{ text: 'Collaborative Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Review and refine content seamlessly. Use ' },
      {
        children: [
          {
            suggestion: true,
            suggestion_playground1: {
              id: 'playground1',
              createdAt: Date.now(),
              type: 'insert',
              userId: 'alice',
            },
            text: 'suggestions',
          },
        ],
        type: 'a',
        url: '/docs/suggestion',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: ' ',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: 'like this added text',
      },
      { text: ' or to ' },
      {
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'bob',
        },
        text: 'mark text for removal',
      },
      { text: '. Discuss changes using ' },
      {
        children: [
          { comment: true, comment_discussion1: true, text: 'comments' },
        ],
        type: 'a',
        url: '/docs/comment',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' on many text segments',
      },
      { text: '. You can even have ' },
      {
        comment: true,
        comment_discussion2: true,
        suggestion: true,
        suggestion_playground3: {
          id: 'playground3',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'charlie',
        },
        text: 'overlapping',
      },
      { text: ' annotations!' },
    ],
    type: 'p',
  },
  // {
  //   children: [
  //     {
  //       text: 'Block-level suggestions are also supported for broader feedback.',
  //     },
  //   ],
  //   suggestion: {
  //     suggestionId: 'suggestionBlock1',
  //     type: 'block',
  //     userId: 'charlie',
  //   },
  //   type: 'p',
  // },
  // AI Section
  {
    children: [{ text: 'AI-Powered Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Boost your productivity with integrated ' },
      {
        children: [{ text: 'AI SDK' }],
        type: 'a',
        url: '/docs/ai',
      },
      { text: '. Press ' },
      { kbd: true, text: '⌘+J' },
      { text: ' or ' },
      { kbd: true, text: 'Space' },
      { text: ' in an empty line to:' },
    ],
    type: 'p',
  },
  {
    children: [
      { text: 'Generate content (continue writing, summarize, explain)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Edit existing text (improve, fix grammar, change tone)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  // Core Features Section (Combined)
  {
    children: [{ text: 'Rich Content Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Structure your content with ' },
      {
        children: [{ text: 'headings' }],
        type: 'a',
        url: '/docs/heading',
      },
      { text: ', ' },
      {
        children: [{ text: 'lists' }],
        type: 'a',
        url: '/docs/list',
      },
      { text: ', and ' },
      {
        children: [{ text: 'quotes' }],
        type: 'a',
        url: '/docs/blockquote',
      },
      { text: '. Apply ' },
      {
        children: [{ text: 'marks' }],
        type: 'a',
        url: '/docs/basic-marks',
      },
      { text: ' like ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'strikethrough' },
      { text: ', and ' },
      { code: true, text: 'code' },
      { text: '. Use ' },
      {
        children: [{ text: 'autoformatting' }],
        type: 'a',
        url: '/docs/autoformat',
      },
      { text: ' for ' },
      {
        children: [{ text: 'Markdown' }],
        type: 'a',
        url: '/docs/markdown',
      },
      { text: '-like shortcuts (e.g., ' },
      { kbd: true, text: '* ' },
      { text: ' for lists, ' },
      { kbd: true, text: '# ' },
      { text: ' for H1).' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Blockquotes can group paragraphs, quoted lists, and reply chains.',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'Markdown blockquotes keep this nested structure instead of flattening it.',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'Quoted list item inside the same container.',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            children: [{ text: 'Nested blockquotes work here too.' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { children: [{ text: 'function hello() {' }], type: 'code_line' },
      {
        children: [{ text: "  console.info('Code blocks are supported!');" }],
        type: 'code_line',
      },
      { children: [{ text: '}' }], type: 'code_line' },
    ],
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [
      { text: 'Create ' },
      {
        children: [{ text: 'links' }],
        type: 'a',
        url: '/docs/link',
      },
      { text: ', ' },
      {
        children: [{ text: '@mention' }],
        type: 'a',
        url: '/docs/mention',
      },
      { text: ' users like ' },
      { children: [{ text: '' }], type: 'mention', value: 'Alice' },
      { text: ', or insert ' },
      {
        children: [{ text: 'emojis' }],
        type: 'a',
        url: '/docs/emoji',
      },
      { text: ' ✨. Use the ' },
      {
        children: [{ text: 'slash command' }],
        type: 'a',
        url: '/docs/slash-command',
      },
      { text: ' (/) for quick access to elements.' },
    ],
    type: 'p',
  },
  // Table Section
  {
    children: [{ text: 'How Plate Compares' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Plate offers many features out-of-the-box as free, open-source plugins.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              { children: [{ bold: true, text: 'Feature' }], type: 'p' },
            ],
            type: 'th',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Plate (Free & OSS)' }],
                type: 'p',
              },
            ],
            type: 'th',
          },
          {
            children: [
              { children: [{ bold: true, text: 'Tiptap' }], type: 'p' },
            ],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'AI' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Comments' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Suggestions' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Paid (Comments Pro)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Emoji Picker' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Table of Contents' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Drag Handle' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Collaboration (Yjs)' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Hocuspocus (OSS/Paid)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },
  // Media Section
  {
    children: [{ text: 'Images and Media' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Embed rich media like images directly in your content. Supports ',
      },
      {
        children: [{ text: 'Media uploads' }],
        type: 'a',
        url: '/docs/media',
      },
      {
        text: ' and ',
      },
      {
        children: [{ text: 'drag & drop' }],
        type: 'a',
        url: '/docs/dnd',
      },
      {
        text: ' for a smooth experience.',
      },
    ],
    type: 'p',
  },
  {
    attributes: { align: 'center' },
    caption: [
      {
        children: [{ text: 'Images with captions provide context.' }],
        type: 'p',
      },
    ],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '75%',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'sample.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },
  {
    children: [{ text: '' }],
    type: 'audio',
    url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  },
  {
    children: [{ text: 'Table of Contents' }],
    type: 'h3',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
]);
