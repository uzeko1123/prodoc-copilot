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
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  RadicalIcon,
  SquareIcon,
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
    group: '正文 & 标题',
    items: [
      {
        icon: <PilcrowIcon />,
        label: '正文',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: '标题 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: '标题 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: '标题 3',
        value: 'h3',
      },
      {
        icon: <Heading4Icon />,
        label: '标题 4',
        value: 'h4',
      },
      {
        icon: <Heading5Icon />,
        label: '标题 5',
        value: 'h5',
      },
      {
        icon: <Heading6Icon />,
        label: '标题 6',
        value: 'h6',
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '列表',
    items: [
      {
        icon: <ListIcon />,
        label: '符号列表',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: '编号列表',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: '待办列表',
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
    group: '高级',
    items: [
      {
        icon: <FileCodeIcon />,
        label: '代码块',
        value: KEYS.codeBlock,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: '公式块',
        value: KEYS.equation,
      },
      {
        icon: <MinusIcon />,
        label: '分隔线',
        value: KEYS.hr,
      },
      {
        icon: <TableOfContentsIcon />,
        label: '目录',
        value: KEYS.toc,
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
        <ToolbarButton pressed={open} tooltip="插入" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-auto min-w-0 flex-col overflow-y-auto"
        align="start"
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
