import type { StageEnum } from '@/api/gen/models';
import { Badge } from '@/components/shadcn/ui/badge';
import * as React from 'react';
import type { Role } from './task-list';

export function TaskStageBadge({
  role,
  stage,
  ...props
}: {
  role: Role;
  stage: StageEnum;
} & Omit<React.ComponentProps<typeof Badge>, 'children'>) {
  if (role === 'creator') {
    if (stage === 'editing') return <Badge {...props}>编写中</Badge>;
    if (stage === 'review')
      return (
        <Badge variant="secondary" {...props}>
          评审中
        </Badge>
      );
    if (stage === 'revision') return <Badge {...props}>修订中</Badge>;
  } else {
    if (stage === 'editing')
      return (
        <Badge variant="secondary" {...props}>
          编写中
        </Badge>
      );
    if (stage === 'review') return <Badge {...props}>评审中</Badge>;
    if (stage === 'revision')
      return (
        <Badge variant="secondary" {...props}>
          修订中
        </Badge>
      );
  }
  return (
    <Badge variant="outline" {...props}>
      已完成
    </Badge>
  );
}
