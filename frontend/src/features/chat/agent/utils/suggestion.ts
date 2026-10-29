// @generated-by-ai

import type { TSuggestionData } from '@/features/comment/lib/suggestion';
import { deserializeMd } from '@platejs/markdown';
import {
  BaseSuggestionPlugin,
  getSuggestionKey,
  setSuggestionNodes,
} from '@platejs/suggestion';
import {
  ElementApi,
  KEYS,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
} from 'platejs';
import type {
  Descendant,
  Path,
  TElement,
  TInlineSuggestionData,
  TRange,
  TSuggestionElement,
  TSuggestionText,
  TText,
} from 'platejs';
import type { PlateEditor } from 'platejs/react';

/**
 * Depth-first first/last text node of `nodes`, or undefined when there is
 * none (e.g. a void block without text children).
 */
function getEdgeText(
  nodes: Descendant[],
  edge: 'first' | 'last',
): TText | undefined {
  const order = edge === 'last' ? [...nodes].reverse() : nodes;

  for (const node of order) {
    if (TextApi.isText(node)) return node;

    const text = getEdgeText(node.children, edge);
    if (text) return text;
  }

  return undefined;
}

/**
 * Insert markdown at the current selection as an insert suggestion. Returns
 * the suggestion data, or undefined for empty markdown (nothing inserted).
 *
 * `insertFragment` merges the first fragment block into the target block at an
 * inline point and drops block-level marks, so every non-empty text
 * descendant is marked at the text level — those survive the merge (empty
 * texts are skipped to avoid ghost marks inside voids). Top-level elements
 * also keep a block-level mark so whole-block inserts are removed on reject.
 * Inline elements are deliberately unmarked: rejecting same-id inline
 * elements next to marked texts crashes in the library (stale-path removal),
 * so they survive reject instead — same as the library's own
 * insertFragmentSuggestion.
 *
 * Whitespace: CommonMark strips edge whitespace, so the edges are restored
 * from the raw markdown to keep the "spaces/newlines must be written by the
 * model" contract honest — (a) leading/trailing spaces and tabs are merged
 * back into the first/last text node, (b) a whitespace-only string is
 * inserted literally instead of being dropped, and (c) an edge blank line is
 * materialized as an unmarked empty paragraph that sacrificially absorbs the
 * first/last-block unwrap `insertFragment` performs when the insertion point
 * is not at that block's boundary, keeping the real blocks whole. The empty
 * paragraph is only added on the side that would unwrap, so it never survives
 * as a visible block. (Semantics mirror the library's own streaming
 * compensation in `streamDeserializeMd`.)
 */
function insertSuggestion(
  editor: PlateEditor,
  md: string,
): TSuggestionData | undefined {
  if (md === '') return undefined;

  // Mirror Slate's insertFragment boundary check (nearest block above the
  // insertion point) to know which fragment edge would be unwrapped.
  const focus = editor.selection?.focus;
  const blockEntry = focus
    ? editor.api.block({ at: focus, above: true })
    : undefined;
  const atStart =
    !focus || !blockEntry || editor.api.isStart(focus, blockEntry[1]);
  const atEnd = !focus || !blockEntry || editor.api.isEnd(focus, blockEntry[1]);

  const fragment = deserializeMd(editor, md);
  const leadingSpaces = md.match(/^[ \t]*/)![0];
  const trailingSpaces = md.match(/[ \t]*$/)![0];
  const core = md.slice(
    leadingSpaces.length,
    md.length - trailingSpaces.length,
  );

  if (fragment.length === 0) {
    // A whitespace-only string parses to no nodes: insert it literally
    // instead of dropping it (e.g. `edit: " "` = replace with a space).
    fragment.push({ children: [{ text: md }], type: KEYS.p });
  } else {
    if (leadingSpaces) {
      const text = getEdgeText(fragment, 'first');
      if (text) text.text = leadingSpaces + text.text;
    }
    if (trailingSpaces) {
      const text = getEdgeText(fragment, 'last');
      if (text) text.text += trailingSpaces;
    }
  }

  const data: TSuggestionData = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    type: 'insert',
    userId:
      editor.getOptions(BaseSuggestionPlugin).currentUserId ?? 'anonymous',
    createdByAI: true,
  };
  const key = getSuggestionKey(data.id);

  const mark = (nodes: Descendant[], topLevel: boolean) => {
    for (const node of nodes) {
      if (TextApi.isText(node)) {
        if (!node.text) continue;
        const text = node as TSuggestionText;
        text.suggestion = true;
        text[key] = { ...data } as TInlineSuggestionData;
      } else {
        const element = node as TSuggestionElement;
        if (topLevel) element.suggestion = { ...data };
        mark(element.children, false);
      }
    }
  };
  mark(fragment, true);

  // Edge blank line = keep the first/last block whole. The unmarked empty
  // paragraph contains the fragment's first/last leaf, so insertFragment
  // unwraps it (collapsing to an invisible {text: ''}) instead of the real
  // block — see the function doc comment.
  if (core.startsWith('\n\n') && !atStart) {
    fragment.unshift({ children: [{ text: '' }], type: KEYS.p });
  }
  if (core.endsWith('\n\n') && !atEnd) {
    fragment.push({ children: [{ text: '' }], type: KEYS.p });
  }

  editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
    editor.tf.insertFragment(fragment);
  });

  return data;
}

