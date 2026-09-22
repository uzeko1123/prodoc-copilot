'use client';

import { useEditorStore } from '@/features/editor/stores';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  useEditorRef,
  useEditorScrollRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useEffect } from 'react';
import { EditorContainer, Editor as EditorPrimitive } from './ui/editor';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();

  return (
    <div className="h-full">
      <EditorContainer>
        <EditorPrimitive ref={editorScrollRef} />
      </EditorContainer>
      <EditorValueSync />
      <BlockSelectionRangeSync />
    </div>
  );
}

function EditorValueSync() {
  const value = useEditorValue();
  const setValue = useEditorStore((state) => state.setValue);

  useEffect(() => {
    setValue(value);
  }, [setValue, value]);

  return null;
}

function BlockSelectionRangeSync() {
  const editor = useEditorRef();
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  useEffect(() => {
    if (!selectedIds || selectedIds.size === 0) return;
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes({ sort: true });
    if (blocks.length === 0) return;
    const range = editor.api.nodesRange(blocks);
    if (!range) return;

    editor.tf.select(range);
    editor.setOption(BlockSelectionPlugin, 'selectedIds', selectedIds);
  }, [editor, selectedIds]);

  return null;
}
