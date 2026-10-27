import { useMainGuidesList } from '@/api/gen/endpoints/main/main';
import type { Guide } from '@/api/gen/models';
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

export function GuideSelect({
  value,
  onChange,
  placeholder = '无指南',
  ...props
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
} & Omit<React.ComponentProps<typeof ComboboxInput>, 'value' | 'onChange'>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const debouncedInputValue = useDebounce(inputValue);

  const {
    data: guides,
    isPending,
    isPlaceholderData,
  } = useMainGuidesList(
    {
      ...(debouncedInputValue.trim() !== '' && {
        search: debouncedInputValue.trim(),
      }),
    },
    { query: { enabled: open || !!value, placeholderData: keepPreviousData } },
  );

  return (
    <Combobox
      value={guides?.find((guide) => guide.id === value) ?? null}
      itemToStringLabel={(guide: Guide) => guide.name}
      onValueChange={(guide) => onChange(guide ? guide.id : null)}
      onOpenChange={setOpen}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput placeholder={placeholder} showClear {...props} />
      <ComboboxContent className={cn(isPlaceholderData && 'opacity-60')}>
        {isPending ? (
          <DefaultPending />
        ) : !guides || guides.length === 0 ? (
          <ComboboxEmpty>未找到指南</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {guides.map((guide) => (
              <ComboboxItem key={guide.id} value={guide}>
                <span className="font-medium">{guide.name}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatDate(guide.updated_at)}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
