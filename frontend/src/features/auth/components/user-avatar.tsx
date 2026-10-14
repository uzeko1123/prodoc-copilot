import type { UserDetails } from '@/api/gen/models';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/ui/avatar';

export function UserAvatar({
  user,
  src,
  className,
  children,
}: {
  user: UserDetails;
  src?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || user.avatar || undefined} alt={user.username} />
      <AvatarFallback>
        {(user.full_name || user.username)[0].toUpperCase()}
      </AvatarFallback>
      {children}
    </Avatar>
  );
}
