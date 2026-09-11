import { useEditorStore } from '../stores';
import { Button } from '@/components/tiptap/ui-primitive/button';
import { BubbleMenu as BubbleMenu_ } from '@tiptap/react/menus';

export function BubbleMenu() {
  const editor = useEditorStore((state) => state.editor);

  if (!editor) return null;
  return (
    <BubbleMenu_ editor={editor}>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          const { from, to } = editor.state.selection;
          console.log({ from, to });
          const text = editor.state.doc.textBetween(from, to, '\n');
          console.log(text);
        }}
      >
        捕获快照
      </Button>
    </BubbleMenu_>
  );
}
