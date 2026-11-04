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
 * 编辑器失去 DOM 焦点后，让 Range 文本选区保持存活（且可见），编辑与
 * 只读两种模式下均生效。
 *
 * - overrideEditor：只读模式下 DOM 选区离开可编辑区时，吞掉 slate-react
 *   施加的 deselect。
 * - useHooks：浏览器停止绘制原生高亮后，通过 CursorOverlayPlugin 的
 *   cursor 重绘选区。
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

        // 吞掉：不生成 op、不触发 onChange，聊天上下文保持可见。
        if (isDeselect && shouldSwallowDeselect(editor)) return;
        apply(operation);
      },
    },
  }))
  .extend({
    useHooks: ({ editor }) => useSyncSelectionOverlay(editor),
  });

/** 判定 deselect 是否源于焦点离开编辑器（如点击聊天输入框）。 */
function shouldSwallowDeselect(editor: PlateEditor) {
  if (!editor.selection || !editor.dom.readOnly) return false;

  const root = editor.api.findDocumentOrShadowRoot();
  const editable = editor.api.toDOMNode(editor);
  if (!root || !editable) return false;

  const isOutsideEditable = (node: Node | null) =>
    !node || !editable.contains(node);

  const activeElement = root.activeElement;
  if (!(activeElement instanceof HTMLElement)) return false;

  // 块选区的 shadow input 有意触发 deselect——放行。
  if (activeElement.classList.contains('slate-shadow-input')) return false;

  return (
    isOutsideEditable(activeElement) &&
    isOutsideEditable(getSelection(root)?.anchorNode ?? null)
  );
}

/** 判定浏览器是否仍在编辑器内容上绘制原生选区。 */
function isNativeHighlightPainted(editor: PlateEditor) {
  const root = editor.api.findDocumentOrShadowRoot();
  const domSelection = root ? getSelection(root) : null;
  if (!domSelection?.anchorNode) return false;

  // 快路径：应用内任意位置的 selectionchange 都会触发这里（含在聊天
  // 输入框打字），故先做廉价的 contains 检查再走 toSlateRange 的
  // DOM→模型映射。可编辑区之外的原生选区永远映射不出 Slate range。
  const editable = editor.api.toDOMNode(editor);
  if (!editable) return false;
  if (!editable.contains(domSelection.anchorNode)) return false;

  // 检验可映射性而非节点包含关系：afterEditable 槽位（如 AI 菜单）可以
  // 位于可编辑区内却不可映射，说明原生高亮已经消失。
  return !!editor.api.toSlateRange(domSelection, {
    exactMatch: false,
    suppressThrow: true,
  });
}

/**
 * 幂等调和：当且仅当存在模型选区、块选区未激活、且原生高亮已消失时，
 * 显示 overlay cursor。
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

  // React 侧触发源：模型选区、只读模式、块选区。
  React.useEffect(() => {
    syncOverlay();
    // 在 CursorOverlayPlugin 自己的 setTimeout(0) 重加之后再跑一次，
    // 让本次调和永远说了算。
    const id = setTimeout(syncOverlay, 0);
    return () => clearTimeout(id);
  }, [syncOverlay, selectionVersion, readOnly]);

  // DOM 侧触发源：只读模式下可编辑区不可聚焦，document 的
  // selectionchange 是唯一可靠信号。
  React.useEffect(() => {
    document.addEventListener('selectionchange', syncOverlay);
    return () => document.removeEventListener('selectionchange', syncOverlay);
  }, [syncOverlay]);
}

// Plate 按 key 去重插件，CursorOverlayKit 在 editor-kit.tsx（经 AIKit）
// 中再次展开是安全的。
export const SelectionKit = [...CursorOverlayKit, SelectionPlugin];
