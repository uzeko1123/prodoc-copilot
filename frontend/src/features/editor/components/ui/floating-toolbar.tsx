'use client';

import { Toolbar } from '@/components/shadcn/ui/toolbar';
import {
  flip,
  getSelectionBoundingClientRect,
  mergeClientRects,
  offset,
  shift,
  useFloatingToolbar,
  useFloatingToolbarState,
  type FloatingToolbarState,
} from '@platejs/floating';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useComposedRef } from '@udecode/cn';
import { cn } from 'cn';
import { KEYS } from 'platejs';
import {
  useEditorContainerRef,
  useEditorId,
  useEditorMounted,
  useEditorRef,
  useEventEditorValue,
  usePluginOption,
  useScrollRef,
} from 'platejs/react';
import * as React from 'react';

export function FloatingToolbar({
  children,
  className,
  state,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  state?: FloatingToolbarState;
}) {
  const editor = useEditorRef();
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue('focus');
  const isFloatingLinkOpen = !!usePluginOption({ key: KEYS.link }, 'mode');
  const isAIChatOpen = usePluginOption({ key: KEYS.aiChat }, 'open');
  const selectedBlockIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');
  const isBlockSelected = !!selectedBlockIds && selectedBlockIds.size > 0;

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen || isAIChatOpen,
    ...state,
    floatingOptions: {
      getBoundingClientRect: () => {
        if (isBlockSelected && !editor.api.isExpanded()) {
          const blockRects = editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.getNodes({ sort: true })
            .map(([node]) =>
              editor.api.toDOMNode(node)!.getBoundingClientRect(),
            );
          if (blockRects.length > 0) {
            return { ...mergeClientRects(blockRects), width: 0 };
          }
        }
        return getSelectionBoundingClientRect(editor);
      },
      placement: 'top',
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: ['bottom'],
          padding: 12,
        }),
        shift({
          mainAxis: true,
          crossAxis: false,
          padding: 12,
        }),
      ],
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar({
    ...floatingToolbarState,
    ...(isBlockSelected && {
      selectionExpanded: true,
      selectionText: floatingToolbarState.selectionText || ' ',
    }),
  });

  const ref = useComposedRef<HTMLDivElement>(props.ref, floatingRef);

  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const containerRef = useEditorContainerRef();
  const { update } = floatingToolbarState.floating;

  React.useEffect(() => {
    if (!editorMounted) return;
    const scroll = scrollRef.current;
    if (!scroll) return;

    scroll.addEventListener('scroll', update, { passive: true });
    return () => scroll.removeEventListener('scroll', update);
  }, [editorMounted, scrollRef, update]);

  React.useEffect(() => {
    if (!editorMounted) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => update());
    observer.observe(container);
    return () => observer.disconnect();
  }, [editorMounted, containerRef, update]);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        {...props}
        {...rootProps}
        ref={ref}
        className={cn(
          'scrollbar-hide bg-popover absolute z-50 overflow-x-auto rounded-md border p-1 whitespace-nowrap opacity-100 shadow-md print:hidden',
          'max-w-[80vw]',
          className,
        )}
      >
        {children}
      </Toolbar>
    </div>
  );
}
