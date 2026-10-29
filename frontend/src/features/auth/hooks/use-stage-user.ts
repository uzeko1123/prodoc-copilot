import type { Task } from '@/api/gen/models';
import { useMemo } from 'react';

export function useStageUser(task?: Task) {
  return useMemo(() => {
    if (!task) return null;
    if (task.stage === 'editing' || task.stage === 'revision')
      return task.creator;
    if (task.stage === 'review') return task.reviewer ?? null;
    return null;
  }, [task]);
}
