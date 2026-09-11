import {
  Button,
  type ButtonProps,
} from '@/components/tiptap/ui-primitive/button';
import type {
  TableOfContentData,
  TableOfContentDataItem,
} from '@tiptap/extension-table-of-contents';
import { TextSelection } from '@tiptap/pm/state';
import { PanelLeftIcon } from 'lucide-react';
import type { Ref } from 'react';
import { useEffect, useRef } from 'react';

function TocItem({ tocItem }: { tocItem: TableOfContentDataItem }) {
  const onTocItemClick = () => {
    if (!tocItem.dom.isConnected) return;

    const tr = tocItem.editor.state.tr;
    tr.setSelection(TextSelection.near(tr.doc.resolve(tocItem.pos)));
    tocItem.editor.view.dispatch(tr);
    tocItem.editor.view.focus();
    tocItem.dom.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      data-active={tocItem.isActive || undefined}
      onClick={onTocItemClick}
      className={`cursor-pointer truncate pr-2 py-1 text-sm ${tocItem.isActive ? 'bg-accent text-primary' : 'text-foreground'}`}
      style={{ paddingLeft: `${0.5 + tocItem.level * 0.75}rem` }}
    >
      {tocItem.textContent}
    </div>
  );
}

export function TableOfContents({ tocData }: { tocData: TableOfContentData }) {
  const tocContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tocContainerRef.current
      ?.querySelector<HTMLElement>('[data-active]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [tocData]);

  if (tocData.length === 0) return null;

  return (
    <div
      ref={tocContainerRef}
      className="h-full overflow-y-auto p-2 scrollbar-thin"
    >
      {tocData.map((tocItem) => (
        <TocItem key={tocItem.id} tocItem={tocItem} />
      ))}
    </div>
  );
}

export function TocButton({
  className,
  children,
  ref,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <Button
      type="button"
      className={className}
      variant="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Table of contents"
      tooltip="Table of contents"
      ref={ref}
      {...props}
    >
      {children || <PanelLeftIcon className="tiptap-button-icon" />}
    </Button>
  );
}
