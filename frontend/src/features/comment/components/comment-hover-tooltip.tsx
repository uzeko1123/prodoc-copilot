import { jumpToComment } from '../lib/comment-doc';
import { useCommentStore } from '../stores';
import { useEditorStore } from '@/features/editor-tiptap/stores';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useCallback, useLayoutEffect, useRef } from 'react';

const GAP = 12;
const EDGE_PAD = 8;

/**
 * Floating card listing every comment covering the hovered text position.
 *
 * The editor plugin publishes the cursor position and the comment ids over
 * that position to the store; this component anchors a virtual element to
 * those viewport coords via @floating-ui/react (`useFloating` holds the
 * position state internally, so no effect-setState). Clicking an item
 * activates the comment card in the panel and jumps the editor to that
 * comment's full range.
 */
export function CommentHoverTooltip() {
  const hoveredCommentIds = useCommentStore((state) => state.hoveredCommentIds);
  const hoverPosition = useCommentStore((state) => state.hoverPosition);
  const comments = useCommentStore((state) => state.comments);
  const setActiveCommentId = useCommentStore(
    (state) => state.setActiveCommentId,
  );
  const setHover = useCommentStore((state) => state.setHover);
  const editor = useEditorStore((state) => state.editor);

  // Preserve creation order of `comments`; drop ids that no longer exist.
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const items = (hoveredCommentIds ?? [])
    .map((id) => byId.get(id))
    .filter((comment): comment is NonNullable<typeof comment> =>
      Boolean(comment),
    );

  const open = Boolean(editor && hoverPosition && items.length > 0);

  // Virtual element following the cursor: a floating card has no real DOM
  // reference to anchor to, so getBoundingClientRect() returns the hovered
  // viewport point. autoUpdate watches the floating element's scroll
  // container; moves of the virtual rect are re-positioned manually below.
  const referenceRef = useRef<{ getBoundingClientRect: () => DOMRect } | null>(
    null,
  );
  const { refs, floatingStyles, update } = useFloating({
    open,
    placement: 'top-start',
    middleware: [
      offset(GAP),
      flip({ padding: EDGE_PAD, fallbackAxisSideDirection: 'start' }),
      shift({ padding: EDGE_PAD }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    if (!open || !hoverPosition) return;
    const rect = new DOMRect(hoverPosition.x, hoverPosition.y, 2, 2);
    referenceRef.current = { getBoundingClientRect: () => rect };
    refs.setReference(referenceRef.current);
    update(); // reposition for the moved virtual rect (not a state setter)
  }, [open, hoverPosition, refs, update]);

  // `refs.setFloating` must not be read during render (react-hooks/refs);
  // a callback ref runs at commit time, which the rule permits.
  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => refs.setFloating(node),
    [refs],
  );

  const handleItemClick = (id: string) => {
    setActiveCommentId(id);
    if (editor) jumpToComment(editor, id);
    // Stay open after selecting an entry: the pointer is on the card and
    // the jump's selection change must not dismiss the hover state.
  };

  if (!open) return null;

  return (
    <div
      ref={setFloatingRef}
      role="group"
      aria-label="Overlapping comments"
      style={floatingStyles}
      onMouseLeave={(event) => {
        const related = event.relatedTarget as HTMLElement | null;
        // Moving back into the editor: the next editor mousemove re-pins the
        // card instantly, so never clear here (avoids a flicker).
        if (related && editor?.view.dom.contains(related)) return;
        setHover(null, null);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setHover(null, null);
      }}
      className="comment-hover-tooltip fixed z-50 flex max-h-[40vh] w-72 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-lg border bg-background p-1.5 shadow-lg scrollbar-thin"
    >
      {items.length > 1 && (
        <p className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
          {items.length} comments overlap here
        </p>
      )}
      {items.map((comment) => (
        <button
          key={comment.id}
          type="button"
          onClick={() => handleItemClick(comment.id)}
          className="flex flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
        >
          <span className="line-clamp-2 text-xs leading-snug whitespace-pre-wrap">
            {comment.text}
          </span>
        </button>
      ))}
    </div>
  );
}
