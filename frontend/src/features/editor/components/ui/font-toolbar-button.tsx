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
import { type DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { TypeIcon } from 'lucide-react';
import * as React from 'react';
import { useEditorStore, type Font } from '../../stores';

export function FontToolbarButton(props: DropdownMenuProps) {
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
          value={editorFontFamily['--editor-font-heading']}
          onValueChange={(value) =>
            setEditorFontFamily({
              ...editorFontFamily,
              '--editor-font-heading': value,
            })
          }
        />

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Body</DropdownMenuLabel>
        <FontFamilyDropdownMenuRadioGroup
          value={editorFontFamily['--editor-font-body']}
          onValueChange={(value) =>
            setEditorFontFamily({
              ...editorFontFamily,
              '--editor-font-body': value,
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
  value: Font;
  onValueChange: (value: Font) => void;
}) {
  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={(value) => onValueChange(value as Font)}
    >
      <DropdownMenuRadioItem value="var(--font-sans)">
        <span style={{ fontFamily: 'var(--font-sans)' }}>Noto Sans</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="var(--font-serif)">
        <span style={{ fontFamily: 'var(--font-serif)' }}>Noto Serif</span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
