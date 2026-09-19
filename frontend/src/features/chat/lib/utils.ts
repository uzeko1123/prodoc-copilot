import { NodeApi, type TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export function getSelectionText(
  editor: PlateEditor,
  selection?: TRange | null,
) {
  try {
    return editor.api
      .fragment(selection)
      .map((node) => NodeApi.string(node).trim())
      .filter((text) => text !== '')
      .join('\n');
  } catch {
    return '';
  }
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
});

export function formatTokens(count: number) {
  return compactFormatter.format(count);
}
