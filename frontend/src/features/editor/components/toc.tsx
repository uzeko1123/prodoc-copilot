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
import { useEditorPlugin, useEditorScrollRef } from 'platejs/react';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium underline decoration-[0.5px] underline-offset-4',
  {
    variants: {
      active: {
        false: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        true: 'bg-accent text-foreground decoration-foreground',
      },
      depth: {
        1: 'pl-0.5',
        2: 'pl-[26px]',
        3: 'pl-[50px]',
      },
    },
  },
);

export function ToC() {
  const { editor, getOptions } = useEditorPlugin(TocPlugin);
  const { topOffset } = getOptions();

  const tocSideBarState = useTocSideBarState({ topOffset });
  const { navProps, onContentClick } = useTocSideBar(tocSideBarState);
  const { activeContentId, headingList } = tocSideBarState;

  const editorScrollRef = useEditorScrollRef();
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
      {headingList.length > 0 ? (
        headingList.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={headingItemVariants({
              active: item.id === activeContentId,
              depth: item.depth as 1 | 2 | 3,
            })}
            onClick={(e) => onClick(e, item, 'smooth')}
            aria-current={item.id === activeContentId ? 'location' : undefined}
          >
            {item.title}
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
