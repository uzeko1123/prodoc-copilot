'use client';

import { Button } from '@/components/shadcn/ui/button';
import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import {
  flip,
  getDefaultBoundingClientRect,
  offset,
  shift,
  useVirtualFloating,
} from '@platejs/floating';
import { getTransientSuggestionKey } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { useComposedRef } from '@udecode/cn';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';
import { PathApi, type AnyPluginConfig, type NodeEntry } from 'platejs';
import type { PlateElementProps, RenderNodeWrapper } from 'platejs/react';
import {
  PortalBody,
  useEditorContainerRef,
  useEditorMounted,
  useEditorRef,
  useHotkeys,
  useOnClickOutside,
  usePluginOption,
  useScrollRef,
} from 'platejs/react';
import * as React from 'react';
import { useBlockDiscussionItems } from '../../lib/block-discussion-index';
import { useCommentStore } from '../../stores';
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

  useHotkeys(
    'esc',
    () => {
      editor.setOption(commentPlugin, 'activeId', null);
      editor.setOption(suggestionPlugin, 'activeId', null);
      setOpen(false);
    },
    {
      enabled: open,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
  );

  const wasCommenting = React.useRef(true);

  React.useEffect(() => {
    if (wasCommenting.current && !isCommenting) {
      editor.tf.unsetNodes(getDraftCommentKey(), {
        at: [],
        mode: 'lowest',
        match: (n) => n[getDraftCommentKey()],
      });
      editor.setOption(commentPlugin, 'commentingBlock', null);
      useCommentStore.getState().removeDiscussionDraft(getDraftCommentKey());
    }
    wasCommenting.current = isCommenting;
  }, [editor, isCommenting]);

  React.useEffect(() => {
    if (!isCommenting || !commentingCurrent) return;

    const onSelectionChange = () => {
      const domSelection = window.getSelection();
      const domEditor = editor.api.toDOMNode(editor);
      if (
        domSelection?.anchorNode &&
        domEditor?.contains(domSelection.anchorNode)
      ) {
        editor.setOption(commentPlugin, 'activeId', null);
        editor.setOption(suggestionPlugin, 'activeId', null);
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () =>
      document.removeEventListener('selectionchange', onSelectionChange);
  }, [isCommenting, commentingCurrent, editor]);

  const floatingRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null,
  );

  React.useLayoutEffect(() => {
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

    setAnchorElement(
      activeNode
        ? (editor.api.toDOMNode(activeNode[0]) ?? null)
        : open
          ? buttonRef.current
          : null,
    );
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

  const floating = useVirtualFloating({
    getBoundingClientRect: () =>
      anchorElement?.getBoundingClientRect() ?? getDefaultBoundingClientRect(),
    placement: 'bottom',
    middleware: [
      offset(12),
      flip({
        fallbackPlacements: ['top'],
        padding: 12,
      }),
      shift({
        mainAxis: true,
        crossAxis: false,
        padding: 12,
      }),
    ],
  });

  useOnClickOutside(() => setOpen(false), {
    refs: [floatingRef, buttonRef],
  });

  const ref = useComposedRef<HTMLDivElement>(
    floating.refs.setFloating,
    floatingRef,
  );

  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const containerRef = useEditorContainerRef();
  const { update } = floating;

  const [portalElement, setPortalElement] = React.useState<HTMLElement | null>(
    null,
  );

  React.useEffect(() => {
    if (!editorMounted) return;
    setPortalElement(containerRef.current);
  }, [editorMounted, containerRef]);

  React.useEffect(() => {
    void update();
  }, [anchorElement, open, update]);

  React.useEffect(() => {
    if (!editorMounted || !open) return;
    const scroll = scrollRef.current;
    if (!scroll) return;

    scroll.addEventListener('scroll', update, { passive: true });
    return () => scroll.removeEventListener('scroll', update);
  }, [editorMounted, open, scrollRef, update]);

  React.useEffect(() => {
    if (!editorMounted || !open) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => update());
    observer.observe(container);
    return () => observer.disconnect();
  }, [editorMounted, open, containerRef, update]);

  if (!isTopLevelBlock) return <>{children}</>;

  if (suggestionsCount + resolvedDiscussions.length === 0 && !draftCommentNode)
    return <div className="w-full">{children}</div>;

  return (
    <div className="flex w-full justify-between">
      <div className="w-full">{children}</div>

      {open && anchorElement && (
        <PortalBody element={portalElement ?? undefined}>
          <div
            ref={ref}
            // className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-95 max-w-[calc(100vw-24px)] min-w-32.5 overflow-y-auto p-0 data-[state=closed]:opacity-0"
            className="bg-popover text-popover-foreground ring-foreground/10 z-50 flex max-h-[50%] w-95 max-w-[80%] min-w-32.5 flex-col gap-2.5 overflow-y-auto rounded-lg p-0 text-sm shadow-md ring-1 outline-hidden"
            style={floating.style}
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
          </div>
        </PortalBody>
      )}

      {totalCount > 0 && (
        <div className="relative left-0 size-0 select-none">
          <Button
            ref={buttonRef}
            variant="ghost"
            className="text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted mt-1 ml-1 flex h-6 gap-1 px-1.5! py-0"
            data-active={open}
            contentEditable={false}
            onClick={() => {
              if (open) {
                editor.setOption(commentPlugin, 'activeId', null);
                editor.setOption(suggestionPlugin, 'activeId', null);
              }
              if (anchorElement !== buttonRef.current) {
                setOpen(true);
              } else {
                setOpen(!open);
              }
            }}
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
        </div>
      )}
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
