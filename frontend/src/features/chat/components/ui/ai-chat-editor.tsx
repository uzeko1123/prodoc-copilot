'use client';

import { BaseEditorKit } from '@/components/shadcn/editor/editor-base-kit';
import { EditorStatic } from '@/components/shadcn/ui/editor-static';
import { useAIChatEditor } from '@platejs/ai/react';
import { usePlateEditor } from 'platejs/react';
import * as React from 'react';

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
    // TODO
    // 静态只读渲染无需导航反馈；避免流式时元素对象重建引发的
    // useNavigationHighlight -> useEditorSelector atom 重建级联
    navigationFeedback: false,
  });

  const value = useAIChatEditor(aiEditor, content);

  return <EditorStatic variant="ai" editor={aiEditor} value={value} />;
});
