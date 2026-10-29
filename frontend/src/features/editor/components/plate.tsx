'use client';

import {
  useMainDocumentsRetrieve,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { DefaultPending } from '@/components/default-pending';
import { useParams } from '@tanstack/react-router';
import type { Value } from 'platejs';
import { Plate as PlatePrimitive, usePlateEditor } from 'platejs/react';
import { useEffect } from 'react';
import { EditorKit } from './editor/editor-kit';
import { TaskPlugin } from './editor/plugins/task-kit';

export function Plate({
  canEdit,
  canComment,
  children,
}: {
  canEdit: boolean;
  canComment: boolean;
  children: React.ReactNode;
}) {
  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const { data: document, isPending } = useMainDocumentsRetrieve(
    task?.document ?? '',
    { query: { enabled: task?.document !== undefined } },
  );

  const editor = usePlateEditor(
    { plugins: EditorKit, value: (document?.value as Value) ?? [] },
    [document?.id],
  );

  useEffect(() => {
    editor.setOption(TaskPlugin, 'canEdit', canEdit);
    editor.setOption(TaskPlugin, 'canComment', canComment);
  }, [editor, canEdit, canComment]);

  if (isPending || !document)
    return <DefaultPending message="文档加载中 . . ." />;

  return (
    <PlatePrimitive editor={editor} readOnly={!canEdit}>
      {children}
    </PlatePrimitive>
  );
}
