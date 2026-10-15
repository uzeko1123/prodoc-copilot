'use client';

import { useMainDocumentsRetrieve } from '@/api/gen/endpoints/main/main';
import { ErrorBoundary } from '@/components/error-boundary';
import { Pending } from '@/components/pending';
import type { Value } from 'platejs';
import { Plate as PlatePrimitive, usePlateEditor } from 'platejs/react';
import { EditorKit } from './editor/editor-kit';

export function Plate({
  documentId,
  readOnly,
  children,
}: {
  documentId: string;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary message="文档加载失败">
      <PlateComponent documentId={documentId} readOnly={readOnly}>
        {children}
      </PlateComponent>
    </ErrorBoundary>
  );
}

function PlateComponent({
  documentId,
  readOnly,
  children,
}: {
  documentId: string;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  const { data: document, isPending } = useMainDocumentsRetrieve(documentId);

  const editor = usePlateEditor(
    { plugins: EditorKit, value: (document?.value as Value) ?? [] },
    [documentId],
  );

  if (isPending || !document) return <Pending message="文档加载中 . . ." />;

  return (
    <PlatePrimitive editor={editor} readOnly={readOnly}>
      {children}
    </PlatePrimitive>
  );
}
