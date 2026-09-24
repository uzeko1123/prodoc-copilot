'use client';

import { Card } from '@/components/shadcn/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { useMount } from '@/hooks/use-mount';
import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { cn } from 'cn';
import { MessagesSquareIcon } from 'lucide-react';
import { PathApi, type Path } from 'platejs';
import { useEditorRef, usePluginOption, useValueVersion } from 'platejs/react';
import { useEffect, useMemo, useRef } from 'react';
import {
  getDiscussionIndex,
  type ResolvedSuggestion,
} from '../lib/block-discussion-index';
import { useCommentStore } from '../stores';
import { commentPlugin } from './editor/plugins/comment-kit';
import {
  discussionPlugin,
  type TDiscussion,
} from './editor/plugins/discussion-kit';
import { suggestionPlugin } from './editor/plugins/suggestion-kit';
import { BlockComment } from './ui/block-discussion';
import { BlockSuggestionCard } from './ui/block-suggestion';
import { CommentCreateForm } from './ui/comment';

type CommentItem = { id: string; path: Path } & (
  | { type: 'comment'; item: TDiscussion }
  | { type: 'suggestion'; item: ResolvedSuggestion }
  | { type: 'draft' }
);

export function Comment() {
  const editor = useEditorRef();
  const version = useDebounce(useValueVersion() ?? 0);
  const discussions = useCommentStore((state) => state.discussions);

  const commentingBlock = usePluginOption(commentPlugin, 'commentingBlock');
  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const isCommenting = activeCommentId === getDraftCommentKey();

  useMount(() => {
    editor.setOption(discussionPlugin, 'discussions', discussions);
  });

  const commentItems = useMemo(() => {
    const discussionIndex = getDiscussionIndex(editor, discussions, version);
    const commentItems: CommentItem[] = [];

    discussionIndex.discussionsByBlock.forEach((discussions, key) => {
      const blockPath = key.split(',').map(Number);
      discussions.forEach((discussion) => {
        const node = editor
          .getApi(CommentPlugin)
          .comment.node({ at: [], id: discussion.id });
        commentItems.push({
          type: 'comment',
          id: discussion.id,
          path: node?.[1] ?? blockPath,
          item: discussion,
        });
      });
    });

    discussionIndex.suggestionsByBlock.forEach((suggestions, key) => {
      const blockPath = key.split(',').map(Number);
      suggestions.forEach((suggestion) => {
        const node = editor
          .getApi(SuggestionPlugin)
          .suggestion.node({ at: [], id: suggestion.suggestionId });
        commentItems.push({
          type: 'suggestion',
          id: suggestion.suggestionId,
          path: node?.[1] ?? blockPath,
          item: suggestion,
        });
      });
    });

    if (isCommenting && commentingBlock) {
      const draftNode = editor
        .getApi(CommentPlugin)
        .comment.node({ at: [], isDraft: true });
      commentItems.push({
        type: 'draft',
        id: getDraftCommentKey(),
        path: draftNode?.[1] ?? commentingBlock,
      });
    }

    return commentItems.sort((a, b) => PathApi.compare(a.path, b.path));
  }, [editor, discussions, version, isCommenting, commentingBlock]);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-2">
      {commentItems.length === 0 && (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquareIcon />
            </EmptyMedia>
            <EmptyTitle>No comments</EmptyTitle>
            <EmptyDescription>
              Select the text in the editor to leave a comment
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {commentItems.map((commentItem) =>
        commentItem.type === 'draft' ? (
          <DraftCommentCard key={commentItem.id} />
        ) : (
          <CommentCard key={commentItem.id} commentItem={commentItem} />
        ),
      )}
    </div>
  );
}

function DraftCommentCard() {
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

function CommentCard({
  commentItem,
}: {
  commentItem: Exclude<CommentItem, { type: 'draft' }>;
}) {
  const editor = useEditorRef();
  const commentCardRef = useRef<HTMLDivElement>(null);
  const activeId = usePluginOption(
    commentItem.type === 'comment' ? commentPlugin : suggestionPlugin,
    'activeId',
  );

  const isActive = commentItem.id === activeId;

  useEffect(() => {
    if (isActive) {
      commentCardRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [isActive]);

  const onClick = () => {
    editor.setOption(
      commentPlugin,
      'activeId',
      commentItem.type === 'comment' ? commentItem.item.id : null,
    );
    editor.setOption(
      suggestionPlugin,
      'activeId',
      commentItem.type === 'suggestion' ? commentItem.item.suggestionId : null,
    );

    const range = editor.api.range(commentItem.path);
    const domRange = range ? editor.api.toDOMRange(range) : null;
    if (domRange) {
      editor.api.scrollIntoView(domRange, {
        block: 'center',
        behavior: 'smooth',
      });
    }
  };

  return (
    <Card
      ref={commentCardRef}
      data-active={isActive}
      className={cn('shrink-0 p-0', isActive && 'ring-primary ring-2')}
      onClick={onClick}
    >
      {commentItem.type === 'comment' ? (
        <BlockComment discussion={commentItem.item} isLast />
      ) : (
        <BlockSuggestionCard idx={0} isLast suggestion={commentItem.item} />
      )}
    </Card>
  );
}
