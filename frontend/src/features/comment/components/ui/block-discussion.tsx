'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';
import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { getTransientSuggestionKey } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';
import { PathApi, type AnyPluginConfig, type NodeEntry } from 'platejs';
import type { PlateElementProps, RenderNodeWrapper } from 'platejs/react';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';
import { useBlockDiscussionItems } from '../../lib/block-discussion-index';
import { commentPlugin } from '../editor/plugins/comment-kit';
import type { TDiscussion } from '../editor/plugins/discussion-kit';
import { suggestionPlugin } from '../editor/plugins/suggestion-kit';
import { BlockSuggestionCard, isResolvedSuggestion } from './block-suggestion';
import { Comment, CommentCreateForm } from './comment';

export const BlockDiscussion: RenderNodeWrapper<AnyPluginConfig> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_props) => (props) => <BlockCommentContent {...props} />;

const BlockCommentContent = ({ children, element }: PlateElementProps) => {
  const editor = useEditorRef();
  const commentsApi = editor.getApi(CommentPlugin).comment;
  const suggestionApi = editor.getApi(SuggestionPlugin).suggestion;
  const blockPath = editor.api.findPath(element) ?? [];
  const isTopLevelBlock = blockPath.length === 1;

  const { resolvedDiscussions, resolvedSuggestions, version } =
    useBlockDiscussionItems(blockPath);

  const suggestionsCount = resolvedSuggestions.length;
  const discussionsCount = resolvedDiscussions.length;
  const totalCount = suggestionsCount + discussionsCount;

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestions.find((s) => s.suggestionId === activeSuggestionId);

  const commentingBlock = usePluginOption(commentPlugin, 'commentingBlock');
  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const isCommenting = activeCommentId === getDraftCommentKey();
  const activeDiscussion =
    activeCommentId &&
    resolvedDiscussions.find((d) => d.id === activeCommentId);

  const noneActive = !activeSuggestion && !activeDiscussion;

  const draftCommentNode = React.useMemo(
    () =>
      isTopLevelBlock && isCommenting
        ? commentsApi.node({ at: blockPath, isDraft: true })
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, commentsApi, blockPath, isTopLevelBlock, isCommenting],
  );

  const commentNodes = React.useMemo(
    () =>
      isTopLevelBlock && totalCount > 0
        ? [...commentsApi.nodes({ at: blockPath })]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, commentsApi, blockPath, isTopLevelBlock, totalCount],
  );

  const suggestionNodes = React.useMemo(
    () =>
      isTopLevelBlock && totalCount > 0
        ? [...suggestionApi.nodes({ at: blockPath })].filter(
            ([node]) => !node[getTransientSuggestionKey()],
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, suggestionApi, blockPath, isTopLevelBlock, totalCount],
  );

  const sortedMergedData = [
    ...resolvedDiscussions,
    ...resolvedSuggestions,
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const selected =
    resolvedDiscussions.some((d) => d.id === activeCommentId) ||
    resolvedSuggestions.some((s) => s.suggestionId === activeSuggestionId);

  const [_open, setOpen] = React.useState(selected);

  // in some cases, we may comment the multiple blocks
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  const open =
    _open ||
    selected ||
    (isCommenting && !!draftCommentNode && commentingCurrent);

  const anchorElement = React.useMemo(() => {
    let activeNode: NodeEntry | undefined;

    if (activeSuggestion) {
      activeNode = suggestionNodes.find(
        ([node]) =>
          suggestionApi.nodeId(node) === activeSuggestion.suggestionId,
      );
    }

    if (activeCommentId) {
      if (activeCommentId === getDraftCommentKey()) {
        activeNode = draftCommentNode;
      } else {
        activeNode = commentNodes.find(
          ([node]) =>
            editor.getApi(commentPlugin).comment.nodeId(node) ===
            activeCommentId,
        );
      }
    }

    if (!activeNode) return null;

    return editor.api.toDOMNode(activeNode[0])!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    activeSuggestion,
    activeCommentId,
    editor.api,
    suggestionNodes,
    draftCommentNode,
    commentNodes,
  ]);

  if (!isTopLevelBlock) return <>{children}</>;

  if (suggestionsCount + resolvedDiscussions.length === 0 && !draftCommentNode)
    return <div className="w-full">{children}</div>;

  return (
    <div className="flex w-full justify-between">
      <Popover
        open={open}
        onOpenChange={(_open_) => {
          if (!_open_ && isCommenting && draftCommentNode) {
            editor.tf.unsetNodes(getDraftCommentKey(), {
              at: [],
              mode: 'lowest',
              match: (n) => n[getDraftCommentKey()],
            });
          }
          setOpen(_open_);
        }}
      >
        <div className="w-full">{children}</div>
        {anchorElement && (
          <PopoverAnchor
            asChild
            className="w-full"
            virtualRef={{ current: anchorElement }}
          />
        )}

        <PopoverContent
          className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-95 max-w-[calc(100vw-24px)] min-w-32.5 overflow-y-auto p-0 data-[state=closed]:opacity-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          side="bottom"
        >
          {isCommenting ? (
            <CommentCreateForm className="p-4" focusOnMount />
          ) : noneActive ? (
            sortedMergedData.map((item, index) =>
              isResolvedSuggestion(item) ? (
                <BlockSuggestionCard
                  key={item.suggestionId}
                  idx={index}
                  isLast={index === sortedMergedData.length - 1}
                  suggestion={item}
                />
              ) : (
                <BlockComment
                  key={item.id}
                  discussion={item}
                  isLast={index === sortedMergedData.length - 1}
                />
              ),
            )
          ) : (
            <>
              {activeSuggestion && (
                <BlockSuggestionCard
                  key={activeSuggestion.suggestionId}
                  idx={0}
                  isLast={true}
                  suggestion={activeSuggestion}
                />
              )}

              {activeDiscussion && (
                <BlockComment discussion={activeDiscussion} isLast={true} />
              )}
            </>
          )}
        </PopoverContent>

        {totalCount > 0 && (
          <div className="relative left-0 size-0 select-none">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted mt-1 ml-1 flex h-6 gap-1 px-1.5! py-0"
                data-active={open}
                contentEditable={false}
              >
                {suggestionsCount > 0 && discussionsCount === 0 && (
                  <PencilLineIcon className="size-4 shrink-0" />
                )}

                {suggestionsCount === 0 && discussionsCount > 0 && (
                  <MessageSquareTextIcon className="size-4 shrink-0" />
                )}

                {suggestionsCount > 0 && discussionsCount > 0 && (
                  <MessagesSquareIcon className="size-4 shrink-0" />
                )}

                <span className="text-xs font-semibold">{totalCount}</span>
              </Button>
            </PopoverTrigger>
          </div>
        )}
      </Popover>
    </div>
  );
};

export function BlockComment({
  discussion,
  isLast,
}: {
  discussion: TDiscussion;
  isLast: boolean;
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <React.Fragment key={discussion.id}>
      <div className="p-4">
        {discussion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            comment={comment}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
            showDocumentContent
          />
        ))}
        <CommentCreateForm discussionId={discussion.id} />
      </div>

      {!isLast && <div className="bg-muted h-px w-full" />}
    </React.Fragment>
  );
}
