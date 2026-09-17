'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import {
  heightToTop,
  TocPlugin,
  useTocSideBar,
  useTocSideBarState,
} from '@platejs/toc/react';
import { cva } from 'class-variance-authority';
import { ListTreeIcon } from 'lucide-react';
import { NodeApi } from 'platejs';
import {
  useEditorMounted,
  useEditorPlugin,
  useEditorScrollRef,
} from 'platejs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const tocButtonRefs = useRef<Map<string, HTMLButtonElement | null>>(
    new Map(),
  );
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const setTocButtonRefs = (id: string, el: HTMLButtonElement | null) => {
    if (el) {
      tocButtonRefs.current.set(id, el);
    } else {
      tocButtonRefs.current.delete(id);
    }
  };

  const headingListFiltered = useMemo(() => {
    return headingList.filter((item) => item.depth <= 3);
  }, [headingList]);

  useEffect(() => {
    if (!editorMounted) return;
    const editorScroll = editorScrollRef.current;
    if (!editorScroll) return;

    const updateActiveHeadingId = () => {
      let currentHeadingId: string | null = null;
      for (const heading of headingListFiltered) {
        const node = NodeApi.get(editor, heading.path);
        const el = node ? editor.api.toDOMNode(node) : undefined;
        if (!el) continue;
        if (
          el.getBoundingClientRect().top <
          editorScroll.getBoundingClientRect().top + topOffset
        ) {
          currentHeadingId = heading.id;
        } else break;
      }
      setActiveHeadingId(
        currentHeadingId ?? headingListFiltered[0]?.id ?? null,
      );
    };
    updateActiveHeadingId();

    editorScroll.addEventListener('scroll', updateActiveHeadingId);
    return () => {
      editorScroll.removeEventListener('scroll', updateActiveHeadingId);
    };
  }, [editor, topOffset, editorMounted, editorScrollRef, headingListFiltered]);

  useEffect(() => {
    if (!activeHeadingId) return;
    const activeTocButton = tocButtonRefs.current.get(activeHeadingId);
    activeTocButton?.scrollIntoView({ block: 'nearest' });
  }, [activeHeadingId]);

  const onClick = (...args: Parameters<typeof onContentClick>) => {
    const [, item, behavior] = args;
    const node = NodeApi.get(editor, item.path);
    const el = node ? editor.api.toDOMNode(node) : undefined;
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
      className="scrollbar-thumb-border h-full scroll-py-10 scrollbar-thin overflow-y-auto p-2"
    >
      {headingListFiltered.length === 0 && (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTreeIcon />
            </EmptyMedia>
            <EmptyTitle>No headings</EmptyTitle>
            <EmptyDescription>
              Create a heading to display the table of contents
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {headingListFiltered.map((heading) => (
        <Button
          key={heading.id}
          variant="ghost"
          className={headingItemVariants({
            active: heading.id === activeHeadingId,
            depth: heading.depth as 1 | 2 | 3,
          })}
          ref={(el) => setTocButtonRefs(heading.id, el)}
          onClick={(e) => onClick(e, heading, 'smooth')}
          aria-current={heading.id === activeHeadingId ? 'location' : undefined}
        >
          {heading.title}
        </Button>
      ))}
    </nav>
  );
}
