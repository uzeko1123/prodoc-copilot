'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { type DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { IndentIncreaseIcon } from 'lucide-react';
import * as React from 'react';
import { useEditorStore, type TextIndent } from '../../stores';

export function TextIndentToolbarButton(props: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  const editorTextIndent = useEditorStore((state) => state.editorTextIndent);
  const setEditorTextIndent = useEditorStore(
    (state) => state.setEditorTextIndent,
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="首行缩进" isDropdown>
          <IndentIncreaseIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-auto">
        <DropdownMenuRadioGroup
          value={editorTextIndent}
          onValueChange={(value) => setEditorTextIndent(value as TextIndent)}
        >
          <DropdownMenuRadioItem value="0em">无</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2em">2 字符</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="4em">4 字符</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
