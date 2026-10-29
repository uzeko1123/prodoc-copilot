'use client';

// import * as React from 'react';
import {
  useMainDiscussionsList,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { useWorkbenchStore } from '@/stores/workbench';
import { getCommentCount } from '@platejs/comment';
import { useParams } from '@tanstack/react-router';
import { cn } from 'cn';
import type { TCommentText } from 'platejs';
import type { PlateLeafProps } from 'platejs/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';
import { commentPlugin } from '../editor/plugins/comment-kit';

export function CommentLeaf(props: PlateLeafProps<TCommentText>) {
  const { children, leaf } = props;

  const { api, setOption } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginOption(commentPlugin, 'hoverId');
  const activeId = usePluginOption(commentPlugin, 'activeId');

  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.comment.nodeId(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const isResolved =
    discussions?.find((discussion) => discussion.key === currentId)
      ?.is_resolved ?? false;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'bg-highlight/13 transition-colors duration-200',
        (isHover || isActive) && 'bg-highlight/25',
        isOverlapping && 'bg-highlight/25',
        (isHover || isActive) && isOverlapping && 'bg-highlight/45',
        isResolved && !isActive && 'bg-transparent',
      )}
      attributes={{
        ...props.attributes,
        onClick: () => {
          setOption('activeId', currentId ?? null);
          if (currentId)
            useWorkbenchStore.getState().setActiveMainTab('discussion');
        },
        onMouseEnter: () => setOption('hoverId', currentId ?? null),
        onMouseLeave: () => setOption('hoverId', null),
      }}
    >
      {children}
    </PlateLeaf>
  );
}
