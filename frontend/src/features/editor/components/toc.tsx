'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { isHeading, type Heading } from '@platejs/toc';
import { heightToTop, TocPlugin } from '@platejs/toc/react';
import { cva } from 'class-variance-authority';
import { ListTreeIcon } from 'lucide-react';
import { ElementApi, NodeApi } from 'platejs';
import {
  useEditorMounted,
  useEditorPlugin,
  usePluginOption,
  useScrollRef,
  useValueVersion,
  type PlateEditor,
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

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const getHeadingList = (editor: PlateEditor): Heading[] => {
  const options = editor.getOptions(TocPlugin);
  if (options.queryHeading) return options.queryHeading(editor);
  const headingList: Heading[] = [];
  const values = editor.api.nodes({
    at: [],
    match: (n) => isHeading(n),
  });
  if (!values) return [];
  for (const [node, path] of values) {
    if (!ElementApi.isElement(node)) continue;
    const { id, type } = node;
    const title = NodeApi.string(node);
    const depth = headingDepth[type];
    if (typeof id === 'string' && title && depth) {
      headingList.push({ id, depth, path, title, type });
    }
  }
  return headingList;
};

export function ToC() {
  const { editor } = useEditorPlugin(TocPlugin);
  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const topOffset = usePluginOption(TocPlugin, 'topOffset');

  const version = useDebounce(useValueVersion() ?? 0);
  const headingList = useMemo(
    () => getHeadingList(editor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, version],
  );

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
    const scroll = scrollRef.current;
    if (!scroll) return;

    const updateActiveHeadingId = () => {
      const scrollRectTopThreshold =
        scroll.getBoundingClientRect().top + topOffset;
      let currentHeadingId: string | null = null;
      for (const heading of headingListFiltered) {
        const node = NodeApi.get(editor, heading.path);
        const el = node ? editor.api.toDOMNode(node) : undefined;
        if (!el) continue;
        if (el.getBoundingClientRect().top < scrollRectTopThreshold) {
          currentHeadingId = heading.id;
        } else break;
      }
      setActiveHeadingId(
        currentHeadingId ?? headingListFiltered[0]?.id ?? null,
      );
    };
    updateActiveHeadingId();

    let requestAnimationFrameId = 0;
    const onScroll = () => {
      if (requestAnimationFrameId) return;
      requestAnimationFrameId = requestAnimationFrame(() => {
        requestAnimationFrameId = 0;
        updateActiveHeadingId();
      });
    };
    scroll.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(requestAnimationFrameId);
      scroll.removeEventListener('scroll', onScroll);
    };
  }, [editor, editorMounted, scrollRef, topOffset, headingListFiltered]);

  useEffect(() => {
    if (!activeHeadingId) return;
    const activeTocButton = tocButtonRefs.current.get(activeHeadingId);
    activeTocButton?.scrollIntoView({ block: 'nearest' });
  }, [activeHeadingId]);

  const onClick = (item: Heading) => {
    const node = NodeApi.get(editor, item.path);
    const el = node ? editor.api.toDOMNode(node) : undefined;
    if (!el) return;
    scrollRef.current?.scrollTo({
      behavior: 'smooth',
      top: heightToTop(el, scrollRef) - topOffset,
    });
    editor.tf.navigation.flashTarget({
      target: { type: 'node', path: item.path },
    });
  };

  return (
    <nav className="h-full scroll-py-10 overflow-y-auto p-2">
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
          onClick={() => onClick(heading)}
          aria-current={heading.id === activeHeadingId ? 'location' : undefined}
        >
          {heading.title}
        </Button>
      ))}
    </nav>
  );
}
