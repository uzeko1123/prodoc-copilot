import { useEditorStore, useContextStore } from '../stores';
import { Button } from '@/components/tiptap/ui-primitive/button';
import {
  Toolbar as Toolbar_,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap/ui-primitive/toolbar';
import { useCommentStore } from '@/features/comment/stores';
import { useWorkbenchStore } from '@/stores/workbench';
import { BubbleMenu as BubbleMenu_ } from '@tiptap/react/menus';
import { MessageSquareIcon, SparklesIcon } from 'lucide-react';

export function BubbleMenu({
  scrollTarget,
}: {
  scrollTarget: HTMLElement | null;
}) {
  const editor = useEditorStore((state) => state.editor);
  const range = useContextStore((state) => state.selection);
  const setActiveTab = useWorkbenchStore((state) => state.setActiveTab);
  const addComment = useCommentStore((state) => state.addComment);
  const setActiveCommentId = useCommentStore(
    (state) => state.setActiveCommentId,
  );

  const handleCreateComment = () => {
    setActiveTab('comment');
    if (!editor || !range) return;
    const text = editor.state.doc
      .textBetween(range.from, range.to, '\n')
      .trim();
    if (!text) return;
    const id = crypto.randomUUID();
    addComment({ id, range, text, createdAt: Date.now() });
    setActiveCommentId(id);
    editor.chain().focus().setCommentMark({ id }).run();
  };

  if (!editor) return;

  return (
    <BubbleMenu_
      options={scrollTarget ? { scrollTarget } : undefined}
      resizeDelay={0}
    >
      <Toolbar_ variant="floating">
        <ToolbarGroup>
          <Button
            type="button"
            variant="ghost"
            tooltip="AI"
            onClick={() => setActiveTab('chat')}
          >
            <SparklesIcon className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <Button
            type="button"
            variant="ghost"
            tooltip="Comment"
            disabled={!range}
            onClick={handleCreateComment}
          >
            <MessageSquareIcon className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
      </Toolbar_>
    </BubbleMenu_>
  );
}
