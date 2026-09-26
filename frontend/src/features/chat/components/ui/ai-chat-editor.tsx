'use client';

import { BaseEditorKit } from '@/components/shadcn/editor/editor-base-kit';
import { EditorStatic } from '@/components/shadcn/ui/editor-static';
import { useAIChatEditor } from '@platejs/ai/react';
import { createSlateEditor, type SlateEditor } from 'platejs';
import * as React from 'react';

let editorStatic: SlateEditor | null = null;

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const editor = React.useMemo(
    () => (editorStatic ??= createSlateEditor({ plugins: BaseEditorKit })),
    [],
  );

  const value = useAIChatEditor(editor, content);

  return <EditorStatic variant="ai" editor={editor} value={value} />;
});
