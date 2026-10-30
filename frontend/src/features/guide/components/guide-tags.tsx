import {
  useMainDiscussionsList,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { Badge } from '@/components/shadcn/ui/badge';
import {
  focusDiscussionInEditor,
  getDiscussionItems,
} from '@/features/comment/components/discussion';
import { commentPlugin } from '@/features/comment/components/editor/plugins/comment-kit';
import { suggestionPlugin } from '@/features/comment/components/editor/plugins/suggestion-kit';
import { toTDiscussions } from '@/features/comment/lib/block-discussion-index';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { useWorkbenchStore } from '@/stores/workbench';
import { useParams } from '@tanstack/react-router';
import { useEditorRef, usePluginOption, useValueVersion } from 'platejs/react';
import * as React from 'react';

export function GuideTags({ guideClauseId }: { guideClauseId: string }) {
  const editor = useEditorRef();
  const version = useDebounce(useValueVersion() ?? 0);

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';
  const guide = task?.guide ?? null;

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const setActiveMainTab = useWorkbenchStore((state) => state.setActiveMainTab);

  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');

  const guideTagItems = React.useMemo(() => {
    if (!guide || !discussions) return [];

    return getDiscussionItems(editor, toTDiscussions(discussions), version)
      .map((discussionItem, index) => ({ discussionItem, index }))
      .filter(
        (guideTagItem) =>
          guideTagItem.discussionItem.type !== 'draft' &&
          (
            discussions.find(
              (discussion) => discussion.key === guideTagItem.discussionItem.id,
            )?.guide_clauses ?? []
          ).some(
            (guide_clause) =>
              guide_clause.guide === guide.id &&
              guide_clause.block_id === guideClauseId,
          ),
      );
  }, [editor, guide, discussions, version, guideClauseId]);

  if (guideTagItems.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {guideTagItems.map(
        ({ discussionItem, index }) =>
          discussionItem.type !== 'draft' && (
            <Badge
              key={discussionItem.id}
              variant={
                activeCommentId === discussionItem.id ||
                activeSuggestionId === discussionItem.id
                  ? 'default'
                  : 'secondary'
              }
              asChild
            >
              <button
                onClick={(e) => {
                  if (
                    activeCommentId === discussionItem.id ||
                    activeSuggestionId === discussionItem.id
                  ) {
                    e.stopPropagation();
                    editor.setOption(commentPlugin, 'activeId', null);
                    editor.setOption(suggestionPlugin, 'activeId', null);
                    return;
                  }
                  setActiveMainTab('discussion');
                  focusDiscussionInEditor(editor, discussionItem);
                }}
              >
                <span>
                  {discussionItem.type === 'comment' ? '评论' : '修订'}
                </span>
                <span> · {index + 1}</span>
              </button>
            </Badge>
          ),
      )}
    </div>
  );
}
