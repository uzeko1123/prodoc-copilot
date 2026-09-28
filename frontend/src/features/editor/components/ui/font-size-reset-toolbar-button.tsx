'use client';

import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { FontSizePlugin } from '@platejs/basic-styles/react';
import { RemoveFormattingIcon } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorPlugin } from 'platejs/react';

export function FontSizeResetToolbarButton() {
  const { editor } = useEditorPlugin(FontSizePlugin);

  return (
    <ToolbarButton
      tooltip="Reset font size"
      onClick={() => {
        editor.tf.removeMarks(KEYS.fontSize);
        editor.tf.focus();
      }}
    >
      <RemoveFormattingIcon />
    </ToolbarButton>
  );
}
