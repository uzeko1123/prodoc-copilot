import type { StageEnum } from '@/api/gen/models';
import { Badge } from '@/components/shadcn/ui/badge';
import type { Role } from './task-list';

export function TaskStageBadge({
  role,
  stage,
}: {
  role: Role;
  stage: StageEnum;
}) {
  if (role === 'creator') {
    if (stage === 'editing') return <Badge>编写中</Badge>;
    if (stage === 'review') return <Badge variant="secondary">评审中</Badge>;
    if (stage === 'revision') return <Badge>修订中</Badge>;
  } else {
    if (stage === 'editing') return <Badge variant="secondary">编写中</Badge>;
    if (stage === 'review') return <Badge>评审中</Badge>;
    if (stage === 'revision') return <Badge variant="secondary">修订中</Badge>;
  }
  return <Badge variant="outline">已完成</Badge>;
}
