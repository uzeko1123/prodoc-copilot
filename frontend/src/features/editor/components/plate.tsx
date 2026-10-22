'use client';

import type { Value } from 'platejs';
import { Plate as PlatePrimitive, usePlateEditor } from 'platejs/react';
import { useEffect } from 'react';
import { EditorKit } from './editor/editor-kit';
import { DocumentPlugin } from './editor/plugins/document-kit';

export function Plate({
  value,
  documentId,
  canEdit,
  children,
}: {
  value: Value;
  documentId: string;
  canEdit: boolean;
  children: React.ReactNode;
}) {
  const editor = usePlateEditor({ plugins: EditorKit, value }, [documentId]);

  useEffect(() => {
    editor.setOption(DocumentPlugin, 'documentId', documentId);
  }, [editor, documentId]);

  useEffect(() => {
    editor.setOption(DocumentPlugin, 'canEdit', canEdit);
  }, [editor, canEdit]);

  return (
    <PlatePrimitive editor={editor} readOnly={!canEdit}>
      {children}
    </PlatePrimitive>
  );
}
