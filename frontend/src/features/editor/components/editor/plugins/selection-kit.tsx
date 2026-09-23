// @generated-by-ai

'use client';

import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import { getSelection } from 'platejs';
import {
  createPlatePlugin,
  useEditorReadOnly,
  usePluginOption,
  useSelectionVersion,
  type PlateEditor,
} from 'platejs/react';
import * as React from 'react';
import { CursorOverlayKit } from './cursor-overlay-kit';

/**
 * Keeps Range text selections alive (and painted) after the editor loses
 * DOM focus, in both edit and readonly mode.
 *
 * - overrideEditor: swallow the deselect slate-react applies when the DOM
 *   selection leaves the editable in readonly mode.
 * - useHooks: repaint the selection through a CursorOverlayPlugin cursor
 *   once the browser stops painting the native highlight.
 */
export const SelectionPlugin = createPlatePlugin({
  key: 'selection',
})
  .overrideEditor(({ editor, tf: { apply } }) => ({
    transforms: {
      apply(operation) {
        const isDeselect =
          operation.type === 'set_selection' &&
          operation.newProperties === null;

        // Swallow: no op, no onChange, the chat context stays visible.
        if (isDeselect && shouldSwallowDeselect(editor)) return;
        apply(operation);
      },
    },
  }))
  .extend({
    useHooks: ({ editor }) => useSyncSelectionOverlay(editor),
  });

/** Whether the deselect comes from focus leaving the editor (e.g. clicking the chat input). */
function shouldSwallowDeselect(editor: PlateEditor) {
  if (!editor.selection || !editor.dom.readOnly) return false;

  const root = editor.api.findDocumentOrShadowRoot();
  const editable = editor.api.toDOMNode(editor);
  if (!root || !editable) return false;

  const isOutsideEditable = (node: Node | null) =>
    !node || !editable.contains(node);

  const activeElement = root.activeElement;
  if (!(activeElement instanceof HTMLElement)) return false;

  // Block selection's shadow input deselects on purpose — let it through.
  if (activeElement.classList.contains('slate-shadow-input')) return false;

  return (
    isOutsideEditable(activeElement) &&
    isOutsideEditable(getSelection(root)?.anchorNode ?? null)
  );
}

/** Whether the browser still paints a native selection over editor content. */
function isNativeHighlightPainted(editor: PlateEditor) {
  const root = editor.api.findDocumentOrShadowRoot();
  const domSelection = root ? getSelection(root) : null;
  if (!domSelection?.anchorNode) return false;

  // Fast path: this fires on every selectionchange anywhere in the app
  // (typing in the chat textarea included), so bail with a cheap contains
  // check before the toSlateRange DOM-to-model mapping. A native selection
  // outside the editable can never map to a Slate range.
  const editable = editor.api.toDOMNode(editor);
  if (!editable) return false;
  if (!editable.contains(domSelection.anchorNode)) return false;

  // Test mappability, not node containment: afterEditable slots (e.g. the
  // AI menu) can sit inside the editable yet be unmappable, meaning the
  // native highlight is already gone.
  return !!editor.api.toSlateRange(domSelection, {
    exactMatch: false,
    suppressThrow: true,
  });
}

/**
 * Idempotent reconciliation: show the overlay cursor iff a model selection
 * exists, block selection is inactive, and the native highlight is gone.
 */
function useSyncSelectionOverlay(editor: PlateEditor) {
  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome',
  );
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible',
  );
  const selectionVersion = useSelectionVersion();
  const readOnly = useEditorReadOnly();

  const syncOverlay = React.useCallback(() => {
    const shouldShowOverlay =
      !!editor.selection &&
      !isSelectingSome &&
      !isSelectionAreaVisible &&
      !isNativeHighlightPainted(editor);

    const { cursorOverlay } = editor.getApi(CursorOverlayPlugin);
    const cursor = editor.getOption(CursorOverlayPlugin, 'cursors')?.[
      'selection'
    ];

    if (shouldShowOverlay) {
      if (cursor?.selection !== editor.selection) {
        cursorOverlay.addCursor('selection', {
          selection: editor.selection,
        });
      }
    } else if (cursor) {
      cursorOverlay.removeCursor('selection');
    }
  }, [editor, isSelectingSome, isSelectionAreaVisible]);

  // React-side triggers: model selection, readonly mode, block selection.
  React.useEffect(() => {
    syncOverlay();
    // Re-run after CursorOverlayPlugin's own setTimeout(0) re-add so this
    // reconciliation always gets the last word.
    const id = setTimeout(syncOverlay, 0);
    return () => clearTimeout(id);
  }, [syncOverlay, selectionVersion, readOnly]);

  // DOM-side trigger: in readonly mode the editable is unfocusable, so
  // document selectionchange is the only reliable signal.
  React.useEffect(() => {
    document.addEventListener('selectionchange', syncOverlay);
    return () => document.removeEventListener('selectionchange', syncOverlay);
  }, [syncOverlay]);
}

// Plate dedupes plugins by key, so CursorOverlayKit being spread again in
// editor-kit.tsx (via AIKit) is safe.
export const SelectionKit = [...CursorOverlayKit, SelectionPlugin];
