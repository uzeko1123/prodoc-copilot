import { useCommentStore } from '../stores';
import { Mark, mergeAttributes, type Range } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Apply the comment mark with the given id over the current selection.
       */
      setCommentMark: (attrs: { id: string }) => ReturnType;
    };
  }
}

/**
 * Mark that highlights commented text in the editor.
 *
 * Renders as `<mark data-comment-id="…">`, distinct from the built-in
 * `highlight` mark (which renders a plain `<mark>` with an inline color).
 * The mark persists in the document and moves with edits; the matching
 * comment card in the side panel is looked up by the `id` attribute.
 */
export const CommentMark = Mark.create({
  name: 'comment',

  addAttributes() {
    return {
      id: {
        default: null as string | null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) => ({ 'data-comment-id': attributes.id }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'mark[data-comment-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setCommentMark:
        (attrs) =>
        ({ commands }) => {
          if (!attrs.id) return false;
          return commands.setMark(this.name, { id: attrs.id });
        },
    };
  },

  // ProseMirror cannot store two same-type marks on one text node (the model
  // rejects it), so overlapping comments are tracked by RANGE, not by mark:
  // the store keeps every comment's canonical range, and this plugin remaps it
  // through the transaction mapping on every dispatch, keeping it in lockstep
  // with edits, undo/redo and newly-created overlapping comments. Hover and
  // click hit-testing use range containment; the mark itself is cosmetic.
  addProseMirrorPlugins() {
    // Per-editor closure state (reset when the editor is re-created).
    let lastKey: string | null = null; // '\u0000'-joined id signature last committed
    let anchor: { x: number; y: number } | null = null; // last pointer position that had a comment
    let lastAnchorNode: Node | null = null; // DOM node the open tooltip is anchored to

    const GRACE_PX = 24; // keep the open tooltip pinned within 24px of the anchor

    const emit = (
      ids: string[] | null,
      pos: { x: number; y: number } | null,
    ): void => {
      lastKey = ids ? ids.join('\u0000') : null;
      if (!ids || !pos) {
        anchor = null;
        lastAnchorNode = null;
      }
      useCommentStore.getState().setHover(ids, pos);
    };

    return [
      new Plugin({
        key: new PluginKey('comment-mark-click'),
        state: {
          init: () => null,
          apply: (tr, _value, _oldState, newState) => {
            const store = useCommentStore.getState();
            const { comments } = store;

            // Keep live ranges in sync with the doc through the transaction
            // mapping (identity mapping on unrelated transactions).
            if (comments.length > 0) {
              const size = tr.doc.content.size;
              const changes: Array<{ id: string; range: Range }> = [];
              for (const c of comments) {
                const nextFrom = Math.min(
                  Math.max(0, tr.mapping.map(c.range.from, 1)),
                  size,
                );
                const nextTo = Math.min(
                  Math.max(nextFrom, tr.mapping.map(c.range.to, -1)),
                  size,
                );
                if (nextFrom === c.range.from && nextTo === c.range.to) {
                  continue; // identity mapping → nothing moved
                }
                changes.push({
                  id: c.id,
                  range: { from: nextFrom, to: nextTo },
                });
              }
              if (changes.length > 0) store.updateCommentRanges(changes);
            }

            // Clicking elsewhere in the editor collapses the selection; the
            // focused comment card then loses focus too. Clicking a comment
            // mark (handleClick) consumes the click so no collapse transaction
            // is dispatched for that gesture.
            if (newState.selection.empty && store.activeCommentId) {
              store.setActiveCommentId(null);
            }
            return null;
          },
        },
        props: {
          handleClick: (_view, pos) => {
            // Range containment, not mark lookup: after an overlap the
            // surviving mark no longer covers the whole original quote.
            const id = useCommentStore
              .getState()
              .comments.find(
                (c) => c.range.from <= pos && pos < c.range.to,
              )?.id;
            if (!id) return false;
            useCommentStore.getState().setActiveCommentId(id);
            // Consume the click: keep the current selection so the activated
            // card is not immediately cleared by the collapse logic above.
            return true;
          },
          handleDOMEvents: {
            mousemove: (view, event) => {
              // Fast path: nothing to hover yet.
              if (useCommentStore.getState().comments.length === 0) {
                if (lastKey) emit(null, null);
                return false;
              }

              const now = { x: event.clientX, y: event.clientY };
              const coords = view.posAtCoords({
                left: now.x,
                top: now.y,
              });
              // Overlapping ranges derive from the store (marks cannot
              // coexist), preserving creation order: [A, B], not doc order.
              let ids: string[] = [];
              if (coords) {
                ids = useCommentStore
                  .getState()
                  .comments.filter(
                    (c) =>
                      c.range.from <= coords.pos && coords.pos < c.range.to,
                  )
                  .map((c) => c.id);
              }

              if (coords && ids.length > 0) {
                anchor = now;
                const key = ids.join('\u0000');
                // Re-anchor only when the id set or the hovered DOM node
                // changes — the tooltip must not follow the pointer across
                // the highlighted text; it stays put like a regular element
                // tooltip. coordsAtPos gives the line box of the hovered
                // character for a stable anchor point.
                const dom = view.domAtPos(coords.pos);
                const hoveredNode =
                  dom.node.nodeType === Node.TEXT_NODE
                    ? dom.node.parentElement
                    : dom.node;
                if (key !== lastKey || hoveredNode !== lastAnchorNode) {
                  const rect = view.coordsAtPos(coords.pos);
                  emit(ids, { x: rect.left, y: rect.top });
                  lastAnchorNode = hoveredNode;
                }
                return false;
              }

              // No comment under the pointer. Within the grace radius of the
              // last anchor (e.g. crossing the gap onto the tooltip card), keep
              // the current hover pinned rather than dismissing it.
              if (
                anchor &&
                Math.hypot(now.x - anchor.x, now.y - anchor.y) <= GRACE_PX
              ) {
                return false;
              }
              if (lastKey) emit(null, null);
              return false;
            },
            mouseleave: (_view, event) => {
              const related = event.relatedTarget as HTMLElement | null;
              // Pointer moved onto the tooltip card itself → keep hover alive.
              // Uses closest(): the entry target is usually an inner button.
              if (related && related.closest?.('.comment-hover-tooltip')) {
                return false;
              }
              emit(null, null);
              return false;
            },
          },
        },
      }),
    ];
  },
});
