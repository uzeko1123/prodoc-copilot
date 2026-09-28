// @generated-by-ai

import { deserializeMd } from '@platejs/markdown';
import {
  BaseSuggestionPlugin,
  getSuggestionKey,
  setSuggestionNodes,
} from '@platejs/suggestion';
import { nanoid, RangeApi, TextApi } from 'platejs';
import type {
  Descendant,
  TInlineSuggestionData,
  TRange,
  TSuggestionData,
  TSuggestionElement,
  TSuggestionText,
} from 'platejs';
import type { PlateEditor } from 'platejs/react';

/**
 * Insert markdown at the current selection as an insert suggestion. Returns
 * the suggestion data, or undefined for blank markdown (nothing inserted).
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
 */
function insertSuggestion(
  editor: PlateEditor,
  md: string,
): TSuggestionData | undefined {
  if (!md.trim()) return undefined;

  const fragment = deserializeMd(editor, md);
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

  editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
    editor.tf.insertFragment(fragment);
  });

  return data;
}

/** Insert markdown at the end of `range` as an insert suggestion. */
export function insertAtEndSuggestion(
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
export function replaceRangeSuggestion(
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
