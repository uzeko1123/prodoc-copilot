'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import {
  DropdownMenuItemIndicator,
  type DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, EyeIcon, PencilIcon } from 'lucide-react';
import { useEditorReadOnly, useEditorRef } from 'platejs/react';
import * as React from 'react';

const item: Record<string, { icon: React.ReactNode; label: string }> = {
  editing: {
    icon: <PencilIcon />,
    label: '编辑',
  },
  viewing: {
    icon: <EyeIcon />,
    label: '阅读',
  },
};

export function ModeToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);

  const value = readOnly ? 'viewing' : 'editing';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="选择模式" isDropdown>
          {item[value].icon}
          <span className="hidden lg:inline">{item[value].label}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuRadioGroup
          onValueChange={(newValue) => {
            if (newValue === 'viewing') {
              editor.store.setReadOnly(true);
              editor.tf.focus();
              return;
            }
            if (newValue === 'editing') {
              editor.store.setReadOnly(false);
              editor.tf.focus();
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground pl-2 *:first:[span]:hidden"
            value="editing"
          >
            <Indicator />
            {item.editing.icon} {item.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground pl-2 *:first:[span]:hidden"
            value="viewing"
          >
            <Indicator />
            {item.viewing.icon} {item.viewing.label}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Indicator() {
  return (
    <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <CheckIcon />
      </DropdownMenuItemIndicator>
    </span>
  );
}
