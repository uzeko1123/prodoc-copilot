import { useEditorStore } from '../stores';
import { Button } from '@/components/tiptap/ui-primitive/button';
import {
  Toolbar as Toolbar_,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap/ui-primitive/toolbar';
import { useWorkbenchStore } from '@/stores/workbench';
import { BubbleMenu as BubbleMenu_ } from '@tiptap/react/menus';
import { MessageSquareIcon, SparklesIcon } from 'lucide-react';

export function BubbleMenu({
  scrollTarget,
}: {
  scrollTarget: HTMLElement | null;
}) {
  const editor = useEditorStore((state) => state.editor);
  const setActiveTab = useWorkbenchStore((state) => state.setActiveTab);

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
            onClick={() => setActiveTab('comment')}
          >
            <MessageSquareIcon className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
      </Toolbar_>
    </BubbleMenu_>
  );
}
