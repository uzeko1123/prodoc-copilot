'use client';

import type { Value } from 'platejs';
import { Plate as PlatePrimitive, usePlateEditor } from 'platejs/react';
import { useEffect } from 'react';
import { EditorKit } from './editor/editor-kit';
import { DocumentPlugin } from './editor/plugins/document-kit';

export function Plate({
  documentId,
  value,
  readonly,
  children,
}: {
  documentId: string;
  value: Value;
  readonly: boolean;
  children: React.ReactNode;
}) {
  const editor = usePlateEditor({ plugins: EditorKit, value }, [documentId]);

  useEffect(() => {
    editor.setOption(DocumentPlugin, 'documentId', documentId);
  }, [editor, documentId]);

  return (
    <PlatePrimitive editor={editor} readOnly={readonly}>
      {children}
    </PlatePrimitive>
  );
}
