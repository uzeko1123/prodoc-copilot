'use client';

import { SettingsDialog } from '@/components/shadcn/editor/settings-dialog';
import { useEditorStore } from '@/features/editor/stores';
import { useEditorScrollRef, useEditorValue } from 'platejs/react';
import { useEffect } from 'react';
import { EditorContainer, Editor as EditorPrimitive } from './ui/editor';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();

  return (
    <div className="h-full">
      <EditorValueSync />
      <EditorContainer>
        <EditorPrimitive
          ref={editorScrollRef}
          className="scrollbar-thumb-border scrollbar-thin"
        />
      </EditorContainer>
      <SettingsDialog />
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
