'use client';

import { useMainDocumentsRetrieve } from '@/api/gen/endpoints/main/main';
import type { Task } from '@/api/gen/models';
import { ErrorBoundary } from '@/components/error-boundary';
import { Pending } from '@/components/pending';
import type { Value } from 'platejs';
import { Plate as PlatePrimitive, usePlateEditor } from 'platejs/react';
import { useEffect } from 'react';
import { EditorKit } from './editor/editor-kit';
import { DocumentPlugin } from './editor/plugins/document-kit';

export function Plate({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary message="文档加载失败">
      <PlateComponent task={task}>{children}</PlateComponent>
    </ErrorBoundary>
  );
}

function PlateComponent({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  const documentId = task.document;
  const { data: document, isPending } = useMainDocumentsRetrieve(documentId);

  const editor = usePlateEditor(
    { plugins: EditorKit, value: (document?.value as Value) ?? [] },
    [documentId],
  );

  useEffect(() => {
    editor.setOption(DocumentPlugin, 'documentId', documentId);
  }, [editor, documentId]);

  if (isPending || !document) return <Pending message="文档加载中 . . ." />;

  return (
    <PlatePrimitive editor={editor} readOnly={false}>
      {children}
    </PlatePrimitive>
  );
}
