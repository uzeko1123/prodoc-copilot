import { BlockquoteElement } from '@/components/shadcn/ui/blockquote-node';
import {
  Editor as Editor_,
  EditorContainer,
} from '@/components/shadcn/ui/editor';
import { FixedToolbar } from '@/components/shadcn/ui/fixed-toolbar';
import {
  H1Element,
  H2Element,
  H3Element,
} from '@/components/shadcn/ui/heading-node';
import { MarkToolbarButton } from '@/components/shadcn/ui/mark-toolbar-button';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

const initialValue: Value = [
  {
    children: [{ text: 'Title' }],
    type: 'h3',
  },
  {
    children: [
      {
        children: [{ text: 'This is a quote.' }],
        type: 'p',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { text: 'With some ' },
      { bold: true, text: 'bold' },
      { text: ' text for emphasis!' },
    ],
    type: 'p',
  },
];

export function Editor() {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
    ],
    value: () => {
      const savedValue = localStorage.getItem('installation-react-demo');
      return savedValue ? JSON.parse(savedValue) : initialValue;
    },
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        localStorage.setItem('installation-react-demo', JSON.stringify(value));
      }}
    >
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>
          Quote
        </ToolbarButton>
        <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
          U
        </MarkToolbarButton>
        <div className="flex-1" />
        <ToolbarButton
          className="px-2"
          onClick={() => editor.tf.setValue(initialValue)}
        >
          Reset
        </ToolbarButton>
      </FixedToolbar>
      <EditorContainer>
        <Editor_ placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