/** Insert markdown at the end of `range` as an insert suggestion. */
export function applyGenerateSuggestion(
  editor: PlateEditor,
  range: TRange,
  md: string,
): void {
  editor.tf.select(RangeApi.end(range));
  insertSuggestion(editor, md);
}

/**
 * Blocks whose content is previewed in the discussion card when fully covered
 * by an edit range (text-level marks). Every other fully covered block is
 * block-marked only, so the card shows a type summary instead of content.
 */
const PREVIEW_TYPES = new Set<string>([
  KEYS.p,
  KEYS.h1,
  KEYS.h2,
  KEYS.h3,
  KEYS.h4,
  KEYS.h5,
  KEYS.h6,
]);

/**
 * Remove-mark `range` as one suggestion, block-aware: fully covered blocks at
 * any depth get a block-level remove mark so accepting really deletes them —
 * text-level marks alone leave empty paragraph shells and never touch void
 * blocks. Preview-type blocks keep text marks for the card preview. When the
 * inserted markdown merges into the block holding `range`'s end
 * (`mergeIntoEndBlock`), that block is never block-marked, or accepting would
 * delete the merged insert along with the old text.
 */
function markRemoval(
  editor: PlateEditor,
  range: TRange,
  data: TSuggestionData,
  mergeIntoEndBlock: boolean,
): void {
  const [rangeStart, rangeEnd] = RangeApi.edges(range);

  const textMark = (at: TRange) => {
    setSuggestionNodes(editor, {
      at,
      createdAt: data.createdAt,
      suggestionId: data.id,
    });
  };
  const blockMark = (path: Path) => {
    editor.tf.setNodes<TElement>(
      { suggestion: { ...data, type: 'remove' } },
      { at: path },
    );
  };

  const visit = (at: Path) => {
    for (const [child, childPath] of NodeApi.children(editor, at)) {
      if (!ElementApi.isElement(child) || editor.api.isInline(child)) continue;

      const start = editor.api.start(childPath);
      const end = editor.api.end(childPath);
      if (!start || !end) continue;

      const childRange = { anchor: start, focus: end };
      const covered =
        PointApi.compare(start, rangeStart) >= 0 &&
        PointApi.compare(end, rangeEnd) <= 0;
      const holdsInsertion =
        mergeIntoEndBlock &&
        (PathApi.isAncestor(childPath, rangeEnd.path) ||
          PathApi.equals(childPath, rangeEnd.path));

      if (covered && !holdsInsertion) {
        blockMark(childPath);

        // Collapsed childRange (empty paragraph): setSuggestionNodes would
        // fall through to a whole-block setNodes and overwrite the block mark
        // set above with text-style keys.
        if (
          child.type &&
          PREVIEW_TYPES.has(child.type) &&
          !RangeApi.isCollapsed(childRange)
        ) {
          textMark(childRange);
        }

        // Fully covered: no need to descend.
        continue;
      }

      // Partially covered, or the insertion target block (it must survive
      // accepting to hold the merged insert). A collapsed intersection is
      // skipped: marking it would land on the whole block.
      const intersection = RangeApi.intersection(range, childRange);
      if (intersection && !RangeApi.isCollapsed(intersection)) {
        textMark(intersection);
      }

      // Descend for fully covered nested blocks (list items, table rows…).
      visit(childPath);
    }
  };

  visit([]);
}

/**
 * Replace or delete `range` as one atomic suggestion: insert at the range end
 * first (keeps the range points valid), then remove-mark the range sharing the
 * insert id, so accept/reject applies to both. Fully covered blocks are
 * block-marked so accepting deletes them outright (see `markRemoval`). A
 * collapsed range cannot be remove-marked (the mark would land on the whole
 * block), so it degrades to a pure insert.
 */
export function applyEditSuggestion(
  editor: PlateEditor,
  range: TRange,
  md: string,
): void {
  let data: TSuggestionData | undefined;

  if (md.length > 0) {
    editor.tf.select(RangeApi.end(range));
    data = insertSuggestion(editor, md);
  }
  if (!RangeApi.isCollapsed(range)) {
    // Pure delete: synthesize a UUID id so the suggestion stays annotatable
    // (the annotation row is keyed by the suggestion id, which must be a UUID).
    data ??= {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      type: 'remove',
      userId:
        editor.getOptions(BaseSuggestionPlugin).currentUserId ?? 'anonymous',
      createdByAI: true,
    };
    // The inserted first line merges into the end block unless the markdown
    // starts with a blank line (the sacrificial paragraph absorbs the merge).
    const core = md.replace(/^[ \t]*/, '').replace(/[ \t]*$/, '');

    markRemoval(editor, range, data, md.length > 0 && !core.startsWith('\n\n'));
  }
}
