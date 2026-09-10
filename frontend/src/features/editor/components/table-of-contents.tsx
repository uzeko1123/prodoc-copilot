import { useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextSelection } from '@tiptap/pm/state';
import {
  getHierarchicalIndexes,
  TableOfContents as TableOfContentsExtension,
  type TableOfContentDataItem,
} from '@tiptap/extension-table-of-contents';
import content from '../data/content.json';

function ToCItem({
  item,
  onItemClick,
}: {
  item: TableOfContentDataItem;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <div
      className={`${item.isActive && !item.isScrolledOver ? 'is-active' : ''} ${
        item.isScrolledOver ? 'is-scrolled-over' : ''
      }`}
      style={{ '--level': item.level } as React.CSSProperties}
    >
      <a
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
        data-item-index={item.itemIndex}
      >
        {item.textContent}
      </a>
    </div>
  );
}

function ToCEmptyState() {
  return (
    <div className="empty-state">
      <p>Start editing your document to see the outline.</p>
    </div>
  );
}

function ToCList({
  items,
  editor,
}: {
  items: TableOfContentDataItem[];
  editor: Editor | null;
}) {
  if (items.length === 0) {
    return <ToCEmptyState />;
  }

  const onItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    if (!editor) return;

    const element = editor.view.dom.querySelector<HTMLElement>(
      `[data-toc-id="${id}"`,
    );
    if (!element) return;

    const pos = editor.view.posAtDOM(element, 0);
    const tr = editor.view.state.tr;

    tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
    editor.view.dispatch(tr);
    editor.view.focus();

    if (history.pushState) {
      history.pushState(null, null, `#${id}`);
    }

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {items.map((item) => (
        <ToCItem key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </>
  );
}

export function TableOfContents() {
  const [items, setItems] = useState<TableOfContentDataItem[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TableOfContentsExtension.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (data) => setItems(data),
      }),
    ],
    content,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="col-group">
      <div className="main">
        <EditorContent editor={editor} />
      </div>
      <div className="sidebar">
        <div className="sidebar-options">
          <div className="label-large">Table of contents</div>
          <div className="table-of-contents">
            <ToCList editor={editor} items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}