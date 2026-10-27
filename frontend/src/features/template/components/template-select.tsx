import { useMainTemplatesList } from '@/api/gen/endpoints/main/main';
import type { Template } from '@/api/gen/models';
import { DefaultPending } from '@/components/default-pending';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { formatDate } from '@/lib/format-date';
import { keepPreviousData } from '@tanstack/react-query';
import { cn } from 'cn';
import * as React from 'react';

export function TemplateSelect({
  value,
  onChange,
  placeholder = '无模板',
  ...props
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
} & Omit<React.ComponentProps<typeof ComboboxInput>, 'value' | 'onChange'>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const debouncedInputValue = useDebounce(inputValue);

  const {
    data: templates,
    isPending,
    isPlaceholderData,
  } = useMainTemplatesList(
    {
      ...(debouncedInputValue.trim() !== '' && {
        search: debouncedInputValue.trim(),
      }),
    },
    { query: { enabled: open || !!value, placeholderData: keepPreviousData } },
  );

  return (
    <Combobox
      value={templates?.find((template) => template.id === value) ?? null}
      itemToStringLabel={(template: Template) => template.name}
      onValueChange={(template) => onChange(template ? template.id : null)}
      onOpenChange={setOpen}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput placeholder={placeholder} showClear {...props} />
      <ComboboxContent className={cn(isPlaceholderData && 'opacity-60')}>
        {isPending ? (
          <DefaultPending />
        ) : !templates || templates.length === 0 ? (
          <ComboboxEmpty>未找到模板</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {templates.map((template) => (
              <ComboboxItem key={template.id} value={template}>
                <span className="font-medium">{template.name}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatDate(template.updated_at)}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
