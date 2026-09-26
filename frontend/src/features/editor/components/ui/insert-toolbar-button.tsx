'use client';

import { insertBlock } from '@/components/shadcn/editor/transforms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import {
  ToolbarButton,
  ToolbarMenuGroup,
} from '@/components/shadcn/ui/toolbar';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  FileCodeIcon,
  FileUpIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef, type PlateEditor } from 'platejs/react';
import * as React from 'react';

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'Paragraph',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: 'Heading 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: 'Heading 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: 'Heading 3',
        value: 'h3',
      },
      {
        icon: <Heading4Icon />,
        label: 'Heading 4',
        value: 'h4',
      },
      {
        icon: <Heading5Icon />,
        label: 'Heading 5',
        value: 'h5',
      },
      {
        icon: <MinusIcon />,
        label: 'Divider',
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Lists',
    items: [
      {
        icon: <ListIcon />,
        label: 'Bulleted list',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: 'Numbered list',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: 'To-do list',
        value: KEYS.listTodo,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Table & Media',
    items: [
      {
        icon: <TableIcon />,
        label: 'Table',
        value: KEYS.table,
      },
      {
        icon: <ImageIcon />,
        label: 'Image',
        value: KEYS.img,
      },
      {
        icon: <FileUpIcon />,
        label: 'File',
        value: KEYS.file,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: 'Table of contents',
        value: KEYS.toc,
      },
      {
        icon: <FileCodeIcon />,
        label: 'Code',
        value: KEYS.codeBlock,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Equation',
        value: KEYS.equation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-125 w-auto min-w-0 flex-col overflow-y-auto"
        align="center"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-45"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon} {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
