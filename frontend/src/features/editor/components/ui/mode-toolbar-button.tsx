'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import {
  DropdownMenuItemIndicator,
  type DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, EyeIcon, FeatherIcon, PencilLineIcon } from 'lucide-react';
import {
  useEditorReadOnly,
  useEditorRef,
  usePluginOption,
} from 'platejs/react';
import * as React from 'react';

const item: Record<string, { icon: React.ReactNode; label: string }> = {
  editing: {
    icon: <FeatherIcon />,
    label: '编辑',
  },
  suggestion: {
    icon: <PencilLineIcon />,
    label: '修订',
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

  const isSuggesting = usePluginOption(SuggestionPlugin, 'isSuggesting');

  let value = 'editing';

  if (readOnly) value = 'viewing';

  if (isSuggesting) value = 'suggestion';

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
              editor.setOption(SuggestionPlugin, 'isSuggesting', false);
              editor.store.setReadOnly(true);
              editor.tf.focus();
              return;
            }

            if (newValue === 'suggestion') {
              editor.setOption(SuggestionPlugin, 'isSuggesting', true);
              editor.store.setReadOnly(false);
              editor.tf.focus();
              return;
            }

            if (newValue === 'editing') {
              editor.setOption(SuggestionPlugin, 'isSuggesting', false);
              editor.store.setReadOnly(false);
              editor.tf.focus();
              return;
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
            value="suggestion"
          >
            <Indicator />
            {item.suggestion.icon} {item.suggestion.label}
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
