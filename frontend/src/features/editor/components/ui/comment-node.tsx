'use client';

// import * as React from 'react';
import { commentPlugin } from '@/features/editor/components/editor/plugins/comment-kit';
import { useWorkbenchStore } from '@/stores/workbench';
import { getCommentCount } from '@platejs/comment';
import { cn } from 'cn';
import type { TCommentText } from 'platejs';
import type { PlateLeafProps } from 'platejs/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';

export function CommentLeaf(props: PlateLeafProps<TCommentText>) {
  const { children, leaf } = props;

  const { api, setOption } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginOption(commentPlugin, 'hoverId');
  const activeId = usePluginOption(commentPlugin, 'activeId');

  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.comment.nodeId(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'bg-highlight/13 transition-colors duration-200',
        (isHover || isActive) && 'bg-highlight/25',
        isOverlapping && 'bg-highlight/25',
        (isHover || isActive) && isOverlapping && 'bg-highlight/45',
      )}
      attributes={{
        ...props.attributes,
        onClick: () => {
          setOption('activeId', currentId ?? null);
          if (currentId)
            useWorkbenchStore.getState().setActiveMainTab('comment');
        },
        onMouseEnter: () => setOption('hoverId', currentId ?? null),
        onMouseLeave: () => setOption('hoverId', null),
      }}
    >
      {children}
    </PlateLeaf>
  );
}
