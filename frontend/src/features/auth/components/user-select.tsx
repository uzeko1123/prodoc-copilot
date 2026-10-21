import { useAuthUsersList } from '@/api/gen/endpoints/auth/auth';
import type { User } from '@/api/gen/models';
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
import { keepPreviousData } from '@tanstack/react-query';
import { cn } from 'cn';
import * as React from 'react';
import { UserAvatar } from './user-avatar';

export function UserSelect({
  value,
  onChange,
  placeholder = '选择用户',
  ...props
}: {
  value: number | null;
  onChange: (value: number | null) => void;
} & Omit<React.ComponentProps<typeof ComboboxInput>, 'value' | 'onChange'>) {
  void value;

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const debouncedInputValue = useDebounce(inputValue);

  const {
    data: users,
    isPending,
    isPlaceholderData,
  } = useAuthUsersList(
    {
      ...(debouncedInputValue.trim() !== '' && {
        search: debouncedInputValue.trim(),
      }),
    },
    { query: { enabled: open, placeholderData: keepPreviousData } },
  );

  return (
    <Combobox
      itemToStringLabel={(user: User) => user.full_name || user.username}
      onValueChange={(user) => onChange(user ? user.pk : null)}
      onOpenChange={setOpen}
      onInputValueChange={setInputValue}
    >
      <ComboboxInput placeholder={placeholder} {...props} />
      <ComboboxContent className={cn(isPlaceholderData && 'opacity-60')}>
        {isPending ? (
          <DefaultPending />
        ) : !users || users.length === 0 ? (
          <ComboboxEmpty>未找到用户</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {users.map((user) => (
              <ComboboxItem key={user.pk} value={user}>
                <UserAvatar user={user} className="size-6" />
                <span className="font-medium">
                  {user.full_name || user.username}
                </span>
                <span className="text-muted-foreground text-xs">
                  {user.username}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
