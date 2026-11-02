import {
  useMainDiscussionsList,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { Badge } from '@/components/shadcn/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { getGuideClauses } from '@/features/guide/lib/guide-clause-index';
import { useGuideStore } from '@/features/guide/stores';
import { useWorkbenchStore } from '@/stores/workbench';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

export function DiscussionTags({ discussionKey }: { discussionKey: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <GuideClauseTags discussionKey={discussionKey} />
    </div>
  );
}

function GuideClauseTags({ discussionKey }: { discussionKey: string }) {
  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';
  const guide = task?.guide ?? null;

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const setRightPanelOpen = useWorkbenchStore(
    (state) => state.setRightPanelOpen,
  );
  const setActiveRightPanelTab = useWorkbenchStore(
    (state) => state.setActiveRightPanelTab,
  );

  const activeGuideClauseId = useGuideStore(
    (state) => state.activeGuideClauseId,
  );
  const setActiveGuideClauseId = useGuideStore(
    (state) => state.setActiveGuideClauseId,
  );

  const guideClauses = React.useMemo(() => {
    if (!discussions || !guide) return [];

    return getGuideClauses(guide).filter((guideClause) =>
      (
        discussions.find((discussion) => discussion.key === discussionKey)
          ?.guide_clauses ?? []
      ).some(
        (guide_clause) =>
          guide_clause.guide === guide.id &&
          guide_clause.block_id === guideClause.id,
      ),
    );
  }, [discussions, guide, discussionKey]);

  if (!guide || guideClauses.length === 0) return null;

  return (
    <>
      {guideClauses.map((guideClause) => (
        <Tooltip key={guideClause.id}>
          <TooltipTrigger asChild>
            <Badge
              variant={
                activeGuideClauseId === guideClause.id ? 'default' : 'secondary'
              }
              asChild
            >
              <button
                onClick={(e) => {
                  if (activeGuideClauseId === guideClause.id) {
                    e.stopPropagation();
                    setActiveGuideClauseId(null);
                    return;
                  }
                  setActiveRightPanelTab('guide');
                  setRightPanelOpen(true);
                  setActiveGuideClauseId(guideClause.id);
                }}
              >
                写作指南 · {guideClause.line}
              </button>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">{guideClause.text}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
