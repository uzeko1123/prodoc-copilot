'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  useCursorOverlay,
  type CursorData,
  type CursorOverlayState,
} from '@platejs/selection/react';
import { getTableGridAbove } from '@platejs/table';
import { cn } from 'cn';
import { RangeApi } from 'platejs';
import { useEditorRef, usePluginOption, useScrollRef } from 'platejs/react';
import * as React from 'react';

export function CursorOverlay() {
  const { cursors, refresh } = useCursorOverlay();
  const scrollRef = useScrollRef();

  React.useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    scroll.addEventListener('scroll', refresh, { passive: true });
    return () => scroll.removeEventListener('scroll', refresh);
  }, [scrollRef, refresh]);

  return (
    <>
      {cursors.map((cursor) => (
        <Cursor key={cursor.id} {...cursor} />
      ))}
    </>
  );
}

function Cursor({
  id,
  caretPosition,
  data,
  selection,
  selectionRects,
}: CursorOverlayState<CursorData>) {
  const editor = useEditorRef();
  const streaming = usePluginOption(AIChatPlugin, 'streaming');
  const { style, selectionStyle = style } = data ?? ({} as CursorData);
  const isCursor = RangeApi.isCollapsed(selection);

  if (streaming) return null;

  // Skip overlay for multi-cell table selection (table has its own selection UI)
  if (id === 'selection' && selection) {
    const cellEntries = getTableGridAbove(editor, {
      at: selection,
      format: 'cell',
    });

    if (cellEntries.length > 1) {
      return null;
    }
  }

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          key={i}
          className={cn(
            'pointer-events-none absolute z-10',
            id === 'selection' && 'bg-brand/25',
            id === 'selection' && isCursor && 'bg-primary',
          )}
          style={{
            ...selectionStyle,
            ...position,
          }}
        />
      ))}
      {caretPosition && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-0.5',
            id === 'drag' && 'bg-brand w-px',
          )}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}
