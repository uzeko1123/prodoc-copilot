'use client';

import { SettingsDialog } from '@/components/shadcn/editor/settings-dialog';
import { useEditorStore } from '@/features/editor/stores';
import { useEditorScrollRef, useEditorValue } from 'platejs/react';
import { useEffect } from 'react';
import { Editor as Editor_, EditorContainer } from './ui/editor';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();

  const value = useEditorValue();
  const setValue = useEditorStore((state) => state.setValue);

  useEffect(() => {
    setValue(value);
  }, [setValue, value]);

  return (
    <div className="h-full">
      <EditorContainer>
        <Editor_
          ref={editorScrollRef}
          className="scrollbar-thumb-border scrollbar-thin"
        />
      </EditorContainer>
      <SettingsDialog />
    </div>
  );
}
