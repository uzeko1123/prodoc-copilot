'use client';

import {
  useAuthUserRetrieve,
  useAuthUsersRetrieve,
} from '@/api/gen/endpoints/auth/auth';
import {
  getMainDiscussionsListQueryKey,
  useMainDiscussionsDestroy,
  useMainDiscussionsList,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { Button } from '@/components/shadcn/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { UserAvatar } from '@/features/auth/components/user-avatar';
import { useStageUser } from '@/features/auth/hooks/use-stage-user';
import { formatDate } from '@/lib/format-date';
import { queryClient } from '@/lib/query-client';
import { acceptSuggestion, rejectSuggestion } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { useParams } from '@tanstack/react-router';
import {
  ALargeSmallIcon,
  BoldIcon,
  CheckIcon,
  Code2Icon,
  CornerDownLeftIcon,
  HighlighterIcon,
  ItalicIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
  XIcon,
} from 'lucide-react';
import { useEditorPlugin } from 'platejs/react';
import * as React from 'react';
import {
  BLOCK_SUGGESTION_TOKEN,
  type ResolvedSuggestion,
} from '../../lib/block-discussion-index';
import { DiscussionTags } from '../discussion-tags';
import type { TDiscussion } from '../editor/plugins/discussion-kit';

export function BlockSuggestionCard({
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) {
  const { api, editor } = useEditorPlugin(SuggestionPlugin);

  const { data: me } = useAuthUserRetrieve();
  const { data: user } = useAuthUsersRetrieve(Number(suggestion.userId), {
    query: { throwOnError: false },
  });

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const { mutate: discussionsDestroyMutate } = useMainDiscussionsDestroy({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainDiscussionsListQueryKey(),
        });
      },
    },
  });

  const isMySuggestion = (me ? String(me.pk) : '') === suggestion.userId;
  const stageUser = useStageUser(task);
  const isStageUser = !!stageUser && stageUser.pk === me?.pk;

  const removeSuggestionDiscussion = () => {
    const discussion = discussions?.find(
      (discussion) => discussion.key === suggestion.suggestionId,
    );
    if (discussion) discussionsDestroyMutate({ id: discussion.id });
  };

  const accept = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      acceptSuggestion(editor, suggestion);
    });
    removeSuggestionDiscussion();
  };

  const reject = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      rejectSuggestion(editor, suggestion);
    });
    removeSuggestionDiscussion();
  };

  const [hovering, setHovering] = React.useState(false);

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION_TOKEN)
      return [<CornerDownLeftIcon className="my-0.5 size-4 shrink-0" />];

    return text.split(BLOCK_SUGGESTION_TOKEN).filter(Boolean);
  };

  const getRemoveSummaryItems = (text: string) => {
    const items = suggestionText2Array(text).map((item) => {
      if (item === 'code_block') return '代码块';

      return item;
    });

    if (items.includes('表格')) return ['表格'];
    if (items.includes('代码块')) return ['代码块'];

    return items;
  };

  return (
    <div className="p-4 pb-2">
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative flex items-center">
          <UserAvatar user={user} className="size-5" />
          <h4 className="mx-2 text-sm leading-none font-semibold">
            {user?.full_name || user?.username || '未知用户'}
          </h4>

          {suggestion.createdByAI && (
            <Tooltip>
              <TooltipTrigger asChild>
                <SparklesIcon className="text-primary mr-2 size-3" />
              </TooltipTrigger>
              <TooltipContent>由 AI 生成</TooltipContent>
            </Tooltip>
          )}

          <div className="text-muted-foreground/80 text-xs leading-none">
            <span className="mr-1">{formatDate(suggestion.createdAt)}</span>
          </div>

          {isMySuggestion && isStageUser && hovering && (
            <div className="absolute top-0 right-0 flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground h-6 p-1"
                    onClick={() => accept(suggestion)}
                  >
                    <CheckIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>接受</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground h-6 p-1"
                    onClick={() => reject(suggestion)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>拒绝</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="pb-px">
          <div className="mt-1 mb-2 pl-8">
            <div className="flex flex-col gap-2">
              {suggestion.type === 'remove' &&
                getRemoveSummaryItems(suggestion.text!).map((text, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-red-900"
                  >
                    <MinusIcon className="my-0.5 size-4 shrink-0" />
                    <span key={index} className="text-sm">
                      {text}
                    </span>
                  </div>
                ))}

              {suggestion.type === 'insert' &&
                suggestionText2Array(suggestion.newText!).map((text, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-blue-900"
                  >
                    <PlusIcon className="my-0.5 size-4 shrink-0" />
                    <span key={index} className="text-sm">
                      {text || (
                        <CornerDownLeftIcon className="my-0.5 size-4 shrink-0" />
                      )}
                    </span>
                  </div>
                ))}

              {suggestion.type === 'replace' && (
                <div className="flex flex-col gap-2">
                  {suggestionText2Array(suggestion.text!).map((text, index) => (
                    <React.Fragment key={index}>
                      <div
                        key={index}
                        className="flex items-start gap-2 text-red-900"
                      >
                        <MinusIcon className="my-0.5 size-4 shrink-0" />
                        <span className="line-clamp-3 text-sm">
                          {text || (
                            <CornerDownLeftIcon className="my-0.5 size-4 shrink-0" />
                          )}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}

                  {suggestionText2Array(suggestion.newText!).map(
                    (text, index) => (
                      <React.Fragment key={index}>
                        <div
                          key={index}
                          className="flex items-start gap-2 text-blue-900"
                        >
                          <PlusIcon className="my-0.5 size-4 shrink-0" />
                          <span className="line-clamp-3 text-sm">
                            {text || (
                              <CornerDownLeftIcon className="my-0.5 size-4 shrink-0" />
                            )}
                          </span>
                        </div>
                      </React.Fragment>
                    ),
                  )}
                </div>
              )}

              {suggestion.type === 'update' && (
                <div className="flex items-start gap-2">
                  <span className="flex shrink-0 gap-1">
                    {Object.keys(suggestion.properties).map((key) => (
                      <span key={key} className="flex shrink-0 text-red-900">
                        <MinusIcon className="my-1 size-3" />
                        <MarkIcon mark={key} />
                      </span>
                    ))}

                    {Object.keys(suggestion.newProperties).map((key) => (
                      <span key={key} className="flex shrink-0 text-blue-900">
                        <PlusIcon className="my-1 size-3" />
                        <MarkIcon mark={key} />
                      </span>
                    ))}
                  </span>
                  <span className="line-clamp-3 text-sm">
                    {suggestion.newText}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 pl-8">
            <DiscussionTags discussionKey={suggestion.suggestionId} />
          </div>
        </div>
      </div>

      {!isLast && <div className="bg-muted h-px w-full" />}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const isResolvedSuggestion = (
  suggestion: ResolvedSuggestion | TDiscussion,
): suggestion is ResolvedSuggestion => 'suggestionId' in suggestion;

function MarkIcon({ mark }: { mark: string }) {
  const markIcons = {
    fontSize: ALargeSmallIcon,
    bold: BoldIcon,
    italic: ItalicIcon,
    underline: UnderlineIcon,
    strikethrough: StrikethroughIcon,
    code: Code2Icon,
    subscript: SubscriptIcon,
    superscript: SuperscriptIcon,
    highlight: HighlighterIcon,
  };
  const Icon = markIcons[mark as keyof typeof markIcons];

  if (!Icon) {
    return (
      <span className="text-sm font-medium">
        {mark.charAt(0).toUpperCase() + mark.slice(1)}
      </span>
    );
  }

  return <Icon className="my-0.5 size-4" />;
}
