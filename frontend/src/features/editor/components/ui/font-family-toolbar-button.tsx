'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { useEditorStore, type FontFamily } from '@/features/editor/stores';
import { type DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { TypeIcon } from 'lucide-react';
import * as React from 'react';

export function FontFamilyToolbarButton(props: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  const editorFontFamily = useEditorStore((state) => state.editorFontFamily);
  const setEditorFontFamily = useEditorStore(
    (state) => state.setEditorFontFamily,
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Font" isDropdown>
          <TypeIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-auto">
        <DropdownMenuLabel>Heading</DropdownMenuLabel>
        <FontFamilyDropdownMenuRadioGroup
          value={editorFontFamily['--editor-font-family-heading']}
          onValueChange={(value) =>
            setEditorFontFamily({
              ...editorFontFamily,
              '--editor-font-family-heading': value,
            })
          }
        />

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Body</DropdownMenuLabel>
        <FontFamilyDropdownMenuRadioGroup
          value={editorFontFamily['--editor-font-family-body']}
          onValueChange={(value) =>
            setEditorFontFamily({
              ...editorFontFamily,
              '--editor-font-family-body': value,
            })
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FontFamilyDropdownMenuRadioGroup({
  value,
  onValueChange,
}: {
  value: FontFamily;
  onValueChange: (value: FontFamily) => void;
}) {
  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={(value) => onValueChange(value as FontFamily)}
    >
      <DropdownMenuRadioItem value="'Noto Sans SC Variable', sans-serif">
        <span style={{ fontFamily: "'Noto Sans SC Variable', sans-serif" }}>
          Noto Sans
        </span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="'Noto Serif SC Variable', serif">
        <span style={{ fontFamily: "'Noto Serif SC Variable', serif" }}>
          Noto Serif
        </span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
