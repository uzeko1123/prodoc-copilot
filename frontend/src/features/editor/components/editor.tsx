import { TableOfContents } from './table-of-contents';
import { Toolbar } from './toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/resizable';
import '@/components/tiptap/node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap/node/code-block-node/code-block-node.scss';
import '@/components/tiptap/node/heading-node/heading-node.scss';
import { HorizontalRule } from '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap/node/image-node/image-node.scss';
import { ImageUploadNode } from '@/components/tiptap/node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap/node/list-node/list-node.scss';
import '@/components/tiptap/node/paragraph-node/paragraph-node.scss';
import content from '@/components/tiptap/templates/simple/data/content.json';
import { SearchAndReplace } from '@/components/tiptap/ui/search-and-replace';
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap/utils';
import { FindAndReplace } from '@tiptap/extension-find-and-replace';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import {
  TableOfContents as TableOfContentsExtension,
  getHierarchicalIndexes,
} from '@tiptap/extension-table-of-contents';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useCallback, useRef, useState } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';

const SEARCH_AND_REPLACE_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  block: 'center',
};

export function Editor() {
  const searchAndReplaceButtonRef = useRef<HTMLButtonElement>(null);
  const [isSearchAndReplaceOpen, setIsSearchAndReplaceOpen] = useState(false);
  const tocPanelRef = useRef<PanelImperativeHandle | null>(null);
  const tocScrollContainerRef = useRef<HTMLDivElement>(null);
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [tocItems, setTocItems] = useState<TableOfContentData>([]);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      FindAndReplace.configure({
        searchDebounceMs: 500,
        injectCSS: false,
      }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
      // eslint-disable-next-line react-hooks/refs
      TableOfContentsExtension.configure({
        getIndex: getHierarchicalIndexes,
        scrollParent: () => tocScrollContainerRef.current ?? window,
        onUpdate(content) {
          setTocItems(content);
        },
      }),
    ],
    content,
  });

  const openSearchAndReplace = useCallback(() => {
    setIsSearchAndReplaceOpen(true);
  }, []);

  const closeSearchAndReplace = useCallback(() => {
    setIsSearchAndReplaceOpen(false);
    searchAndReplaceButtonRef.current?.focus();
  }, []);

  const toggleSearchAndReplace = useCallback(() => {
    if (isSearchAndReplaceOpen) {
      closeSearchAndReplace();
      return;
    }

    openSearchAndReplace();
  }, [closeSearchAndReplace, isSearchAndReplaceOpen, openSearchAndReplace]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const openToc = useCallback(() => {
    tocPanelRef.current?.expand();
    setIsTocOpen(true);
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const closeToc = useCallback(() => {
    tocPanelRef.current?.collapse();
    setIsTocOpen(false);
  }, []);

  // Keep `isTocOpen` in sync with the panel's real state — the panel can
  // also be collapsed/expanded by dragging the ResizableHandle.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const syncTocState = useCallback(() => {
    const panel = tocPanelRef.current;
    setIsTocOpen(panel ? !panel.isCollapsed() : false);
  }, []);

  const toggleToc = useCallback(() => {
    if (isTocOpen) {
      closeToc();
      return;
    }

    openToc();
  }, [closeToc, isTocOpen, openToc]);

  return (
    <div className="flex flex-col h-full">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          searchAndReplaceButtonRef={searchAndReplaceButtonRef}
          isSearchAndReplaceOpen={isSearchAndReplaceOpen}
          onSearchAndReplaceClick={toggleSearchAndReplace}
          isTocOpen={isTocOpen}
          onTocToggle={toggleToc}
        />

        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            collapsible
            defaultSize="25%"
            minSize="15%"
            panelRef={tocPanelRef}
            onResize={syncTocState}
          >
            <TableOfContents
              items={tocItems}
              scrollContainerRef={tocScrollContainerRef}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="75%" minSize="70%" className="relative">
            <div
              ref={tocScrollContainerRef}
              className="h-full overflow-y-auto p-12 pb-[30vh] scrollbar-thin"
            >
              <EditorContent editor={editor} role="presentation" />
            </div>
            <div className="absolute top-2 right-2">
              <SearchAndReplace
                open={isSearchAndReplaceOpen}
                onOpen={openSearchAndReplace}
                onClose={closeSearchAndReplace}
                scrollIntoViewOptions={SEARCH_AND_REPLACE_SCROLL_OPTIONS}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </EditorContext.Provider>
    </div>
  );
}
