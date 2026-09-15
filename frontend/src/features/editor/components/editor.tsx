'use client';

import { SettingsDialog } from '@/components/shadcn/editor/settings-dialog';
import { Editor as Editor_, EditorContainer } from './ui/editor';
import { useEditorScrollRef } from 'platejs/react';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();

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
