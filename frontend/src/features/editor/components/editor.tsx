'use client';

import {
  getMainDocumentsRetrieveQueryKey,
  mainDocumentsPartialUpdate,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import {
  EditorContainer,
  Editor as EditorPrimitive,
} from '@/components/shadcn/ui/editor';
import { FixedToolbar } from '@/components/shadcn/ui/fixed-toolbar';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { toastErrorMessage } from '@/lib/error-message';
import { queryClient } from '@/lib/query-client';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useParams } from '@tanstack/react-router';
import {
  useEditorRef,
  useEditorScrollRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { useEditorStore } from '../stores';
import { FixedToolbarButtons } from './ui/fixed-toolbar-buttons';

export function Editor() {
  const editorScrollRef = useEditorScrollRef();
  const editorFontFamily = useEditorStore((state) => state.editorFontFamily);
  const editorTextIndent = useEditorStore((state) => state.editorTextIndent);

  return (
    <div className="flex h-full flex-col">
      <FixedToolbar className="h-10 min-h-10">
        <FixedToolbarButtons />
      </FixedToolbar>
      <EditorContainer className="scrollbar-none overflow-y-hidden">
        <EditorPrimitive
          ref={editorScrollRef}
          className="editor-font sm:px-[clamp(64px,calc(50%-350px),160px)]"
          style={
            {
              ...editorFontFamily,
              '--editor-text-indent': editorTextIndent,
            } as CSSProperties
          }
        />
      </EditorContainer>
      <EditorValueSync />
      <BlockSelectionRangeSync />
    </div>
  );
}

function EditorValueSync() {
  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const value = useEditorValue();
  const debouncedValue = useDebounce(value, 1500);
  const latestValueRef = useRef(value);
  const savedValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!documentId) return;
    if (savedValueRef.current === debouncedValue) return;

    savedValueRef.current = debouncedValue;
    mainDocumentsPartialUpdate(documentId, {
      value: savedValueRef.current,
    })
      .then((data) => {
        queryClient.setQueryData(
          getMainDocumentsRetrieveQueryKey(documentId),
          data,
        );
      })
      .catch(toastErrorMessage);
  }, [documentId, debouncedValue]);

  useEffect(() => {
    return () => {
      if (!documentId) return;
      if (latestValueRef.current !== savedValueRef.current) {
        mainDocumentsPartialUpdate(documentId, {
          value: latestValueRef.current,
        })
          .then((data) => {
            queryClient.setQueryData(
              getMainDocumentsRetrieveQueryKey(documentId),
              data,
            );
          })
          .catch(toastErrorMessage);
      }
    };
  }, [documentId]);

  return null;
}

function BlockSelectionRangeSync() {
  const editor = useEditorRef();
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  useEffect(() => {
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes({ sort: true });
    const range = editor.api.nodesRange(blocks);
    if (!range) {
      editor.tf.deselect();
      return;
    }

    editor.tf.select(range);
    if (editor.getOption(BlockSelectionPlugin, 'selectedIds') !== selectedIds) {
      editor.setOption(BlockSelectionPlugin, 'selectedIds', selectedIds);
    }
  }, [editor, selectedIds]);

  return null;
}
