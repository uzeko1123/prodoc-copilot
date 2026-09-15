'use client';

import { SettingsDialog } from '@/components/shadcn/editor/settings-dialog';
import { Editor as Editor_, EditorContainer } from './ui/editor';

export function Editor() {
  return (
    <div className="h-full">
      <EditorContainer>
        <Editor_ className="scrollbar-thumb-border scrollbar-thin" />
      </EditorContainer>
      <SettingsDialog />
    </div>
  );
}
