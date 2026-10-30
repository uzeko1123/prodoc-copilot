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
import { getGuideClauseItems } from '@/features/guide/lib/guide-clause-index';
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

  const guideClauseItems = React.useMemo(() => {
    if (!discussions || !guide) return [];

    return getGuideClauseItems(guide.value).filter((guideClauseItem) =>
      (
        discussions.find((discussion) => discussion.key === discussionKey)
          ?.guide_clauses ?? []
      ).some(
        (guide_clause) =>
          guide_clause.guide === guide.id &&
          guide_clause.block_id === guideClauseItem.blockId,
      ),
    );
  }, [discussions, guide, discussionKey]);

  if (!guide || guideClauseItems.length === 0) return null;

  return (
    <>
      {guideClauseItems.map((guideClause) => (
        <Tooltip key={guideClause.blockId}>
          <TooltipTrigger asChild>
            <Badge
              variant={
                activeGuideClauseId === guideClause.blockId
                  ? 'default'
                  : 'secondary'
              }
              asChild
            >
              <button
                onClick={(e) => {
                  if (activeGuideClauseId === guideClause.blockId) {
                    e.stopPropagation();
                    setActiveGuideClauseId(null);
                    return;
                  }
                  setActiveRightPanelTab('guide');
                  setRightPanelOpen(true);
                  setActiveGuideClauseId(guideClause.blockId);
                }}
              >
                <span className="max-w-40 truncate">{guide.name}</span>
                <span> · {guideClause.line}</span>
              </button>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">{guideClause.text}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
