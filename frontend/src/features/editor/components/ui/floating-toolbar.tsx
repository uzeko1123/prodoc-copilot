'use client';

import { Toolbar } from '@/components/shadcn/ui/toolbar';
import {
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
  type FloatingToolbarState,
} from '@platejs/floating';
import { useComposedRef } from '@udecode/cn';
import { cn } from 'cn';
import { KEYS } from 'platejs';
import {
  useEditorId,
  useEditorScrollRef,
  useEventEditorValue,
  usePluginOption,
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
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue('focus');
  const isFloatingLinkOpen = !!usePluginOption({ key: KEYS.link }, 'mode');
  const isAIChatOpen = usePluginOption({ key: KEYS.aiChat }, 'open');

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen || isAIChatOpen,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      placement: 'top',
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(props.ref, floatingRef);

  const editorScrollRef = useEditorScrollRef();

  React.useEffect(() => {
    const editorScroll = editorScrollRef.current;
    if (!editorScroll) return;

    editorScroll.addEventListener(
      'scroll',
      floatingToolbarState.floating.update,
      { passive: true },
    );
    return () =>
      editorScroll.removeEventListener(
        'scroll',
        floatingToolbarState.floating.update,
      );
  }, [editorScrollRef, floatingToolbarState.floating.update]);

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
