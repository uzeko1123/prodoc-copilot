'use client';

// import * as React from 'react';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { commentPlugin } from '@/features/comment/components/editor/plugins/comment-kit';
import { MessageSquareTextIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';

export function CommentToolbarButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.getTransforms(commentPlugin).comment.setDraft();
      }}
      data-plate-prevent-overlay
      tooltip="评论"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
