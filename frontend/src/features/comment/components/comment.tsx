'use client';

import { Card } from '@/components/shadcn/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { CommentPlugin } from '@platejs/comment/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { cn } from 'cn';
import { MessagesSquareIcon } from 'lucide-react';
import { PathApi, type Path } from 'platejs';
import { useEditorRef, useEditorVersion, usePluginOption } from 'platejs/react';
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

type CommentItem = { id: string; path: Path } & (
  | { type: 'comment'; item: TDiscussion }
  | { type: 'suggestion'; item: ResolvedSuggestion }
);

function CommentCard({ commentItem }: { commentItem: CommentItem }) {
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

export function Comment() {
  const editor = useEditorRef();
  const discussions = usePluginOption(discussionPlugin, 'discussions');
  const version = useEditorVersion() ?? 0;

  const setDiscussions = useCommentStore((state) => state.setDiscussions);

  useEffect(() => {
    setDiscussions(discussions);
  }, [discussions, setDiscussions]);

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

    return commentItems.sort((a, b) => PathApi.compare(a.path, b.path));
  }, [editor, discussions, version]);

  return (
    <div className="scrollbar-thumb-border flex h-full scrollbar-thin flex-col gap-2 overflow-y-auto p-2">
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
      {commentItems.map((commentItem) => (
        <CommentCard key={commentItem.id} commentItem={commentItem} />
      ))}
    </div>
  );
}
