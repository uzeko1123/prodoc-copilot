import { commentPlugin } from '@/features/editor/components/editor/plugins/comment-kit';
import { suggestionPlugin } from '@/features/editor/components/editor/plugins/suggestion-kit';
import type { Path } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export function focusFragment(
  editor: PlateEditor,
  {
    id,
    kind,
    path,
  }: { id: string; kind: 'discussion' | 'suggestion'; path: Path },
) {
  editor.tf.select(path);
  editor.tf.focus({ edge: 'start' });

  const node = editor.api.node(path);
  const element = node ? editor.api.toDOMNode(node[0]) : undefined;
  element?.scrollIntoView({ block: 'center', behavior: 'smooth' });

  if (kind === 'discussion') {
    editor.setOption(commentPlugin, 'activeId', id);
  } else {
    editor.setOption(suggestionPlugin, 'activeId', id);
  }
}
