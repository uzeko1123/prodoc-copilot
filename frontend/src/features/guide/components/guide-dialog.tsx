import type { Guide } from '@/api/gen/models';
import { EditorStatic } from '@/components/shadcn/ui/editor-static';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BaseEditorKit } from '@/features/editor/components/editor/editor-base-kit';
import type { Value } from 'platejs';
import { createSlateEditor } from 'platejs';
import * as React from 'react';

export function GuideDialog({
  guide,
  open,
  onOpenChange,
}: {
  guide: Guide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editor = React.useMemo(
    () => createSlateEditor({ plugins: [...BaseEditorKit] }),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{guide.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto rounded-lg border">
          <EditorStatic
            editor={editor}
            value={guide.value as Value}
            className="editor-font sm:px-12"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
