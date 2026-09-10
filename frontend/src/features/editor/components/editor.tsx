// --- Icons ---
// --- Shadcn UI ---
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/resizable';
import { ArrowLeftIcon } from '@/components/tiptap/icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap/icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap/icons/link-icon';
import '@/components/tiptap/node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap/node/code-block-node/code-block-node.scss';
import '@/components/tiptap/node/heading-node/heading-node.scss';
import { HorizontalRule } from '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap/node/image-node/image-node.scss';
// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap/node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap/node/list-node/list-node.scss';
import '@/components/tiptap/node/paragraph-node/paragraph-node.scss';
import content from '@/components/tiptap/templates/simple/data/content.json';
// --- Styles ---
// import '@/components/tiptap/templates/simple/simple-editor.scss';
// --- Components ---
import { ThemeToggle } from '@/components/tiptap/templates/simple/theme-toggle';
// --- UI Primitives ---
import { Button } from '@/components/tiptap/ui-primitive/button';
import { Spacer } from '@/components/tiptap/ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap/ui-primitive/toolbar';
import { BlockquoteButton } from '@/components/tiptap/ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap/ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/tiptap/ui/color-highlight-popover';
// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap/ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap/ui/image-upload-button';
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from '@/components/tiptap/ui/link-popover';
import { ListDropdownMenu } from '@/components/tiptap/ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap/ui/mark-button';
import {
  SearchAndReplace,
  SearchAndReplaceButton,
} from '@/components/tiptap/ui/search-and-replace';
import { TextAlignButton } from '@/components/tiptap/ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap/ui/undo-redo-button';
import { useCursorVisibility } from '@/hooks/tiptap/use-cursor-visibility';
// --- Hooks ---
import { useIsBreakpoint } from '@/hooks/tiptap/use-is-breakpoint';
import { useWindowSize } from '@/hooks/tiptap/use-window-size';
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap/utils';
import { FindAndReplace } from '@tiptap/extension-find-and-replace';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import {
  TableOfContents,
  getHierarchicalIndexes,
} from '@tiptap/extension-table-of-contents';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
// --- Lib ---
import { useCallback, useEffect, useRef, useState } from 'react';

const SEARCH_AND_REPLACE_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  block: 'center',
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onSearchAndReplaceClick,
  isSearchAndReplaceOpen,
  searchAndReplaceButtonRef,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onSearchAndReplaceClick: () => void;
  isSearchAndReplaceOpen: boolean;
  searchAndReplaceButtonRef: React.RefObject<HTMLButtonElement | null>;
  isMobile: boolean;
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={['bulletList', 'orderedList', 'taskList']}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <SearchAndReplaceButton
          ref={searchAndReplaceButtonRef}
          aria-expanded={isSearchAndReplaceOpen}
          data-active-state={isSearchAndReplaceOpen ? 'on' : 'off'}
          onClick={onSearchAndReplaceClick}
        />
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function Editor() {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>(
    'main',
  );
  const [isSearchAndReplaceOpen, setIsSearchAndReplaceOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchAndReplaceButtonRef = useRef<HTMLButtonElement>(null);

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
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {},
      }),
    ],
    content,
  });

  const rect = useCursorVisibility({
    editor,
    // eslint-disable-next-line react-hooks/refs
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  const openSearchAndReplace = useCallback(() => {
    setMobileView('main');
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

  return (
    <div className="flex flex-col h-full">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              onSearchAndReplaceClick={toggleSearchAndReplace}
              isSearchAndReplaceOpen={isSearchAndReplaceOpen}
              searchAndReplaceButtonRef={searchAndReplaceButtonRef}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            collapsible
            defaultSize="20%"
            minSize="10%"
          ></ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="90%" minSize="80%" className="relative">
            <div className="absolute top-2 right-2 z-10">
              <SearchAndReplace
                open={isSearchAndReplaceOpen}
                onOpen={openSearchAndReplace}
                onClose={closeSearchAndReplace}
                scrollIntoViewOptions={SEARCH_AND_REPLACE_SCROLL_OPTIONS}
              />
            </div>
            <div className="p-12 pb-[30vh]">
              <EditorContent editor={editor} role="presentation" />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </EditorContext.Provider>
    </div>
  );
}
