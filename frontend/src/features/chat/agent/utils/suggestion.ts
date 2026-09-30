// @generated-by-ai

import { deserializeMd } from '@platejs/markdown';
import {
  BaseSuggestionPlugin,
  getSuggestionKey,
  setSuggestionNodes,
} from '@platejs/suggestion';
import { KEYS, nanoid, RangeApi, TextApi } from 'platejs';
import type {
  Descendant,
  TInlineSuggestionData,
  TRange,
  TSuggestionData,
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
    id: nanoid(),
    createdAt: Date.now(),
    type: 'insert',
    userId:
      editor.getOptions(BaseSuggestionPlugin).currentUserId ?? 'anonymous',
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
 * Replace or delete `range` as one atomic suggestion: insert at the range end
 * first (keeps the range points valid), then mark the range as a remove
 * suggestion sharing the insert id, so accept/reject applies to both. A
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
    setSuggestionNodes(editor, {
      at: range,
      ...(data && { suggestionId: data.id, createdAt: data.createdAt }),
    });
  }
}
