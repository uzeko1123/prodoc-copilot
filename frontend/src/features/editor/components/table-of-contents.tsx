import {
  Button,
  type ButtonProps,
} from '@/components/tiptap/ui-primitive/button';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { TextSelection } from '@tiptap/pm/state';
import { PanelLeftIcon } from 'lucide-react';
import type { RefObject } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

export function TableOfContents({
  items,
  scrollContainerRef,
}: {
  items: TableOfContentData;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={listRef} className="h-full overflow-y-auto p-2 scrollbar-thin">
      {items.map((item) => (
        <div
          key={item.id}
          data-active={item.isActive || undefined}
          onClick={() => {
            const editor = item.editor;
            const element = editor.view.dom.querySelector<HTMLElement>(
              `[data-toc-id="${item.id}"]`,
            );

            if (!element) {
              return;
            }

            const transaction = editor.view.state.tr;
            transaction.setSelection(
              new TextSelection(
                transaction.doc.resolve(editor.view.posAtDOM(element, 0)),
              ),
            );
            editor.view.dispatch(transaction);
            editor.view.focus();

            const container = scrollContainerRef.current;

            if (container) {
              container.scrollTo({
                top:
                  container.scrollTop +
                  element.getBoundingClientRect().top -
                  container.getBoundingClientRect().top,
                behavior: 'smooth',
              });
            }
          }}
          className={`cursor-pointer truncate pr-2 py-1 text-sm ${item.isActive ? 'bg-accent text-primary' : 'text-foreground'}`}
          style={{ paddingLeft: `${0.5 + item.level * 0.75}rem` }}
        >
          {item.textContent}
        </div>
      ))}
    </div>
  );
}

export const TocButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isOpen: boolean; onToggle: () => void }
>(({ isOpen, onToggle, className, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      variant="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Table of contents"
      aria-expanded={isOpen}
      tooltip="Table of contents"
      data-active-state={isOpen ? 'on' : 'off'}
      onClick={onToggle}
      ref={ref}
      {...props}
    >
      <PanelLeftIcon className="tiptap-button-icon" />
    </Button>
  );
});
