import type { User, UserDetails } from '@/api/gen/models';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/ui/avatar';
import { UserIcon } from 'lucide-react';

export function UserAvatar({
  user,
  src,
  className,
  children,
}: {
  user?: User | UserDetails;
  src?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || user?.avatar || undefined} />
      <AvatarFallback>
        {user ? (
          (user.full_name || user.username)[0].toUpperCase()
        ) : (
          <UserIcon />
        )}
      </AvatarFallback>
      {children}
    </Avatar>
  );
}
