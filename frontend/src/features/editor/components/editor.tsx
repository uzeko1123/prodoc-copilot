import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/shadcn/editor/editor-kit';
import { Editor as Editor_, EditorContainer } from '@/components/shadcn/ui/editor';

export function Editor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor_ />
      </EditorContainer>
    </Plate>
  );
}
