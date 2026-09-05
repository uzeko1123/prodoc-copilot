'use client';

// --- Stores ---
import { useTableOfContentsStore } from './table-of-contents-store';

import type { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useEffect } from 'react';

const SCROLL_CONTAINER_SELECTOR = '.simple-editor-content';

/** 重算当前视口内标题为 active（对齐容器顶部线），仅在有变化时写回 store。 */
function updateActiveScrollspy(container: HTMLElement) {
  const { items, setItems } = useTableOfContentsStore.getState();
  if (items.length === 0) return;

  const containerTop = container.getBoundingClientRect().top;
  let activeIndex = -1;
  items.forEach((item, index) => {
    if (item.dom?.isConnected && item.dom.getBoundingClientRect().top <= containerTop) {
      activeIndex = index;
    }
  });

  let changed = false;
  const next = items.map((item, index) => {
    const isActive = index === activeIndex;
    if (item.isActive === isActive) return item;
    changed = true;
    return { ...item, isActive };
  });
  if (changed) setItems(next);
}

export function TableOfContents() {
  const items = useTableOfContentsStore((state) => state.items);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
    if (!container) return;

    const onScroll = () => updateActiveScrollspy(container);
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => container.removeEventListener('scroll', onScroll);
  }, [items]);

  if (items.length === 0) return null;

  const handleItemClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    item: TableOfContentDataItem,
  ) => {
    event.preventDefault();
    if (item.editor.isDestroyed || !item.dom) return;
    item.dom.scrollIntoView();
    item.editor.chain().focus().setTextSelection(item.pos + 1).run();
  };

  return (
    <ul
      className="table-of-contents"
      style={{ margin: 0, padding: '0.5rem 0.375rem', listStyle: 'none', fontSize: '0.8125rem' }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(event) => handleItemClick(event, item)}
            style={{
              display: 'block',
              padding: '0.25rem 0.375rem',
              paddingLeft: `${0.375 + (item.originalLevel - 1) * 0.75}rem`,
              color: 'inherit',
              backgroundColor: item.isActive ? 'var(--tt-gray-light-a-200, rgba(0, 0, 0, 0.08))' : undefined,
              fontWeight: item.isActive ? 600 : undefined,
              textDecoration: 'none',
            }}
          >
            {item.textContent}
          </a>
        </li>
      ))}
    </ul>
  );
}
