'use client';

import {
  EditorContainer,
  Editor as EditorPrimitive,
} from '@/components/shadcn/ui/editor';
import { FixedToolbar } from '@/components/shadcn/ui/fixed-toolbar';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  useEditorRef,
  useEditorScrollRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useEffect, type CSSProperties } from 'react';
import { useEditorStore } from '../stores';
import { FixedToolbarButtons } from './ui/fixed-toolbar-buttons';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();
  const editorFontFamily = useEditorStore((state) => state.editorFontFamily);
  const editorTextIndent = useEditorStore((state) => state.editorTextIndent);

  return (
    <div className="flex h-full flex-col">
      <FixedToolbar className="h-10 min-h-10">
        <FixedToolbarButtons />
      </FixedToolbar>
      <EditorContainer className="scrollbar-none overflow-y-hidden">
        <EditorPrimitive
          ref={editorScrollRef}
          className="editor-font sm:px-[clamp(64px,calc(50%-350px),160px)]"
          style={
            {
              ...editorFontFamily,
              '--editor-text-indent': editorTextIndent,
            } as CSSProperties
          }
        />
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
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes({ sort: true });
    const range = editor.api.nodesRange(blocks);
    if (!range) {
      editor.tf.deselect();
      return;
    }

    editor.tf.select(range);
    if (editor.getOption(BlockSelectionPlugin, 'selectedIds') !== selectedIds) {
      editor.setOption(BlockSelectionPlugin, 'selectedIds', selectedIds);
    }
  }, [editor, selectedIds]);

  return null;
}
