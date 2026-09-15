'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  heightToTop,
  TocPlugin,
  useTocSideBar,
  useTocSideBarState,
} from '@platejs/toc/react';
import { cva } from 'class-variance-authority';
import { NodeApi } from 'platejs';
import {
  useEditorMounted,
  useEditorPlugin,
  useEditorScrollRef,
} from 'platejs/react';
import { useEffect, useMemo, useState } from 'react';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium',
  {
    variants: {
      active: {
        false: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        true: 'bg-accent text-foreground decoration-foreground',
      },
      depth: {
        1: 'pl-2',
        2: 'pl-5',
        3: 'pl-8',
      },
    },
  },
);

export function ToC() {
  const { editor, getOptions } = useEditorPlugin(TocPlugin);
  const { topOffset } = getOptions();

  const editorMounted = useEditorMounted();
  const editorScrollRef = useEditorScrollRef();

  const tocSideBarState = useTocSideBarState({ topOffset });
  const { navProps, onContentClick } = useTocSideBar(tocSideBarState);
  const { headingList } = tocSideBarState;
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  const headingListFiltered = useMemo(() => {
    return headingList.filter((item) => item.depth <= 3);
  }, [headingList]);

  useEffect(() => {
    if (!editorMounted) return;
    const editorScroll = editorScrollRef.current;
    if (!editorScroll) return;

    const updateActiveContentId = () => {
      let currentHeadingId: string | null = null;
      for (const heading of headingListFiltered) {
        const node = NodeApi.get(editor, heading.path);
        if (!node) continue;
        const el = editor.api.toDOMNode(node);
        if (!el) continue;
        if (
          el.getBoundingClientRect().top <
          editorScroll.getBoundingClientRect().top + topOffset
        ) {
          currentHeadingId = heading.id;
        } else break;
      }
      setActiveContentId(
        currentHeadingId ?? headingListFiltered[0]?.id ?? null,
      );
    };

    editorScroll.addEventListener('scroll', updateActiveContentId);
    updateActiveContentId();
    return () => {
      editorScroll.removeEventListener('scroll', updateActiveContentId);
    };
  }, [editor, topOffset, editorMounted, editorScrollRef, headingListFiltered]);

  const onClick = (...args: Parameters<typeof onContentClick>) => {
    const [, item, behavior] = args;
    const node = NodeApi.get(editor, item.path);
    if (!node) return;
    const el = editor.api.toDOMNode(node);
    if (!el) return;
    editorScrollRef.current?.scrollTo({
      behavior,
      top: heightToTop(el, editorScrollRef) - topOffset,
    });

    onContentClick(...args);
  };

  return (
    <nav
      {...navProps}
      className="scrollbar-thumb-border h-full scrollbar-thin overflow-y-auto p-2"
    >
      {headingListFiltered.length > 0 ? (
        headingListFiltered.map((heading) => (
          <Button
            key={heading.id}
            variant="ghost"
            className={headingItemVariants({
              active: heading.id === activeContentId,
              depth: heading.depth as 1 | 2 | 3,
            })}
            onClick={(e) => onClick(e, heading, 'smooth')}
            aria-current={
              heading.id === activeContentId ? 'location' : undefined
            }
          >
            {heading.title}
          </Button>
        ))
      ) : (
        <div className="text-sm text-gray-500">
          Create a heading to display the table of contents.
        </div>
      )}
    </nav>
  );
}
