'use client';

import { useAuthUserRetrieve } from '@/api/gen/endpoints/auth/auth';
import {
  useMainDiscussionsList,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { Card } from '@/components/shadcn/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { useParams } from '@tanstack/react-router';
import { cn } from 'cn';
import { MessagesSquareIcon } from 'lucide-react';
import { PathApi, type Path } from 'platejs';
import {
  useEditorRef,
  usePluginOption,
  useValueVersion,
  type PlateEditor,
} from 'platejs/react';
import { useEffect, useMemo, useRef } from 'react';
import {
  getDiscussionIndex,
  toTDiscussions,
  type ResolvedDiscussion,
  type ResolvedSuggestion,
} from '../lib/block-discussion-index';
import { commentPlugin } from './editor/plugins/comment-kit';
import type { TDiscussion } from './editor/plugins/discussion-kit';
import { suggestionPlugin } from './editor/plugins/suggestion-kit';
import { BlockComment } from './ui/block-discussion';
import { BlockSuggestionCard } from './ui/block-suggestion';
import { CommentCreateForm } from './ui/comment';

export type DiscussionItem = { id: string; path: Path } & (
  | { type: 'comment'; item: ResolvedDiscussion }
  | { type: 'suggestion'; item: ResolvedSuggestion }
  | { type: 'draft' }
);

export function Discussion() {
  const editor = useEditorRef();
  const version = useDebounce(useValueVersion() ?? 0);

  const { data: me } = useAuthUserRetrieve();
  useEffect(() => {
    editor.setOption(
      suggestionPlugin,
      'currentUserId',
      me ? String(me.pk) : '',
    );
  }, [editor, me]);

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const { data: discussionsRaw } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );
  const discussions = useMemo(
    () => toTDiscussions(discussionsRaw ?? []),
    [discussionsRaw],
  );

  const commentingBlock = usePluginOption(commentPlugin, 'commentingBlock');
  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const isCommenting = activeCommentId === getDraftCommentKey();

  const discussionItems = useMemo(() => {
    const discussionItems = getDiscussionItems(editor, discussions, version);

    if (isCommenting && commentingBlock) {
      const draftNode = editor
        .getApi(CommentPlugin)
        .comment.node({ at: [], isDraft: true });
      discussionItems.push({
        type: 'draft',
        id: getDraftCommentKey(),
        path: draftNode?.[1] ?? commentingBlock,
      });
    }

    return discussionItems.sort((a, b) => PathApi.compare(a.path, b.path));
  }, [editor, discussions, version, isCommenting, commentingBlock]);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-2">
      {discussionItems.length === 0 && (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquareIcon />
            </EmptyMedia>
            <EmptyTitle>暂无评论</EmptyTitle>
            <EmptyDescription>在编辑器中选择内容即可发表评论</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {discussionItems.map((discussionItem) =>
        discussionItem.type === 'draft' ? (
          <DraftDiscussionCard key={discussionItem.id} />
        ) : (
          <DiscussionCard
            key={discussionItem.id}
            discussionItem={discussionItem}
          />
        ),
      )}
    </div>
  );
}

function DraftDiscussionCard() {
  const commentCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentCardRef.current?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }, []);

  return (
    <Card
      ref={commentCardRef}
      data-active
      className={cn('ring-primary shrink-0 p-0 ring-2')}
    >
      <CommentCreateForm className="p-4" />
    </Card>
  );
}

function DiscussionCard({
  discussionItem,
}: {
  discussionItem: Exclude<DiscussionItem, { type: 'draft' }>;
}) {
  const editor = useEditorRef();
  const discussionCardRef = useRef<HTMLDivElement>(null);
  const activeId = usePluginOption(
    discussionItem.type === 'comment' ? commentPlugin : suggestionPlugin,
    'activeId',
  );

  const isActive = discussionItem.id === activeId;

  useEffect(() => {
    if (isActive) {
      discussionCardRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [isActive]);

  return (
    <Card
      ref={discussionCardRef}
      data-active={isActive}
      className={cn('shrink-0 p-0', isActive && 'ring-primary ring-2')}
      onClick={() => focusDiscussionInEditor(editor, discussionItem)}
    >
      {discussionItem.type === 'comment' ? (
        <BlockComment discussion={discussionItem.item} isLast />
      ) : (
        <BlockSuggestionCard idx={0} isLast suggestion={discussionItem.item} />
      )}
    </Card>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function focusDiscussionInEditor(
  editor: PlateEditor,
  discussionItem: Exclude<DiscussionItem, { type: 'draft' }>,
) {
  editor.setOption(
    commentPlugin,
    'activeId',
    discussionItem.type === 'comment' ? discussionItem.item.id : null,
  );
  editor.setOption(
    suggestionPlugin,
    'activeId',
    discussionItem.type === 'suggestion'
      ? discussionItem.item.suggestionId
      : null,
  );

  const range = editor.api.range(discussionItem.path);
  const domRange = range ? editor.api.toDOMRange(range) : null;
  if (domRange) {
    editor.api.scrollIntoView(domRange, {
      block: 'center',
      behavior: 'smooth',
    });
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function getDiscussionItems(
  editor: PlateEditor,
  discussions: TDiscussion[],
  version: number,
): DiscussionItem[] {
  const discussionIndex = getDiscussionIndex(editor, discussions, version);
  const discussionItems: DiscussionItem[] = [];

  discussionIndex.discussionsByBlock.forEach((discussions) => {
    discussions.forEach((discussion) => {
      discussionItems.push({
        type: 'comment',
        id: discussion.id,
        path: discussion.path,
        item: discussion,
      });
    });
  });

  discussionIndex.suggestionsByBlock.forEach((suggestions) => {
    suggestions.forEach((suggestion) => {
      discussionItems.push({
        type: 'suggestion',
        id: suggestion.suggestionId,
        path: suggestion.path,
        item: suggestion,
      });
    });
  });

  return discussionItems.sort((a, b) => PathApi.compare(a.path, b.path));
}
