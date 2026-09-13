import { useCommentStore } from '../stores';
import { TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';

/**
 * Scroll the editor to the comment and select its quoted text.
 *
 * The comment's range is the live, transaction-mapped one from the store:
 * ProseMirror cannot store overlapping same-type marks, so the doc alone
 * cannot reconstruct the full original quote for a comment whose range was
 * later overlapped by another comment. Silent no-op when the comment no
 * longer exists or its text was fully deleted.
 */
export function jumpToComment(editor: Editor, id: string): void {
  const comment = useCommentStore.getState().comments.find((c) => c.id === id);
  if (!comment) return;

  const doc = editor.state.doc;
  const size = doc.content.size;
  const from = Math.min(Math.max(0, comment.range.from), size);
  const to = Math.min(Math.max(from, comment.range.to), size);
  if (from >= to) return; // fully-deleted / collapsed comment

  const { view } = editor;
  view.dispatch(
    view.state.tr.setSelection(TextSelection.create(doc, from, to)),
  );
  view.focus();

  // Scroll the selection into the vertical center (like the table of
  // contents). domAtPos may return a text node — scroll its parent element.
  const dom = view.domAtPos(from);
  const target =
    dom.node.nodeType === Node.TEXT_NODE
      ? dom.node.parentElement
      : (dom.node as Element);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
