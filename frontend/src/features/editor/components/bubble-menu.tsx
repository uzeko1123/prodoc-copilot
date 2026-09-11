import { useContextStore, useEditorStore } from '../stores';
import { Button } from '@/components/tiptap/ui-primitive/button';
import { BubbleMenu as BubbleMenu_ } from '@tiptap/react/menus';

export function BubbleMenu() {
  const editor = useEditorStore((state) => state.editor);
  const setContext = useContextStore((state) => state.setContext);

  if (!editor) return null;
  return (
    <BubbleMenu_>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          const { from, to } = editor.state.selection;
          setContext('ai', { from, to });
        }}
      >
        AI
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const { from, to } = editor.state.selection;
          setContext('ai', { from, to });
        }}
      >
        Comment
      </Button>
    </BubbleMenu_>
  );
}
